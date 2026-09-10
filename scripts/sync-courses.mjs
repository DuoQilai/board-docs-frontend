import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join, posix } from "node:path";
import { promisify } from "node:util";
import { parse } from "yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";

const exec = promisify(execFile);
const hash = (value) => createHash("sha256").update(value).digest("hex").slice(0, 20);
const git = async (args) => (await exec("git", args, { encoding: "buffer", maxBuffer: 64 * 1024 * 1024, timeout: 120000 })).stdout;

export async function syncCourses(root = process.cwd()) {
  const cache = join(root, ".cache/courses");
  const assets = join(root, "public/course-assets");
  const urls = new Set();
  const boards = join(root, "board-docs");
  for (const board of await readdir(boards, { withFileTypes: true })) {
    if (!board.isDirectory() || board.name.startsWith(".")) continue;
    const folder = join(boards, board.name, "courses");
    let entries;
    try { entries = await readdir(folder, { withFileTypes: true }); }
    catch (error) { if (error.code === "ENOENT") continue; throw error; }
    for (const course of entries.filter((entry) => entry.isDirectory())) {
      const metadata = parse(await readFile(join(folder, course.name, "metadata.yml"), "utf8"));
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
    const repositories = new Map();
    const result = {};
    await mkdir(assets, { recursive: true });
    for (const source of urls) {
      const url = new URL(source);
      const [, owner, name, marker, ref, ...parts] = url.pathname.split("/");
      if (url.protocol !== "https:" || url.hostname !== "gitee.com" || url.username || url.password || marker !== "blob" || !ref || !parts.length) {
        throw new Error("Course source must be an HTTPS Gitee blob URL");
      }
      const repository = `https://gitee.com/${owner}/${name}`;
      const key = `${repository}/${ref}`;
      let checkout = repositories.get(key);
      if (!checkout) {
        const directory = join(temporary, hash(key));
        await git(["clone", "--depth", "1", "--no-checkout", "--branch", decodeURIComponent(ref), `${repository}.git`, directory]);
        const revision = (await git(["-C", directory, "rev-parse", "HEAD"])).toString().trim();
        checkout = { directory, revision };
        repositories.set(key, checkout);
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
    await writeFile(generated, JSON.stringify(result));
    await rename(generated, join(cache, "documents.json"));
    console.log(`[courses] fetched ${urls.size} documents from ${repositories.size} source revision(s)`);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
