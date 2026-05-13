"use client";

import { motion } from "framer-motion";

export function AnimatedBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg opacity-60" />
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-primary-600/30 blur-[120px]"
      />
      <motion.div
        initial={{ opacity: 0.45 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-40 right-[-160px] h-[520px] w-[520px] rounded-full bg-accent-purple/30 blur-[140px]"
      />
      <motion.div
        initial={{ opacity: 0.35 }}
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-[-220px] left-1/3 h-[600px] w-[600px] rounded-full bg-accent-cyan/20 blur-[160px]"
      />
      <div className="absolute inset-0 noise opacity-[0.5] mix-blend-overlay" />
    </div>
  );
}
