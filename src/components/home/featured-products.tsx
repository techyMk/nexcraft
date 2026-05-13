"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

export function FeaturedProducts() {
  const featured = products.filter((p) => p.featured).slice(0, 8);
  return (
    <section className="section">
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="section-eyebrow">Hand-picked</div>
            <h2 className="section-title mt-2">
              Featured <span className="text-gradient-brand">products</span>
            </h2>
            <p className="mt-3 max-w-xl text-text-2">
              Ranked by NexCart Intelligence™ — these are loved by buyers like
              you this week.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-text-2 hover:bg-white/[0.06] hover:text-white"
          >
            See all products <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
