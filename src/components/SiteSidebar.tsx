import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BoardMeta, SiliconVendorGroup } from "@/lib/data";
import { boardMatchesQuery, groupBoardsBySiliconVendorChip, slugifyUrlSegment } from "@/lib/data";
import { localePath, t, type Lang } from "@/lib/i18n";

export type SiteSidebarProps = {
  boards: BoardMeta[];
  className?: string;
  lang?: Lang;
};

export function SiteSidebar({ boards, className, lang = "zh" }: SiteSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState("");
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(() =>
    new Set(boards.map((b) => b.socVendor ?? "Unknown")),
  );
  const [expandedChips, setExpandedChips] = useState<Set<string>>(() =>
    new Set(boards.map((b) => `${b.socVendor ?? "Unknown"}::${b.cpu || "Unknown"}`)),
  );

  const tree: SiliconVendorGroup[] = useMemo(() => {
    const all = groupBoardsBySiliconVendorChip(boards);
    if (!filter.trim()) return all;
    return all
      .map((vg) => ({
        ...vg,
        chips: vg.chips
          .map((cg) => ({
            ...cg,
            boards: cg.boards.filter((b) => boardMatchesQuery(b, filter)),
          }))
          .filter((cg) => cg.boards.length > 0),
      }))
      .filter((vg) => vg.chips.length > 0);
  }, [boards, filter]);

  function toggleVendor(siliconVendor: string) {
    setExpandedVendors((prev) => {
      const next = new Set(prev);
      if (next.has(siliconVendor)) next.delete(siliconVendor);
      else next.add(siliconVendor);
      return next;
    });
  }

  function toggleChip(key: string) {
    setExpandedChips((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "border-border bg-background sticky top-6 hidden h-[calc(100dvh-3rem)] shrink-0 overflow-hidden rounded-lg border lg:flex",
        collapsed ? "w-6" : "w-72",
        className,
      )}
    >
      <div className={cn("flex h-full w-full flex-col", collapsed && "items-center")}>
        {!collapsed && (
          <div className="w-full p-3">
            <Input
              type="search"
              placeholder={t(lang, "searchPlaceholder")}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 text-sm"
              aria-label={t(lang, "search")}
            />
          </div>
        )}

        {!collapsed && (
          <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
            {tree.length === 0 && (
              <p className="text-muted-foreground px-3 py-4 text-center text-xs">{t(lang, "noMatches")}</p>
            )}

            {tree.map((vg) => {
              const vendorOpen = expandedVendors.has(vg.siliconVendor);
              const vendorSlug = slugifyUrlSegment(vg.siliconVendor);
              const vendorHref = localePath(lang, `/vendors/${encodeURIComponent(vendorSlug)}/`);
              return (
                <div key={vg.siliconVendor} className="mb-1">
                  <div className="hover:bg-muted/60 flex w-full items-center justify-between rounded-md px-2 py-1.5">
                    <a
                      href={vendorHref}
                      className="text-foreground min-w-0 flex-1 truncate text-sm font-semibold underline-offset-4 hover:underline"
                    >
                      {vg.siliconVendor}
                    </a>
                    <button
                      type="button"
                      onClick={() => toggleVendor(vg.siliconVendor)}
                      className="text-muted-foreground hover:text-foreground shrink-0 rounded p-0.5"
                      aria-label={vendorOpen ? t(lang, "collapse") : t(lang, "expand")}
                    >
                      <ChevronIcon open={vendorOpen} />
                    </button>
                  </div>

                  {vendorOpen && (
                    <div className="ml-3">
                      {vg.chips.map((cg) => {
                        const chipKey = `${vg.siliconVendor}::${cg.cpu}`;
                        const chipOpen = expandedChips.has(chipKey);
                        // 需求：点击 SoC 也显示芯片厂商页（这里跳到厂商页并定位到该 SoC 段落）
                        const socAnchor = `soc-${slugifyUrlSegment(cg.cpu)}`;
                        const socHref = `${vendorHref}#${encodeURIComponent(socAnchor)}`;
                        return (
                          <div key={chipKey}>
                            <div className="hover:bg-muted/40 flex w-full items-center justify-between rounded-md px-2 py-1">
                              <a
                                href={socHref}
                                className="text-muted-foreground min-w-0 flex-1 truncate text-sm underline-offset-4 hover:underline"
                              >
                                {cg.cpu}
                              </a>
                              <button
                                type="button"
                                onClick={() => toggleChip(chipKey)}
                                className="text-muted-foreground hover:text-foreground shrink-0 rounded p-0.5"
                                aria-label={chipOpen ? t(lang, "collapse") : t(lang, "expand")}
                              >
                                <ChevronIcon open={chipOpen} />
                              </button>
                            </div>

                            {chipOpen && (
                              <div className="ml-3">
                                {cg.boards.map((b) => (
                                  <a
                                    key={b.slug}
                                    href={localePath(lang, `/boards/${encodeURIComponent(b.slug)}/`)}
                                    className="text-foreground hover:bg-muted/60 flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors"
                                  >
                                    <span className="truncate">{b.product}</span>
                                    <span className="text-muted-foreground ml-2 shrink-0 text-xs tabular-nums">
                                      {b.examples.length}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}
      </div>
      <button
        type="button"
        aria-expanded={!collapsed}
        aria-label={collapsed ? t(lang, "expandSidebar") : t(lang, "collapseSidebar")}
        title={collapsed ? t(lang, "expandSidebar") : t(lang, "collapseSidebar")}
        onClick={() => setCollapsed((value) => !value)}
        className="group absolute inset-y-0 right-0 z-10 flex w-3 cursor-pointer items-center justify-center outline-none hover:bg-primary/10 focus-visible:bg-primary/10"
      >
        <span aria-hidden="true" className={cn(
          "text-primary text-sm opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
          collapsed && "opacity-100",
        )}>
          {collapsed ? "›" : "‹"}
        </span>
      </button>
    </aside>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      className={cn("text-muted-foreground shrink-0 transition-transform duration-150", open && "rotate-90")}
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
