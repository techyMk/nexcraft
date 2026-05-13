"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star, ShieldCheck, Truck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 md:pt-40">
      <div className="container relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="chip"
            >
              <Sparkles size={12} /> NexCart Intelligence is live
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
            >
              The Future of{" "}
              <span className="text-gradient-brand">Intelligent</span>{" "}
              Commerce.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-text-2 md:text-lg"
            >
              AI-powered ecommerce built for the next generation of digital
              shopping. Personalized picks, lightning checkout, and a buying
              experience designed in the future.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/shop" className="btn btn-primary">
                Start Shopping <ArrowRight size={16} />
              </Link>
              <Link href="/shop?ai=1" className="btn btn-ghost">
                Explore AI Deals
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-text-2"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {[
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80",
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80",
                    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=80",
                    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&q=80",
                  ].map((u) => (
                    <span
                      key={u}
                      className="inline-block h-7 w-7 overflow-hidden rounded-full ring-2 ring-bg"
                    >
                      <Image src={u} width={28} height={28} alt="" />
                    </span>
                  ))}
                </div>
                <span>
                  <span className="font-semibold text-white">50,000+</span> shoppers
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-white">4.9</span>
                <span>average rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>2-year warranty</span>
              </div>
            </motion.div>
          </div>

          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative mx-auto aspect-square w-full max-w-[540px]"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-[36px] bg-gradient-electric opacity-30 blur-3xl"
      />
      <div className="absolute inset-0 overflow-hidden rounded-[36px] border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-4 backdrop-blur-xl">
        <div className="relative h-full w-full overflow-hidden rounded-[28px]">
          <Image
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80"
            alt="NexCart hero"
            fill
            sizes="(max-width:1024px) 80vw, 540px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-bg/80 via-transparent to-transparent" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="absolute -left-4 top-10 w-64 rounded-2xl border border-white/[0.08] bg-surface/80 p-3 shadow-card backdrop-blur-xl md:-left-10"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-widest text-text-2">
              AI Recommendation
            </div>
            <div className="truncate text-sm font-medium">
              MacBook Pro M3 Max
            </div>
          </div>
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success ring-1 ring-success/30">
            98% match
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute -right-2 bottom-10 w-56 rounded-2xl border border-white/[0.08] bg-surface/80 p-3 shadow-card backdrop-blur-xl md:-right-8"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30">
            <Truck size={16} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-text-2">
              Delivery
            </div>
            <div className="text-sm font-medium">In 47 minutes</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute -bottom-4 left-1/2 w-60 -translate-x-1/2 rounded-2xl border border-white/[0.08] bg-surface/80 p-3 shadow-card backdrop-blur-xl"
      >
        <div className="text-[11px] uppercase tracking-widest text-text-2">
          Today&apos;s revenue
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="font-display text-2xl font-semibold">$248,420</span>
          <span className="text-xs font-semibold text-emerald-400">+12.4%</span>
        </div>
        <div className="mt-2 flex h-7 items-end gap-1">
          {[40, 65, 35, 70, 55, 85, 60, 95, 75, 90, 65, 100].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-primary-600 to-accent-purple"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
