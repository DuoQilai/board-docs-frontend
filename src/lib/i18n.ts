export type Lang = "zh" | "en";

export const HTML_LANG: Record<Lang, string> = { zh: "zh-CN", en: "en" };

/** 中文页 path 原样返回;英文页加 /en 前缀。path 必须以 / 开头 */
export function localePath(lang: Lang, path: string): string {
  return lang === "en" ? `/en${path === "/" ? "/" : path}` : path;
}

/** 由当前 pathname 计算另一语言的对应 URL 与标签 */
export function altLocale(currentPath: string): { lang: Lang; href: string; label: string } {
  const isEn = currentPath === "/en" || currentPath.startsWith("/en/");
  return isEn
    ? { lang: "zh", href: currentPath.replace(/^\/en/, "") || "/", label: "中文" }
    : { lang: "en", href: `/en${currentPath}`, label: "EN" };
}

export const ui = {
  zh: {
    backToHome: "回到首页",
    expandSidebar: "展开侧栏",
    collapseSidebar: "收起侧栏",
    searchPlaceholder: "搜索开发板、厂商、SoC、核心等…",
    search: "搜索",
    searchBoards: "搜索开发板",
    noMatches: "无匹配",
    collapse: "折叠",
    expand: "展开",
    heroTagline: "在 RISC-V 开发板上运行你的第一个程序",
    noMatchingBoards: "没有匹配的板子，请调整搜索条件。",
    exampleList: "示例列表",
    noExamples: "暂无示例。",
    thExample: "示例名",
    thCategory: "分类",
    thSystem: "系统",
    thLastUpdate: "更新日期",
    metaSystem: "系统：",
    metaUpdated: "更新：",
    useInVSCode: "在 VS Code 中使用",
    vendorsTitle: "芯片厂商",
    vendorsSubtitle: "按 Silicon Vendor（silicon_vendor）浏览",
    vendorBoardsIntro: "该芯片厂商下的 SoC 与开发板汇总如下",
    boardVendorPrefix: "板厂：",
    siteDescription: "RISC-V 开发板示例教程",
  },
  en: {
    backToHome: "Back to home",
    expandSidebar: "Expand sidebar",
    collapseSidebar: "Collapse sidebar",
    searchPlaceholder: "Search boards, vendors, SoCs, cores…",
    search: "Search",
    searchBoards: "Search boards",
    noMatches: "No matches",
    collapse: "Collapse",
    expand: "Expand",
    heroTagline: "Run your first program on a RISC-V development board",
    noMatchingBoards: "No matching boards. Try adjusting your search.",
    exampleList: "Examples",
    noExamples: "No examples yet.",
    thExample: "Example",
    thCategory: "Category",
    thSystem: "System",
    thLastUpdate: "Last updated",
    metaSystem: "System:",
    metaUpdated: "Updated:",
    useInVSCode: "Use in VS Code",
    vendorsTitle: "Silicon Vendors",
    vendorsSubtitle: "Browse by silicon vendor (silicon_vendor)",
    vendorBoardsIntro: "SoCs and development boards from this silicon vendor",
    boardVendorPrefix: "Board vendor:",
    siteDescription: "RISC-V development board tutorials and examples",
  },
} as const;

export type UIKey = keyof typeof ui.zh;

export function t(lang: Lang, key: UIKey): string {
  return ui[lang][key];
}

export function exampleCountLabel(lang: Lang, n: number): string {
  return lang === "zh" ? `${n} 个示例` : n === 1 ? "1 example" : `${n} examples`;
}
