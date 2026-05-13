"use client";

import { heroLogos } from "@/lib/data";

export function BrandStrip() {
  return (
    <section className="relative z-10 pt-12">
      <div className="container">
        <div className="text-center text-xs uppercase tracking-[0.2em] text-text-2">
          Trusted by the brands you already love
        </div>
        <div className="mt-6 overflow-hidden mask-fade-b">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
            {heroLogos.map((b) => (
              <span
                key={b}
                className="font-display text-xl font-semibold tracking-tight text-text-2 transition hover:text-white"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
