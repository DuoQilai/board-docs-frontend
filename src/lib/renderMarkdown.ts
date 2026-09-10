import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

type MarkdownNode = { type: string; url?: string; children?: MarkdownNode[] };

export async function renderMarkdownToHtml(markdown: string, resolveUrl?: (url: string) => string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(() => (tree: MarkdownNode) => {
      if (!resolveUrl) return;
      function walk(node: MarkdownNode) {
        if (node.url && ["link", "image", "definition"].includes(node.type)) node.url = resolveUrl!(node.url);
        for (const child of node.children ?? []) walk(child);
      }
      walk(tree);
    })
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      theme: "github-dark",
    })
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}
