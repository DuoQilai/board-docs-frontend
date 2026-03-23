import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BoardMeta } from "@/lib/data";

export type BoardSidebarProps = {
  boards: BoardMeta[];
  className?: string;
};

export function BoardSidebar({ boards, className }: BoardSidebarProps) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter.trim()) return boards;
    const q = filter.trim().toLowerCase();
    return boards.filter(
      (b) =>
        b.product.toLowerCase().includes(q) ||
        b.cpu.toLowerCase().includes(q) ||
        b.vendor.toLowerCase().includes(q),
    );
  }, [boards, filter]);

  return (
    <aside
      className={cn(
        "border-border sticky top-0 h-screen w-64 shrink-0 overflow-y-auto border-r",
        className,
      )}
    >
      <div className="p-4">
        <Input
          type="search"
          placeholder="Search boards…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 text-sm"
          aria-label="Filter boards"
        />
      </div>

      <nav className="px-2 pb-6">
        <ul className="space-y-0.5">
          {filtered.map((b) => (
            <li key={b.slug}>
              <a
                href={`/boards/${encodeURIComponent(b.slug)}/`}
                className="text-foreground hover:bg-muted/60 flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{b.product}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {b.cpu}
                    {b.vendor ? ` · ${b.vendor}` : ""}
                  </span>
                </span>
                <span className="text-muted-foreground ml-2 shrink-0 text-xs tabular-nums">
                  {b.examples.length}
                </span>
              </a>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-muted-foreground px-3 py-4 text-center text-xs">
              无匹配
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
