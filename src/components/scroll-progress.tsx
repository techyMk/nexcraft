"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Thin gradient bar pinned flush under the navbar. scaleX is driven *directly*
 * by scrollYProgress (no spring) so the position is always an accurate marker
 * of how far through the page the user is — exactly mirrors the native
 * right-side scrollbar that we hide in globals.css.
 */
export function ScrollProgress() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  // Hide entirely when at the very top so no sliver shows.
  const opacity = useTransform(scrollYProgress, [0, 0.002], [0, 1]);

  // Admin has its own layout (no public navbar) — skip there.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        scaleX: scrollYProgress,
        opacity,
        transformOrigin: "0% 50%",
      }}
      className="pointer-events-none fixed inset-x-0 top-[6rem] z-40 h-[2px] bg-gradient-brand will-change-transform"
    />
  );
}
