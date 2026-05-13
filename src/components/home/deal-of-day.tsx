"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Flame, ArrowRight } from "lucide-react";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : seconds)), 1000);
    return () => clearInterval(t);
  }, [seconds]);
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  return { h, m, s };
}

export function DealOfDay() {
  const deal = products.find((p) => p.oldPrice) ?? products[0];
  const { h, m, s } = useCountdown(8 * 3600 + 43 * 60 + 12);
  const discount =
    deal.oldPrice && Math.round(((deal.oldPrice - deal.price) / deal.oldPrice) * 100);

  return (
    <section className="section">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-primary-900/40 via-surface to-surface-2 p-8 md:p-12">
          <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-accent-purple/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-primary-600/40 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="chip">
                <Flame size={12} /> Deal of the Day
              </div>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                {deal.name}
              </h2>
              <p className="mt-3 max-w-lg text-text-2">{deal.description}</p>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-4xl font-semibold tracking-tight">
                  {formatPrice(deal.price)}
                </span>
                {deal.oldPrice && (
                  <span className="text-lg text-text-2 line-through">
                    {formatPrice(deal.oldPrice)}
                  </span>
                )}
                {discount && (
                  <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success ring-1 ring-success/30">
                    Save {discount}%
                  </span>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                {[
                  { l: "Hrs", v: pad(h) },
                  { l: "Min", v: pad(m) },
                  { l: "Sec", v: pad(s) },
                ].map((x) => (
                  <div
                    key={x.l}
                    className="grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl"
                  >
                    <span className="font-display text-xl font-semibold">{x.v}</span>
                    <span className="text-[10px] uppercase tracking-widest text-text-2">
                      {x.l}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={`/product/${deal.slug}`} className="btn btn-primary">
                  Grab the deal <ArrowRight size={16} />
                </Link>
                <Link href="/shop?sale=1" className="btn btn-ghost">
                  See all deals
                </Link>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative mx-auto aspect-square w-full max-w-md"
            >
              <div className="absolute inset-0 rounded-[36px] bg-gradient-electric opacity-20 blur-3xl" />
              <div className="relative h-full overflow-hidden rounded-[28px] border border-white/[0.08] bg-bg/40">
                <Image
                  src={deal.images[0]}
                  alt={deal.name}
                  fill
                  sizes="(max-width:1024px) 80vw, 480px"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
