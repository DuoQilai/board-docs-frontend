import { posix } from "node:path";
import { parse } from "yaml";
import fetchedDocuments from "../../.cache/courses/documents.json";
import { localePath, type Lang } from "./i18n";
import { renderMarkdownToHtml } from "./renderMarkdown";

type Titles = Partial<Record<Lang, string>>;
export const editions = ["riscv", "x86"] as const;
export type Edition = typeof editions[number];
export const editionLabel = (edition: Edition) => edition === "riscv" ? "RISC-V" : "x86";
type Chapter = {
  id: string;
  title: Titles;
  documents: Record<Edition, Partial<Record<Lang, { lesson: string; lab: string }>>>;
};
export type Course = {
  board: string;
  slug: string;
  directory: string;
  title: Titles;
  source: { repository: string };
  introduction_source: string;
  editions: Record<Edition, { programming_language: string; environment: Titles }>;
  chapters: Chapter[];
};
const manifests = import.meta.glob("../../board-docs/*/courses/*/metadata.yml", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;
const documents = import.meta.glob("../../board-docs/*/courses/**/*.md", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;
const media = import.meta.glob("../../board-docs/*/courses/**/*.{png,jpg,jpeg,gif,svg,mp4,webm}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const remoteDocuments = fetchedDocuments as Record<string, { body: string; links: Record<string, string>; revision: string }>;
export const courseTitle = (titles: Titles, lang: Lang) => titles[lang] ?? titles.zh ?? titles.en ?? "";
export const courseUrl = (course: Course, lang: Lang) => localePath(lang, `/boards/${course.board}/courses/${course.slug}/`);
export const courses: Course[] = Object.entries(manifests).map(([key, raw]) => {
  const [, board, slug] = key.match(/board-docs\/([^/]+)\/courses\/([^/]+)\/metadata.yml$/)!;
  const data = parse(raw);
  if (!data?.title?.zh || !Array.isArray(data.chapters) || !data.chapters.length) throw new Error(`Invalid course manifest: ${key}`);
  return { ...data, board, slug, directory: posix.dirname(key) };
});
export const coursePages = courses.flatMap((course) => (["zh", "en"] as Lang[]).flatMap((lang) => {
  const makePage = (path: string, title: string, requested: string, fallback: string, edition?: Edition) => {
    const preferred = requested.startsWith("https://") ? requested : posix.join(course.directory, requested);
    const fallbackPath = fallback.startsWith("https://") ? fallback : posix.join(course.directory, fallback);
    const exists = (key: string) => documents[key] !== undefined || remoteDocuments[key] !== undefined;
    const sourcePath = exists(preferred) ? preferred : fallbackPath;
    if (!exists(sourcePath)) throw new Error(`Missing course document: ${sourcePath}`);
    return { course, lang, title, path, sourcePath, edition, fallback: preferred !== sourcePath, href: courseUrl(course, lang) + path };
  };
  return [
    makePage("", courseTitle(course.title, lang), lang === "zh" ? course.introduction_source : "README.md", course.introduction_source),
    ...course.chapters.flatMap((chapter) => editions.flatMap((edition) => (["lesson", "lab"] as const).map((kind) => {
      const version = chapter.documents[edition];
      const zh = version.zh?.[kind];
      const requested = version[lang]?.[kind];
      if (!zh && !requested) throw new Error(`Missing ${kind} in ${course.slug}/${edition}/${chapter.id}`);
      const title = `${courseTitle(chapter.title, lang)} · ${editionLabel(edition)} · ${kind === "lesson" ? (lang === "zh" ? "课程" : "Lesson") : (lang === "zh" ? "实验" : "Lab")}`;
      return makePage(`${edition}/${chapter.id}/${kind}/`, title, requested ?? `missing-${lang}`, zh ?? requested!, edition);
    }))),
  ];
}));
export type CoursePage = typeof coursePages[number];

export async function renderCoursePage(page: CoursePage) {
  const remote = remoteDocuments[page.sourcePath];
  return renderMarkdownToHtml(remote?.body ?? documents[page.sourcePath], (url) => {
    let target = remote?.links[url] ?? url;
    const fragmentIndex = target.indexOf("#");
    const fragment = fragmentIndex >= 0 ? target.slice(fragmentIndex) : "";
    const file = fragmentIndex >= 0 ? target.slice(0, fragmentIndex) : target;
    const linkedPage = coursePages.find((item) => item.lang === page.lang && item.sourcePath === file);
    if (linkedPage) return linkedPage.href + fragment;
    if (/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(target)) return target;
    const key = posix.join(posix.dirname(page.sourcePath), decodeURIComponent(file));
    const local = coursePages.find((item) => item.lang === page.lang && item.sourcePath === key)?.href ?? media[key];
    if (!local) throw new Error(`Unresolved course link: ${page.sourcePath}: ${url}`);
    return local + fragment;
  });
}
