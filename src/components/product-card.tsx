"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Plus, Star, Sparkles } from "lucide-react";
import { type Product } from "@/lib/data";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

const badgeStyles: Record<string, string> = {
  HOT: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  NEW: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  SALE: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  "AI PICK": "bg-gradient-brand text-white ring-white/20",
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const add = useCart((s) => s.add);
  const wishlisted = useWishlist((s) => s.items.some((i) => i.id === product.id));
  const toggleWishlist = useWishlist((s) => s.toggle);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-glow"
    >
      <div className="absolute -inset-px -z-10 rounded-2xl opacity-0 transition group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-20 blur-xl" />
      </div>

      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01]">
        <Link href={`/product/${product.slug}`} className="block h-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 ${
                badgeStyles[product.badge] ?? "bg-white/10 text-white ring-white/20"
              }`}
            >
              {product.badge === "AI PICK" && <Sparkles size={10} />}
              {product.badge}
            </span>
          )}
          {product.oldPrice && (
            <span className="rounded-full bg-bg/70 px-2 py-1 text-[10px] font-semibold text-white ring-1 ring-white/10 backdrop-blur">
              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
            </span>
          )}
        </div>

        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist({
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              oldPrice: product.oldPrice,
              image: product.images[0],
              category: product.category,
            });
          }}
          className={cn(
            "absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-bg/60 ring-1 backdrop-blur transition hover:bg-bg/80",
            wishlisted
              ? "text-rose-400 ring-rose-400/30"
              : "text-text-2 ring-white/10 hover:text-white",
          )}
        >
          <Heart size={15} className={wishlisted ? "fill-current" : ""} />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            add({
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images[0],
            });
          }}
          className="absolute inset-x-3 bottom-3 inline-flex translate-y-3 items-center justify-center gap-2 rounded-full bg-white text-bg opacity-0 ring-1 ring-white/20 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:brightness-95 py-2.5 text-sm font-semibold"
        >
          <Plus size={15} /> Add to cart
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-text-2">{product.category}</span>
          <span className="inline-flex items-center gap-1 text-text-2">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            {product.rating.toFixed(1)}
            <span className="text-text-2/70">({product.reviews})</span>
          </span>
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 block truncate font-medium hover:text-primary-300"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-sm text-text-2 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
