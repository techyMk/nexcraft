"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { categories, products } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

export default function ShopPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | "all">("all");
  const [sort, setSort] = useState("featured");
  const [price, setPrice] = useState<[number, number]>([0, 3000]);
  const [aiOnly, setAiOnly] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);

  const filtered = useMemo(() => {
    let r = products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "all" && p.categorySlug !== cat) return false;
      if (p.price < price[0] || p.price > price[1]) return false;
      if (aiOnly && p.badge !== "AI PICK") return false;
      return true;
    });
    switch (sort) {
      case "price-asc":
        r = [...r].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        r = [...r].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        r = [...r].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        r = [...r].sort((a, b) => b.id - a.id);
        break;
      default:
        r = [...r].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
    return r;
  }, [q, cat, sort, price, aiOnly]);

  return (
    <div className="pt-24 md:pt-32">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="section-eyebrow">The catalog</div>
            <h1 className="section-title mt-2">
              All <span className="text-gradient-brand">products</span>
            </h1>
            <p className="mt-2 text-text-2">
              {filtered.length} products · curated and ranked by AI
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-2"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="h-10 w-64 rounded-full border border-white/[0.06] bg-white/[0.03] pl-9 pr-4 text-sm outline-none placeholder:text-text-2 focus:border-white/[0.14]"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 text-sm outline-none focus:border-white/[0.14]"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-surface">
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setOpenFilters((v) => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 text-sm lg:hidden"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside
            className={`${openFilters ? "block" : "hidden"} lg:block`}
          >
            <div className="sticky top-24 space-y-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Filter size={14} /> Filters
                </div>
                <button
                  onClick={() => {
                    setCat("all");
                    setPrice([0, 3000]);
                    setQ("");
                    setAiOnly(false);
                  }}
                  className="text-xs text-text-2 hover:text-white"
                >
                  Reset
                </button>
              </div>

              <div>
                <div className="mb-3 text-xs uppercase tracking-widest text-text-2">
                  Categories
                </div>
                <ul className="space-y-1.5">
                  <FilterRow
                    active={cat === "all"}
                    onClick={() => setCat("all")}
                    icon="✨"
                    label="All categories"
                  />
                  {categories.map((c) => (
                    <FilterRow
                      key={c.id}
                      active={cat === c.slug}
                      onClick={() => setCat(c.slug)}
                      icon={c.icon}
                      label={c.name}
                      hint={`${c.count}`}
                    />
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-text-2">
                  Price
                  <span className="text-text">${price[0]} – ${price[1]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3000}
                  step={50}
                  value={price[1]}
                  onChange={(e) => setPrice([price[0], +e.target.value])}
                  className="w-full accent-primary-500"
                />
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm">
                  <Sparkles size={14} className="text-primary-300" /> AI picks only
                </span>
                <span
                  onClick={() => setAiOnly((v) => !v)}
                  className={`relative h-5 w-9 rounded-full transition ${
                    aiOnly ? "bg-gradient-brand" : "bg-white/[0.08]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                      aiOnly ? "left-4" : "left-0.5"
                    }`}
                  />
                </span>
              </label>
            </div>
          </aside>

          <div>
            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-16 text-center backdrop-blur-xl">
                <X size={28} className="mx-auto text-text-2" />
                <div className="mt-3 font-display text-lg">No products match</div>
                <p className="mt-1 text-sm text-text-2">
                  Try widening your filters or clearing the search.
                </p>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
              >
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <div className="h-32" />
    </div>
  );
}

function FilterRow({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  hint?: string;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
          active
            ? "bg-white/[0.07] text-white ring-1 ring-white/[0.08]"
            : "text-text-2 hover:bg-white/[0.04] hover:text-white"
        }`}
      >
        <span className="flex items-center gap-2">
          <span>{icon}</span>
          {label}
        </span>
        {hint && <span className="text-xs text-text-2">{hint}</span>}
      </button>
    </li>
  );
}
