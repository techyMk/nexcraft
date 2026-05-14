"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/data";

export function CategoriesSection() {
  return (
    <section className="section">
      <div className="container">
        <Header />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((c, i) => (
            <CategoryCard key={c.id} cat={c} index={i} size="lg" />
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(4, 8).map((c, i) => (
            <CategoryCard key={c.id} cat={c} index={i + 4} size="sm" />
          ))}
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="section-eyebrow">Browse the universe</div>
        <h2 className="section-title mt-2">
          Shop by <span className="text-gradient-brand">category</span>
        </h2>
        <p className="mt-3 max-w-xl text-text-2">
          From flagship phones to AI-native gadgets — every collection is
          curated and intelligently ranked for you.
        </p>
      </div>
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-text-2 hover:bg-white/[0.06] hover:text-white"
      >
        View all <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function CategoryCard({
  cat,
  index,
  size,
}: {
  cat: (typeof categories)[number];
  index: number;
  size: "lg" | "sm";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
    >
      <Link
        href={`/shop?cat=${cat.slug}`}
        className="group relative block overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl"
      >
        <div className={`relative ${size === "lg" ? "aspect-[4/5]" : "aspect-[16/10]"}`}>
          <Image
            src={cat.image}
            alt={cat.name}
            fill
            sizes="(max-width:1024px) 50vw, 25vw"
            className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
          <div>
            <div className="font-display text-2xl font-semibold leading-tight tracking-tight md:text-[26px]">
              {cat.name}
            </div>
            <div className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-text-2">
              {cat.count} products
            </div>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.08] text-white ring-1 ring-white/10 backdrop-blur transition group-hover:bg-gradient-brand">
            <ArrowRight size={15} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
