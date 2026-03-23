import { parse as parseYaml } from "yaml";

export type ExampleCategorySlug =
  | "getting-started"
  | "benchmark"
  | "hardware"
  | "network"
  | "graphics"
  | "multimedia";

export type ExampleMeta = {
  slug: string;
  title: string;
  category: ExampleCategorySlug;
  boards: string[];
  date?: string;
};

const ZH_CATEGORY_TO_SLUG: Record<string, ExampleCategorySlug> = {
  入门: "getting-started",
  跑分: "benchmark",
  硬件: "hardware",
  网络: "network",
  图形: "graphics",
  音视频: "multimedia",
};

const EN_CATEGORY_TO_SLUG: Record<string, ExampleCategorySlug> = {
  "Getting Started": "getting-started",
  Benchmark: "benchmark",
  Hardware: "hardware",
  Network: "network",
  Graphics: "graphics",
  Multimedia: "multimedia",
};

/** Relative to this file — Vite resolves globs from the importer path. */
const readmeGlob = import.meta.glob("../../test-doc/*/README.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const readmeZhGlob = import.meta.glob("../../test-doc/*/README_zh.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const readmeEnGlob = import.meta.glob("../../test-doc/*/README_en.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export type ContentLang = "zh" | "en";

function extractSlug(path: string): string | null {
  const m = path.match(/test-doc\/([^/]+)\//);
  return m?.[1] ?? null;
}

function splitFrontmatter(raw: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  try {
    const data = parseYaml(match[1]) as Record<string, unknown>;
    return { data, body: match[2] };
  } catch {
    return { data: {}, body: raw };
  }
}

function firstHeading(body: string): string | undefined {
  const m = body.match(/^#\s+(.+)$/m);
  return m?.[1]?.trim();
}

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return [v];
  return [];
}

function normalizeCategory(data: Record<string, unknown>): ExampleCategorySlug {
  const raw = data["分类"] ?? data["category"];
  if (typeof raw === "string") {
    if (raw in ZH_CATEGORY_TO_SLUG) return ZH_CATEGORY_TO_SLUG[raw];
    if (raw in EN_CATEGORY_TO_SLUG) return EN_CATEGORY_TO_SLUG[raw];
    if (
      raw === "getting-started" ||
      raw === "benchmark" ||
      raw === "hardware" ||
      raw === "network" ||
      raw === "graphics" ||
      raw === "multimedia"
    ) {
      return raw;
    }
  }
  return "getting-started";
}

function buildMetaForSlug(
  slug: string,
  primaryRaw: string,
): ExampleMeta {
  const { data, body } = splitFrontmatter(primaryRaw);
  const title =
    (typeof data["标题"] === "string" && data["标题"]) ||
    (typeof data["title"] === "string" && data["title"]) ||
    (typeof data["product"] === "string" && data["product"]) ||
    firstHeading(body) ||
    slug;

  let boards = toStringArray(data["支持的板子"] ?? data["boards"]);
  if (boards.length === 0 && typeof data["product"] === "string") {
    boards = [data["product"]];
  }

  const dateRaw = data["更新日期"] ?? data["date"];
  const date = typeof dateRaw === "string" ? dateRaw : undefined;

  return {
    slug,
    title: String(title),
    category: normalizeCategory(data),
    boards,
    date,
  };
}

function collectSlugs(): Set<string> {
  const slugs = new Set<string>();
  for (const p of Object.keys(readmeGlob)) {
    const s = extractSlug(p);
    if (s) slugs.add(s);
  }
  for (const p of Object.keys(readmeZhGlob)) {
    const s = extractSlug(p);
    if (s) slugs.add(s);
  }
  for (const p of Object.keys(readmeEnGlob)) {
    const s = extractSlug(p);
    if (s) slugs.add(s);
  }
  return slugs;
}

function pathFor(slug: string, name: "README.md" | "README_zh.md" | "README_en.md"): string | undefined {
  const suffix = `test-doc/${slug}/${name}`;
  const keys = [readmeGlob, readmeZhGlob, readmeEnGlob][
    name === "README.md" ? 0 : name === "README_zh.md" ? 1 : 2
  ];
  return Object.keys(keys).find((k) => k.replace(/\\/g, "/").includes(suffix));
}

export function getAllExamples(): ExampleMeta[] {
  const slugs = Array.from(collectSlugs()).sort();
  const out: ExampleMeta[] = [];
  for (const slug of slugs) {
    const primaryKey = pathFor(slug, "README.md");
    const raw = primaryKey ? readmeGlob[primaryKey] : undefined;
    if (!raw) continue;
    out.push(buildMetaForSlug(slug, raw));
  }
  return out;
}

export function getExampleBySlug(slug: string): ExampleMeta | undefined {
  return getAllExamples().find((e) => e.slug === slug);
}

/** Markdown body without frontmatter, for rendering. */
export function getExampleMarkdown(slug: string, lang: ContentLang): string | undefined {
  const pickRaw = (): string | undefined => {
    if (lang === "zh") {
      const zhKey = pathFor(slug, "README_zh.md");
      if (zhKey && readmeZhGlob[zhKey]) return readmeZhGlob[zhKey];
      const key = pathFor(slug, "README.md");
      return key ? readmeGlob[key] : undefined;
    }
    const enKey = pathFor(slug, "README_en.md");
    if (enKey && readmeEnGlob[enKey]) return readmeEnGlob[enKey];
    const key = pathFor(slug, "README.md");
    return key ? readmeGlob[key] : undefined;
  };
  const raw = pickRaw();
  if (!raw) return undefined;
  return splitFrontmatter(raw).body.trim();
}
