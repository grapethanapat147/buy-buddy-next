"use client";

import { useRouter } from "next/navigation";

export default function ExploreControls({
  categories,
  activeCategory,
  query,
}: {
  categories: string[];
  activeCategory: string;
  query: string;
}) {
  const router = useRouter();

  const go = (params: { category?: string; q?: string }) => {
    const sp = new URLSearchParams();
    if (params.category) {
      sp.set("category", params.category);
    }
    if (params.q) {
      sp.set("q", params.q);
    }
    const qs = sp.toString();
    router.push(qs ? `/explore?${qs}` : "/explore");
  };

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs transition active:scale-95 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none ${
      active
        ? "bg-brand-50 font-semibold text-brand-700"
        : "border border-ink/10 text-ink-soft hover:bg-cream-sunk"
    }`;

  return (
    <>
      <input
        defaultValue={query}
        placeholder="ค้นหาสินค้า"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            go({ q: (e.target as HTMLInputElement).value, category: activeCategory });
          }
        }}
        className="mt-3 w-full rounded-xl border border-ink/10 bg-cream-card px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => go({ q: query })} className={chip(activeCategory === "")}>
          ทั้งหมด
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => go({ category: c, q: query })}
            className={chip(activeCategory === c)}
          >
            {c}
          </button>
        ))}
      </div>
    </>
  );
}
