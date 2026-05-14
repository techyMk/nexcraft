"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const suggestions = [
  "Find me a laptop under $2000",
  "Best noise-cancelling headphones",
  "Compare iPhone 15 Pro vs Galaxy S24",
  "Surprise me with an AI gadget",
];

export function AIAssistantFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 280 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[60] inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-white shadow-glow ring-1 ring-white/20"
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      >
        <span className="absolute inset-0 -z-10 animate-pulse-slow rounded-full bg-gradient-brand opacity-50 blur-xl" />
        {open ? (
          <X size={20} />
        ) : (
          <Image
            src="/brand/bot-icon.webp"
            alt=""
            width={256}
            height={256}
            priority
            className="h-11 w-11 object-contain drop-shadow"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="fixed bottom-24 right-6 z-[60] w-[92vw] max-w-sm overflow-hidden rounded-3xl border border-white/[0.08] bg-surface/95 shadow-card backdrop-blur-2xl"
          >
            <div className="relative border-b border-white/[0.06] p-5">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/40 to-transparent" />
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand shadow-glow">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-display text-base font-semibold">
                    NexCart Intelligence™
                  </div>
                  <div className="text-xs text-text-2">
                    Hello, I&apos;m here to find what you need.
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2 p-5">
              {suggestions.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="block w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-left text-sm text-text-2 transition hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
                >
                  {s}
                </motion.button>
              ))}
            </div>
            <div className="border-t border-white/[0.06] p-3">
              <form className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                <input
                  placeholder="Ask anything about shopping…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-2"
                />
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-white"
                  aria-label="Send"
                >
                  <Send size={14} />
                </button>
              </form>
              <div className="mt-2 text-center text-[10px] uppercase tracking-widest text-text-2">
                Beta · Powered by NexCart Intelligence™
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
