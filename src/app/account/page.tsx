"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package,
  CreditCard,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

const tabs = [
  { Icon: Package, l: "Orders" },
  { Icon: Heart, l: "Wishlist" },
  { Icon: MapPin, l: "Addresses" },
  { Icon: CreditCard, l: "Payments" },
  { Icon: Settings, l: "Settings" },
];

export default function AccountPage() {
  return (
    <div className="pt-32">
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="section-eyebrow">Hello again</div>
            <h1 className="section-title mt-2">
              Welcome back, <span className="text-gradient-brand">Alex</span>
            </h1>
            <p className="mt-2 text-text-2">
              Member since 2024 · Gold tier · 12 orders
            </p>
          </div>
          <button className="btn btn-ghost">
            <LogOut size={14} /> Sign out
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="relative inline-block h-12 w-12 overflow-hidden rounded-full ring-1 ring-white/10">
                  <Image
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80"
                    width={48}
                    height={48}
                    alt=""
                  />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">Alex Vance</div>
                  <div className="truncate text-xs text-text-2">
                    alex@nexcart.app
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat l="Orders" v="12" />
                <Stat l="Saved" v="$2.4k" />
                <Stat l="Points" v="4,820" />
              </div>
            </div>

            <nav className="space-y-1 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-3 backdrop-blur-xl">
              {tabs.map(({ Icon, l }, i) => (
                <button
                  key={l}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    i === 0
                      ? "bg-white/[0.07] text-white ring-1 ring-white/[0.08]"
                      : "text-text-2 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon size={15} />
                  {l}
                </button>
              ))}
            </nav>
          </aside>

          <section>
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div className="font-display text-lg font-semibold">Recent orders</div>
                <span className="chip">
                  <Sparkles size={12} /> 2 in transit
                </span>
              </div>
              <ul className="divide-y divide-white/[0.06]">
                {products.slice(0, 4).map((p, i) => (
                  <motion.li
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="flex items-center gap-4 py-4"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
                      <Image src={p.images[0]} alt="" fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-text-2">
                        Order #NX-{1024 + i} · placed 3 days ago
                      </div>
                    </div>
                    <span
                      className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ring-1 md:inline ${
                        i % 2
                          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                          : "bg-primary-500/15 text-primary-200 ring-primary-500/30"
                      }`}
                    >
                      {i % 2 ? "Delivered" : "In transit"}
                    </span>
                    <span className="font-display text-sm font-semibold">
                      {formatPrice(p.price)}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
      <div className="h-32" />
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
