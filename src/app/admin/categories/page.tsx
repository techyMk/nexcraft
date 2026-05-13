"use client";

import { Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";
import { categories, products } from "@/lib/data";

export default function AdminCategories() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow">Catalog</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Categories
          </h1>
          <p className="mt-1 text-sm text-text-2">
            {categories.length} categories · {products.length} products live
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={14} /> New category
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-2"
          />
          <input
            placeholder="Search categories…"
            className="h-10 w-full rounded-full border border-white/[0.06] bg-white/[0.03] pl-9 pr-4 text-sm outline-none placeholder:text-text-2 focus:border-white/[0.14]"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((c) => {
          const count = products.filter((p) => p.categorySlug === c.slug).length;
          return (
            <div
              key={c.id}
              className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl transition hover:border-white/[0.14]"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-500/15 blur-3xl opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-2xl shadow-glow">
                  {c.icon}
                </div>
                <div className="flex gap-1">
                  <button
                    aria-label="Edit"
                    className="grid h-8 w-8 place-items-center rounded-lg text-text-2 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    aria-label="Delete"
                    className="grid h-8 w-8 place-items-center rounded-lg text-text-2 hover:bg-white/[0.06] hover:text-rose-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="mt-4 font-display text-lg font-semibold">{c.name}</div>
              <div className="mt-1 text-xs text-text-2">/{c.slug}</div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-text-2 ring-1 ring-white/[0.06]">
                  <Tag size={11} /> {count} products
                </span>
                <span className="text-text-2">Updated 2d ago</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
