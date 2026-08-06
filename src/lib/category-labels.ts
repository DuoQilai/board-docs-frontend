/** Example category slugs (frontmatter `category` field). */
export const EXAMPLE_CATEGORIES = [
  "getting-started",
  "peripheral",
  "network",
  "system",
  "storage",
  "power-management",
  "multimedia",
  "computer-vision",
  "ai",
  "security",
  "compression",
  "gui",
  "benchmark",
  "application",
  "other",
] as const;

export type ExampleCategory = (typeof EXAMPLE_CATEGORIES)[number];

export const CATEGORY_LABEL_ZH: Record<ExampleCategory, string> = {
  "getting-started": "入门",
  peripheral: "外设控制",
  network: "网络通信",
  system: "系统编程",
  storage: "存储",
  "power-management": "低功耗与电源管理",
  multimedia: "多媒体应用",
  "computer-vision": "计算机视觉",
  ai: "人工智能",
  security: "安全",
  compression: "数据压缩",
  gui: "图形界面",
  benchmark: "性能测试",
  application: "综合应用",
  other: "其他",
};

const CATEGORY_SET = new Set<string>(EXAMPLE_CATEGORIES);

/** Normalize a frontmatter category slug and reject unsupported values. */
export function normalizeExampleCategory(raw: unknown): ExampleCategory {
  const key = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");

  if (CATEGORY_SET.has(key)) return key as ExampleCategory;

  const legacy: Record<string, ExampleCategory> = {
    basics: "getting-started",
    communication: "peripheral",
    crypto: "security",
    others: "benchmark",
  };
  if (legacy[key]) return legacy[key];

  throw new Error(`Unsupported example category: ${JSON.stringify(raw)}`);
}
