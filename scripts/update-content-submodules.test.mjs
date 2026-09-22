import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

test("only advance content submodules; retain unpublished pins and reject divergent history", async () => {
  const root = await mkdtemp(join(tmpdir(), "content-update-test-"));
  const upstream = join(root, "upstream");
  const frontend = join(root, "frontend");
  const checkout = join(frontend, "ros2-course");
  const git = (directory, ...args) => execFileSync("git", ["-C", directory, ...args], { stdio: "pipe" }).toString().trim();
  const commit = (directory) => {
    git(directory, "add", ".");
    git(directory, "-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-m", "fixture");
    return git(directory, "rev-parse", "HEAD");
  };
  const update = () => execFileSync("bash", [fileURLToPath(new URL("./update-content-submodules.sh", import.meta.url)), "ros2-course"], {
    cwd: frontend, stdio: "pipe", env: { ...process.env, GIT_ALLOW_PROTOCOL: "file" },
  });
  try {
    await mkdir(upstream);
    await mkdir(frontend);
    git(upstream, "init", "-b", "master");
    await writeFile(join(upstream, "README.md"), "# First chapter");
    const first = commit(upstream);
    git(frontend, "init", "-b", "main");
    git(frontend, "-c", "protocol.file.allow=always", "submodule", "add", "-b", "master", upstream, "ros2-course");
    commit(frontend);
    update();
    assert.equal(git(checkout, "rev-parse", "HEAD"), first);

    await writeFile(join(upstream, "README.md"), "# Second chapter");
    const second = commit(upstream);
    update();
    assert.equal(git(checkout, "rev-parse", "HEAD"), second);
    commit(frontend);

    await writeFile(join(checkout, "catalog.yml"), "chapters: [ch01, ch02, ch03, ch04]\n");
    const unpublished = commit(checkout);
    commit(frontend);
    update();
    assert.equal(git(checkout, "rev-parse", "HEAD"), unpublished);
    assert.equal(git(frontend, "status", "--porcelain"), "");

    await writeFile(join(upstream, "README.md"), "# Divergent history");
    commit(upstream);
    assert.throws(update, /has diverged/);
    assert.equal(git(checkout, "rev-parse", "HEAD"), unpublished);

    git(checkout, "remote", "set-url", "origin", join(root, "missing"));
    assert.throws(update);
    assert.equal(git(checkout, "rev-parse", "HEAD"), unpublished);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
