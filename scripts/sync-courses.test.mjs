import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { syncCourses } from "./sync-courses.mjs";

test("prune obsolete assets only after successful synchronization", async () => {
  const root = await mkdtemp(join(tmpdir(), "course-assets-test-"));
  const repository = join(root, "ros2-course");
  const manifest = join(root, "board-docs/board/courses/course");
  const assets = join(root, "public/course-assets");
  const cache = join(root, ".cache/courses/documents.json");
  const git = (...args) => execFileSync("git", ["-C", repository, ...args], { stdio: "pipe" });
  try {
    await mkdir(repository);
    await mkdir(manifest, { recursive: true });
    git("init", "-b", "master");
    await writeFile(join(root, ".gitmodules"), '[submodule "ros2-course"]\n\tpath = ros2-course\n\turl = https://github.com/test/course.git\n\tbranch = master\n');
    await writeFile(join(manifest, "metadata.yml"), JSON.stringify({
      introduction_source: "https://github.com/test/course/blob/master/README.md",
      chapters: [],
    }));
    async function revision(markdown, image) {
      await writeFile(join(repository, "README.md"), markdown);
      await writeFile(join(repository, "image.png"), image);
      git("add", ".");
      git("-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-m", "fixture");
    }
    await revision("![image](image.png)", "first image");
    await syncCourses(root);
    const first = await readdir(assets);
    assert.equal(first.length, 1);
    const firstRevision = git("rev-parse", "HEAD").toString().trim();
    const pinnedCache = await readFile(cache, "utf8");
    assert.equal(JSON.parse(pinnedCache).documents["https://github.com/test/course/blob/master/README.md"].revision, firstRevision);
    await writeFile(join(repository, "README.md"), "![missing](uncommitted.png)");
    await writeFile(join(repository, "image.png"), "uncommitted image");
    await syncCourses(root);
    assert.equal(await readFile(cache, "utf8"), pinnedCache);
    assert.equal(await readFile(join(assets, first[0]), "utf8"), "first image");

    await revision("![image](image.png)", "updated image");
    await syncCourses(root);
    const second = await readdir(assets);
    assert.equal(second.length, 1);
    assert.notEqual(second[0], first[0]);
    assert.equal(await readFile(join(assets, second[0]), "utf8"), "updated image");
    const successfulCache = await readFile(cache, "utf8");

    await revision("![missing](missing.png)", "updated image");
    await assert.rejects(syncCourses(root));
    assert.deepEqual(await readdir(assets), second);
    assert.equal(await readFile(cache, "utf8"), successfulCache);

    await revision("No media references remain.", "updated image");
    await syncCourses(root);
    assert.deepEqual(await readdir(assets), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("require the configured submodule and preserve links at its checked-out revision", async () => {
  const root = await mkdtemp(join(tmpdir(), "course-submodule-test-"));
  const repository = join(root, "ros2-course");
  const manifest = join(root, "board-docs/board/courses/course/metadata.yml");
  const source = "https://github.com/test/course/blob/master/README.md";
  const lesson = "https://github.com/test/course/blob/master/ch02.md";
  const git = (...args) => execFileSync("git", ["-C", repository, ...args], { stdio: "pipe" });
  try {
    await mkdir(join(root, "board-docs/board/courses/course"), { recursive: true });
    await writeFile(join(root, ".gitmodules"), '[submodule "ros2-course"]\n\tpath = ros2-course\n\turl = https://github.com/test/course.git\n\tbranch = master\n');
    await writeFile(manifest, JSON.stringify({ introduction_source: source, chapters: [] }));
    await assert.rejects(syncCourses(root), /git submodule update --init ros2-course/);
    await mkdir(repository);
    await assert.rejects(syncCourses(root), /git submodule update --init ros2-course/);
    git("init", "-b", "master");
    await writeFile(join(repository, "README.md"), "[Next](ch02.md#section)\n[Code](example.cpp)\n![image](image.png)");
    await writeFile(join(repository, "ch02.md"), "# Second chapter");
    await writeFile(join(repository, "example.cpp"), "int main() {}\n");
    await writeFile(join(repository, "image.png"), "image");
    git("add", ".");
    git("-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-m", "fixture");
    const revision = git("rev-parse", "HEAD").toString().trim();
    await writeFile(manifest, JSON.stringify({
      introduction_source: source,
      chapters: [{ documents: { riscv: { zh: { lesson, lab: lesson } } } }],
    }));
    await syncCourses(root);
    const { documents } = JSON.parse(await readFile(join(root, ".cache/courses/documents.json"), "utf8"));
    assert.equal(documents[source].links["ch02.md#section"], lesson + "#section");
    assert.equal(documents[source].links["example.cpp"], `https://github.com/test/course/blob/${revision}/example.cpp`);
    assert.match(documents[source].links["image.png"], /^\/course-assets\/.+\.png$/);
    for (const unsupported of [source.replace("test/course", "unknown/course"), source.replace("/master/", "/unpublished/")]) {
      await writeFile(manifest, JSON.stringify({ introduction_source: unsupported, chapters: [] }));
      await assert.rejects(syncCourses(root), /does not match the ros2-course submodule/);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("publish catalog changes by updating only the course revision", async () => {
  const root = await mkdtemp(join(tmpdir(), "course-catalog-test-"));
  const repository = join(root, "ros2-course");
  const manifest = join(root, "board-docs/board/courses/course/metadata.yml");
  const catalog = join(repository, "catalogs/board.yml");
  const cache = join(root, ".cache/courses/documents.json");
  const source = (path) => `https://github.com/test/course/blob/master/${path}`;
  const git = (...args) => execFileSync("git", ["-C", repository, ...args], { stdio: "pipe" });
  const chapter = (id, lab = id) => ({
    id, title: { zh: `Chapter ${id}` },
    documents: Object.fromEntries(["riscv", "x86"].map((edition) => [edition, {
      zh: { lesson: source(`${id}.md`), lab: source(`${lab}_lab.md`) },
    }])),
  });
  const data = { title: { zh: "Course" }, introduction_source: source("README.md"), chapters: [chapter("ch01")] };
  const commit = () => {
    git("add", ".");
    git("-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-m", "fixture");
    return git("rev-parse", "HEAD").toString().trim();
  };
  try {
    await mkdir(join(repository, "catalogs"), { recursive: true });
    await mkdir(join(root, "board-docs/board/courses/course"), { recursive: true });
    git("init", "-b", "master");
    await writeFile(join(root, ".gitmodules"), '[submodule "ros2-course"]\n\tpath = ros2-course\n\turl = https://github.com/test/course.git\n\tbranch = master\n');
    const reference = "catalog: catalogs/board.yml\n";
    await writeFile(manifest, reference);
    await writeFile(join(repository, "README.md"), "# Course");
    await writeFile(join(repository, "ch01.md"), "# First chapter");
    await writeFile(join(repository, "ch01_lab.md"), "# Shared lab");
    await writeFile(catalog, JSON.stringify(data));
    const firstRevision = commit();
    await syncCourses(root);
    assert.deepEqual(JSON.parse(await readFile(cache, "utf8")).courses["board/course"].chapters.map(({ id }) => id), ["ch01"]);

    data.chapters.push(chapter("ch02", "ch01"));
    await writeFile(catalog, JSON.stringify(data));
    await writeFile(join(repository, "ch02.md"), "# Second chapter\n[Previous](ch01.md#intro)");
    const secondRevision = commit();
    await syncCourses(root);
    const successfulCache = await readFile(cache, "utf8");
    const { courses, documents } = JSON.parse(successfulCache);
    assert.deepEqual(courses["board/course"].chapters.map(({ id }) => id), ["ch01", "ch02"]);
    assert.equal(courses["board/course"].chapters[1].documents.x86.zh.lab, source("ch01_lab.md"));
    assert.equal(documents[source("ch02.md")].links["ch01.md#intro"], source("ch01.md") + "#intro");
    assert.ok(Object.values(documents).every(({ revision }) => revision === secondRevision));
    assert.equal(await readFile(manifest, "utf8"), reference);

    data.chapters.push(chapter("ch03"));
    await writeFile(catalog, JSON.stringify(data));
    await syncCourses(root);
    assert.equal(await readFile(cache, "utf8"), successfulCache);
    commit();
    await assert.rejects(syncCourses(root));
    assert.equal(await readFile(cache, "utf8"), successfulCache);
    git("rm", "catalogs/board.yml");
    commit();
    await assert.rejects(syncCourses(root));
    assert.equal(await readFile(cache, "utf8"), successfulCache);

    git("checkout", "--detach", firstRevision);
    await syncCourses(root);
    const restored = JSON.parse(await readFile(cache, "utf8"));
    assert.deepEqual(restored.courses["board/course"].chapters.map(({ id }) => id), ["ch01"]);
    assert.equal(restored.documents[source("ch02.md")], undefined);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
