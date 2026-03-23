import type { ExampleMeta } from "./examples";

/** Flat list of all board names mentioned in examples, sorted. */
export function aggregateBoards(examples: ExampleMeta[]): string[] {
  const set = new Set<string>();
  for (const ex of examples) {
    for (const b of ex.boards) {
      if (b.trim()) set.add(b.trim());
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
