"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Thin gradient bar that sits flush under the navbar and fills as the user
 * scrolls. Replaces the native right-side scrollbar visually (the native
 * scrollbar is hidden globally in globals.css).
 */
export function ScrollProgress() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  // Admin has its own layout (no public navbar) — skip there.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-[6rem] z-40 h-[3px] origin-left bg-gradient-brand shadow-[0_0_12px_rgba(91,140,255,0.6)]"
    />
  );
}
