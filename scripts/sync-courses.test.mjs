import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { syncCourses } from "./sync-courses.mjs";

test("prune obsolete assets only after successful synchronization", async () => {
  const root = await mkdtemp(join(tmpdir(), "course-assets-test-"));
  const repository = join(root, "upstream");
  const manifest = join(root, "board-docs/board/courses/course");
  const assets = join(root, "public/course-assets");
  const cache = join(root, ".cache/courses/documents.json");
  const git = (...args) => execFileSync("git", ["-C", repository, ...args], { stdio: "pipe" });
  const envKeys = ["GIT_CONFIG_COUNT", "GIT_CONFIG_KEY_0", "GIT_CONFIG_VALUE_0"];
  const saved = envKeys.map((key) => process.env[key]);
  try {
    await mkdir(repository);
    await mkdir(manifest, { recursive: true });
    git("init", "-b", "master");
    process.env.GIT_CONFIG_COUNT = "1";
    process.env.GIT_CONFIG_KEY_0 = `url.file://${repository}.insteadOf`;
    process.env.GIT_CONFIG_VALUE_0 = "https://github.com/test/course.git";
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
    envKeys.forEach((key, index) => {
      if (saved[index] === undefined) delete process.env[key];
      else process.env[key] = saved[index];
    });
    await rm(root, { recursive: true, force: true });
  }
});
