import { useMemo, useState } from "react";

import { BoardCard } from "@/components/BoardCard";
import { Input } from "@/components/ui/input";
import type { BoardMeta } from "@/lib/data";
import { boardMatchesQuery } from "@/lib/data";
import { t, type Lang } from "@/lib/i18n";

export type BoardsHomeProps = {
  boards: BoardMeta[];
  lang?: Lang;
};

export default function BoardsHome({ boards, lang = "zh" }: BoardsHomeProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => boards.filter((b) => boardMatchesQuery(b, query)),
    [boards, query],
  );

  return (
    <div>
      <section className="py-10 text-center sm:py-14">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">RuyiSDK Examples</h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-base">
          {t(lang, "heroTagline")}
        </p>
        <div className="mx-auto mt-6 max-w-lg">
          <Input
            type="search"
            placeholder={t(lang, "searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t(lang, "searchBoards")}
            className="h-10"
          />
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
          {t(lang, "noMatchingBoards")}
        </div>
      ) : (
        <ul className="grid list-none gap-5 pb-16 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((b) => (
            <li key={b.slug}>
              <BoardCard
                lang={lang}
                product={b.product}
                slug={b.slug}
                cpu={b.cpu}
                vendor={b.vendor}
                socVendor={b.socVendor}
                exampleCount={b.examples.length}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
