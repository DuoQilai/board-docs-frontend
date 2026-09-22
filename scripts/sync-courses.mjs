import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join, posix } from "node:path";
import { promisify } from "node:util";
import { parse } from "yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";

const exec = promisify(execFile);
const hash = (value) => createHash("sha256").update(value).digest("hex").slice(0, 20);
const git = async (args) => (await exec("git", args, { encoding: "buffer", maxBuffer: 64 * 1024 * 1024, timeout: 120000 })).stdout;

async function courseSubmodule(root) {
  const config = async (key) => (await git(["config", "--file", join(root, ".gitmodules"), "--get", `submodule.ros2-course.${key}`])).toString().trim();
  const directory = join(root, await config("path"));
  try { await access(join(directory, ".git")); }
  catch { throw new Error("Initialize the course submodule with: git submodule update --init ros2-course"); }
  const repository = (await config("url")).replace(/\.git$/, "");
  const branch = await config("branch");
  const revision = (await git(["-C", directory, "rev-parse", "HEAD"])).toString().trim();
  return { directory, repository, branch, revision };
}

export async function syncCourses(root = process.cwd()) {
  const cache = join(root, ".cache/courses");
  const assets = join(root, "public/course-assets");
  const urls = new Set();
  const courses = {};
  let checkout;
  const boards = join(root, "board-docs");
  for (const board of await readdir(boards, { withFileTypes: true })) {
    if (!board.isDirectory() || board.name.startsWith(".")) continue;
    const folder = join(boards, board.name, "courses");
    let entries;
    try { entries = await readdir(folder, { withFileTypes: true }); }
    catch (error) { if (error.code === "ENOENT") continue; throw error; }
    for (const course of entries.filter((entry) => entry.isDirectory())) {
      let metadata = parse(await readFile(join(folder, course.name, "metadata.yml"), "utf8"));
      if (metadata.catalog) {
        checkout ??= await courseSubmodule(root);
        metadata = parse((await git(["-C", checkout.directory, "show", `${checkout.revision}:${metadata.catalog}`])).toString("utf8"));
      }
      courses[`${board.name}/${course.name}`] = metadata;
      if (metadata.introduction_source) urls.add(metadata.introduction_source);
      for (const chapter of metadata.chapters) {
        for (const edition of Object.values(chapter.documents)) {
          for (const language of Object.values(edition)) {
            for (const url of Object.values(language)) urls.add(url);
          }
        }
      }
    }
  }
  await mkdir(cache, { recursive: true });
  const temporary = await mkdtemp(join(cache, "sources-"));
  try {
    if (urls.size) checkout ??= await courseSubmodule(root);
    const result = {};
    const currentAssets = new Set();
    await mkdir(assets, { recursive: true });
    for (const source of urls) {
      const url = new URL(source);
      const [, owner, name, marker, ref, ...parts] = url.pathname.split("/");
      if (url.protocol !== "https:" || !["gitee.com", "github.com"].includes(url.hostname) || url.username || url.password || marker !== "blob" || !ref || !parts.length) {
        throw new Error("Course source must be an HTTPS Gitee or GitHub blob URL");
      }
      const repository = `https://${url.hostname}/${owner}/${name}`;
      if (repository !== checkout.repository || ![checkout.branch, checkout.revision].includes(decodeURIComponent(ref))) {
        throw new Error(`Course source does not match the ros2-course submodule: ${source}`);
      }
      const path = decodeURIComponent(parts.join("/"));
      const body = (await git(["-C", checkout.directory, "show", `${checkout.revision}:${path}`])).toString("utf8");
      const tree = unified().use(remarkParse).parse(body);
      const references = new Set();
      function walk(node) {
        if (["link", "image", "definition"].includes(node.type)) references.add(node.url);
        for (const child of node.children ?? []) walk(child);
      }
      walk(tree);
      const links = {};
      for (const link of references) {
        if (/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(link)) continue;
        const [file, fragment] = link.split("#");
        const target = posix.normalize(posix.join(posix.dirname(path), decodeURIComponent(file)));
        if (target.startsWith("../")) throw new Error(`Course link outside repository: ${target}`);
        const encoded = target.split("/").map(encodeURIComponent).join("/");
        const original = `${repository}/blob/${ref}/${encoded}`;
        let destination = original;
        if (!urls.has(original)) {
          if (/\.(png|jpe?g|gif|svg|mp4|webm)$/i.test(target)) {
            const filename = `${hash(repository + checkout.revision + target)}${posix.extname(target)}`;
            await writeFile(join(assets, filename), await git(["-C", checkout.directory, "show", `${checkout.revision}:${target}`]));
            currentAssets.add(filename);
            destination = `/course-assets/${filename}`;
          } else {
            await git(["-C", checkout.directory, "cat-file", "-e", `${checkout.revision}:${target}`]);
            destination = `${repository}/blob/${checkout.revision}/${encoded}`;
          }
        }
        links[link] = destination + (fragment ? `#${fragment}` : "");
      }
      result[source] = { body, links, revision: checkout.revision };
    }
    const generated = join(temporary, "documents.json");
    await writeFile(generated, JSON.stringify({ courses, documents: result }));
    await rename(generated, join(cache, "documents.json"));
    for (const entry of await readdir(assets, { withFileTypes: true })) {
      if (entry.isFile() && !currentAssets.has(entry.name)) {
        await rm(join(assets, entry.name));
      }
    }
    console.log(`[courses] loaded ${urls.size} documents from ros2-course${checkout ? ` at ${checkout.revision}` : ""}`);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
