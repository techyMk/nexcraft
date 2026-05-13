"use client";

import Image from "next/image";
import { Bell, Search, Sparkles } from "lucide-react";

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/[0.06] bg-surface/60 px-6 backdrop-blur-xl md:px-8">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-2"
          />
          <input
            placeholder="Search products, orders, customers…"
            className="h-10 w-full rounded-full border border-white/[0.06] bg-white/[0.03] pl-9 pr-4 text-sm outline-none placeholder:text-text-2 focus:border-white/[0.14]"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="chip">
          <Sparkles size={12} /> AI Copilot
        </span>
        <button
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-full border border-white/[0.06] bg-white/[0.03] text-text-2 hover:text-white"
        >
          <Bell size={15} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gradient-brand" />
        </button>
        <span className="relative inline-block h-9 w-9 overflow-hidden rounded-full ring-1 ring-white/10">
          <Image
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
            alt=""
            width={36}
            height={36}
          />
        </span>
      </div>
    </header>
  );
}
