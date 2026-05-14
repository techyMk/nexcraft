"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Brain,
  Compass,
  MessagesSquare,
  TrendingUp,
  Wand2,
} from "lucide-react";

const cards = [
  {
    Icon: Wand2,
    title: "Personalized picks",
    desc: "We learn your taste in seconds and shape your storefront in real time.",
  },
  {
    Icon: Compass,
    title: "Smart discovery",
    desc: "Search by feeling, photo or vibe — NexCart finds it instantly.",
  },
  {
    Icon: TrendingUp,
    title: "Trend intelligence",
    desc: "Catch products that are about to be huge, before everyone else.",
  },
  {
    Icon: MessagesSquare,
    title: "Conversational shopping",
    desc: "Chat with our AI assistant to compare, choose and check out — no friction.",
  },
];

export function AISection() {
  return (
    <section className="section">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-surface to-surface-2/40 p-8 md:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent-purple/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-primary-600/30 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />

          <div className="relative grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <div className="chip">
                <Brain size={12} /> NexCart Intelligence™
              </div>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                Shopping that{" "}
                <span className="text-gradient-brand">thinks ahead</span>.
              </h2>
              <p className="mt-4 max-w-lg text-text-2">
                Our intelligence layer continuously learns from millions of
                signals to deliver the right product at the perfect moment —
                across every device.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {cards.map(({ Icon, title, desc }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-primary-300 ring-1 ring-white/[0.06]">
                      <Icon size={16} />
                    </span>
                    <div className="mt-3 text-sm font-semibold">{title}</div>
                    <div className="mt-1 text-xs text-text-2">{desc}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <AIChatPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function AIChatPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative mx-auto w-full max-w-md rounded-3xl border border-white/[0.08] bg-bg/70 p-4 shadow-card backdrop-blur-2xl"
    >
      <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-gradient-brand">
            <Image
              src="/brand/bot-icon.webp"
              alt=""
              width={256}
              height={256}
              className="h-6 w-6 object-contain drop-shadow"
            />
          </div>
          <div>
            <div className="text-sm font-semibold">NexCart Assistant</div>
            <div className="text-[11px] text-text-2">Online · responding</div>
          </div>
        </div>
        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success ring-1 ring-success/30">
          AI · v3
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-gradient-brand px-3 py-2 text-white">
          I need a laptop for editing 4K video under $2500.
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/[0.04] px-3 py-2 text-text">
          Got it. I&apos;ve ranked 12 options. Top pick:{" "}
          <span className="font-semibold text-white">MacBook Pro 14” M3 Max</span>{" "}
          — best sustained performance, color-accurate display, 22h battery.
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3"
        >
          <div className="flex items-center justify-between text-xs text-text-2">
            <span>Why this match?</span>
            <span className="text-emerald-400">98% match</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            <li className="flex items-center gap-2 text-text">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400" /> M3 Max with
              40-core GPU
            </li>
            <li className="flex items-center gap-2 text-text">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400" /> Liquid
              Retina XDR · P3 wide gamut
            </li>
            <li className="flex items-center gap-2 text-text">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400" /> $2,499 ·
              free 2-day delivery
            </li>
          </ul>
        </motion.div>
        <div className="flex items-center gap-2 pt-1 text-text-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400 [animation-delay:0.15s]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400 [animation-delay:0.3s]" />
          <span className="text-xs">Generating alternatives…</span>
        </div>
      </div>
    </motion.div>
  );
}
