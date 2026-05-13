"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Brain,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import Image from "next/image";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

const signals = [
  {
    tone: "success" as const,
    Icon: CheckCircle2,
    title: "Audio category is trending up",
    body: "Engagement is +24% vs last week. Boost AirPods Pro 2 to top of homepage to capture demand.",
    action: "Promote on homepage",
  },
  {
    tone: "warning" as const,
    Icon: AlertTriangle,
    title: "iPhone 15 Pro Max nearing stockout",
    body: "Projected sellout in ~72h based on current velocity. Suggest restocking 200 units.",
    action: "Reorder stock",
  },
  {
    tone: "info" as const,
    Icon: Sparkles,
    title: "High-intent cohort detected",
    body: "342 users have viewed MacBook Pro M3 ≥ 3 times this week. Triggering personalized push.",
    action: "Run AI campaign",
  },
];

const toneStyles = {
  success: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  info: "bg-primary-500/15 text-primary-200 ring-primary-500/30",
};

const intentBars = [12, 18, 22, 14, 26, 32, 28, 40, 36, 52, 48, 64, 58, 76, 70, 92];

export default function AdminAIInsights() {
  const aiPicks = products.filter((p) => p.badge === "AI PICK").slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow">Intelligence</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            AI Insights
          </h1>
          <p className="mt-1 text-sm text-text-2">
            Live signals from NexCart Intelligence™ · refreshed every 90s
          </p>
        </div>
        <span className="chip">
          <Sparkles size={12} /> Copilot online
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {[
          { l: "Model accuracy", v: "94.2%", d: "+0.8% w/w", Icon: Brain, up: true },
          { l: "Picks served", v: "2.4M", d: "+18%", Icon: Sparkles, up: true },
          { l: "Bounce rate", v: "12.6%", d: "-1.2%", Icon: TrendingDown, up: true },
        ].map((k) => (
          <div
            key={k.l}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between text-xs text-text-2">
              <span>{k.l}</span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.04] text-primary-300 ring-1 ring-white/[0.06]">
                <k.Icon size={14} />
              </span>
            </div>
            <div className="mt-3 font-display text-2xl font-semibold tracking-tight">
              {k.v}
            </div>
            <div className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${k.up ? "text-emerald-400" : "text-rose-400"}`}>
              <TrendingUp size={12} /> {k.d}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Recommended actions</div>
              <div className="text-xs text-text-2">Prioritized by projected revenue lift</div>
            </div>
            <span className="chip">
              <Sparkles size={12} /> 3 new
            </span>
          </div>
          <ul className="mt-5 space-y-3">
            {signals.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <span
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ${toneStyles[s.tone]}`}
                >
                  <s.Icon size={15} />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{s.title}</div>
                  <p className="mt-0.5 text-sm text-text-2">{s.body}</p>
                </div>
                <button className="hidden shrink-0 items-center gap-1.5 rounded-full bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-glow md:inline-flex">
                  {s.action} <ArrowUpRight size={12} />
                </button>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Intent score</div>
              <div className="text-xs text-text-2">Last 16 hours, live</div>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
              Trending ↑
            </span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-1.5">
            {intentBars.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.6, delay: i * 0.03 }}
                className="flex-1 rounded-sm bg-gradient-to-t from-primary-700 to-accent-purple"
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <Stat l="Sessions" v="12,408" />
            <Stat l="High intent" v="2,140" />
            <Stat l="Converted" v="586" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
          <div className="text-sm font-semibold">Top AI picks this week</div>
          <span className="text-xs text-text-2">Ranked by match score</span>
        </div>
        <ul className="divide-y divide-white/[0.06]">
          {aiPicks.map((p, i) => (
            <li key={p.id} className="flex items-center gap-4 p-4">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.04] text-xs text-text-2">
                {i + 1}
              </div>
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
                <Image src={p.images[0]} alt="" fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{p.name}</div>
                <div className="text-xs text-text-2">{p.category}</div>
              </div>
              <span className="hidden text-sm font-display font-semibold md:inline">
                {formatPrice(p.price)}
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                {(98 - i * 2).toFixed(0)}% match
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] py-2">
      <div className="text-sm font-semibold">{v}</div>
      <div className="text-[10px] uppercase tracking-widest text-text-2">{l}</div>
    </div>
  );
}
