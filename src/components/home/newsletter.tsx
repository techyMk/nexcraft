"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Newsletter() {
  return (
    <section className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-primary-700/30 via-accent-purple/20 to-primary-700/30 p-10 text-center md:p-16"
        >
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
          <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-primary-500/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-accent-purple/40 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <div className="chip mx-auto">
              <Sparkles size={12} /> Insiders only
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              Get exclusive AI-picked deals first.
            </h2>
            <p className="mt-3 text-text-2">
              Subscribe to receive private drops, intelligent recommendations
              and 10% off your first order.
            </p>
            <form className="mx-auto mt-8 flex max-w-lg overflow-hidden rounded-full border border-white/[0.08] bg-bg/60 p-1.5 backdrop-blur-xl">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-text-2"
              />
              <button className="rounded-full bg-gradient-brand px-5 py-2 text-sm font-medium text-white shadow-glow">
                Subscribe
              </button>
            </form>
            <div className="mt-4 text-xs text-text-2">
              No spam. Unsubscribe anytime. Trusted by 50k+ subscribers.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
