import { useMemo, useState } from "react";

import { BoardCard } from "@/components/BoardCard";
import { BoardSidebar } from "@/components/BoardSidebar";
import { Input } from "@/components/ui/input";
import type { BoardMeta } from "@/lib/data";

export type BoardsHomeProps = {
  boards: BoardMeta[];
};

function matchesSearch(b: BoardMeta, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  return (
    b.product.toLowerCase().includes(s) ||
    b.slug.toLowerCase().includes(s) ||
    b.cpu.toLowerCase().includes(s) ||
    b.vendor.toLowerCase().includes(s)
  );
}

export default function BoardsHome({ boards }: BoardsHomeProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => boards.filter((b) => matchesSearch(b, query)),
    [boards, query],
  );

  return (
    <div className="mx-auto flex max-w-7xl gap-0">
      {/* Sidebar — hidden on mobile */}
      <BoardSidebar boards={boards} className="hidden lg:block" />

      {/* Main content */}
      <div className="min-w-0 flex-1 px-4 sm:px-6">
        {/* Hero */}
        <section className="py-10 text-center sm:py-14">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            RuyiSDK Examples
          </h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-base">
            在 RISC-V 开发板上运行你的第一个程序
          </p>
          <div className="mx-auto mt-6 max-w-lg">
            <Input
              type="search"
              placeholder="搜索板子、CPU 或厂商…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="搜索开发板"
              className="h-10"
            />
          </div>
        </section>

        {/* Board grid */}
        {filtered.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
            没有匹配的板子，请调整搜索条件。
          </div>
        ) : (
          <ul className="grid list-none gap-5 pb-16 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((b) => (
              <li key={b.slug}>
                <BoardCard
                  product={b.product}
                  slug={b.slug}
                  cpu={b.cpu}
                  vendor={b.vendor}
                  exampleCount={b.examples.length}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
