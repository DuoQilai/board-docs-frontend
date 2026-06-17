/** Example category slugs (frontmatter `status` field). */
export const EXAMPLE_STATUSES = [
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
] as const;

export type ExampleStatus = (typeof EXAMPLE_STATUSES)[number];

export const STATUS_LABEL_ZH: Record<ExampleStatus, string> = {
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
};

const STATUS_SET = new Set<string>(EXAMPLE_STATUSES);

/** Normalize frontmatter `status` to a known category slug. */
export function normalizeExampleStatus(raw: unknown): ExampleStatus {
  const key = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");

  if (STATUS_SET.has(key)) return key as ExampleStatus;

  const legacy: Record<string, ExampleStatus> = {
    application: "system",
    others: "benchmark",
    good: "basics",
    wip: "system",
    cft: "system",
  };
  if (legacy[key]) return legacy[key];

  return "system";
}
