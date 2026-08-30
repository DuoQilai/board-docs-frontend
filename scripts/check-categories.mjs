import { readFile } from "node:fs/promises";
import { parse } from "yaml";

const metadataPath = "board-docs/assets/metadata.yml";
const categoryLabelsPath = "src/lib/category-labels.ts";

function fail(message) {
  console.error(`[category] ${message}`);
  process.exit(1);
}

let metadataText;
try {
  metadataText = await readFile(metadataPath, "utf8");
} catch (error) {
  if (error?.code === "ENOENT") {
    fail(`${metadataPath} not found; run git submodule update --init first`);
  }
  fail(`failed to read ${metadataPath}: ${error.message}`);
}

let metadata;
try {
  metadata = parse(metadataText);
} catch (error) {
  fail(`failed to parse ${metadataPath}: ${error.message}`);
}

const metadataCategories = metadata?.categories;
if (
  !Array.isArray(metadataCategories) ||
  metadataCategories.length === 0 ||
  metadataCategories.some((category) => typeof category !== "string" || category.length === 0)
) {
  fail(`${metadataPath} must contain a non-empty string array at categories`);
}

let categoryLabelsSource;
try {
  categoryLabelsSource = await readFile(categoryLabelsPath, "utf8");
} catch (error) {
  fail(`failed to read ${categoryLabelsPath}: ${error.message}`);
}

const arrayMatch = categoryLabelsSource.match(
  /\bEXAMPLE_CATEGORIES\s*=\s*\[([\s\S]*?)\]\s*as\s+const\b/,
);
if (!arrayMatch) {
  fail(`could not extract EXAMPLE_CATEGORIES from ${categoryLabelsPath}`);
}

const stringLiteralPattern = /"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'/g;
const literalMatches = [...arrayMatch[1].matchAll(stringLiteralPattern)];
if (literalMatches.length === 0) {
  fail("EXAMPLE_CATEGORIES contains no string literals");
}

const unmatchedArrayContent = arrayMatch[1]
  .replace(stringLiteralPattern, "")
  .replace(/[\s,]/g, "");
if (unmatchedArrayContent.length > 0) {
  fail("EXAMPLE_CATEGORIES must contain only string literals");
}

const frontendCategories = literalMatches.map((match) => match[1] ?? match[2]);
const metadataSet = new Set(metadataCategories);
const frontendSet = new Set(frontendCategories);
const missingInFrontend = [...metadataSet]
  .filter((category) => !frontendSet.has(category))
  .sort();
const staleInFrontend = [...frontendSet]
  .filter((category) => !metadataSet.has(category))
  .sort();

if (missingInFrontend.length > 0) {
  console.error(`[category] metadata.yml 有而前端没有：${missingInFrontend.join(", ")}`);
  console.error(
    "[category] 需在 EXAMPLE_CATEGORIES、CATEGORY_LABEL_ZH、CATEGORY_LABEL_EN 中补充",
  );
}

if (staleInFrontend.length > 0) {
  console.error(`[category] 前端存在过期分类：${staleInFrontend.join(", ")}`);
}

if (missingInFrontend.length > 0 || staleInFrontend.length > 0) {
  process.exit(1);
}

console.log(`[category] category lists match (${metadataSet.size} categories)`);
