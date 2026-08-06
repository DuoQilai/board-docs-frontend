/** Example category slugs (frontmatter `category` field). */
export const EXAMPLE_CATEGORIES = [
  "basics",
  "peripheral",
  "communication",
  "network",
  "system",
  "multimedia",
  "computer-vision",
  "ai",
  "crypto",
  "compression",
  "gui",
  "benchmark",
  "application",
] as const;

export type ExampleCategory = (typeof EXAMPLE_CATEGORIES)[number];

export const CATEGORY_LABEL_ZH: Record<ExampleCategory, string> = {
  basics: "基础示例",
  peripheral: "外设控制",
  communication: "通信接口",
  network: "网络通信",
  system: "系统编程",
  multimedia: "多媒体应用",
  "computer-vision": "计算机视觉",
  ai: "人工智能",
  crypto: "加密安全",
  compression: "数据压缩",
  gui: "图形界面",
  benchmark: "性能测试",
  application: "应用与综合",
};

const CATEGORY_SET = new Set<string>(EXAMPLE_CATEGORIES);

/** Normalize a frontmatter category slug. */
export function normalizeExampleCategory(raw: unknown): ExampleCategory {
  const key = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");

  if (CATEGORY_SET.has(key)) return key as ExampleCategory;

  const legacy: Record<string, ExampleCategory> = {
    others: "benchmark",
    good: "basics",
    wip: "system",
    cft: "system",
  };
  if (legacy[key]) return legacy[key];

  return "application";
}
