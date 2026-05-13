"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useCommandPalette } from "@/store/command";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?ai=1", label: "AI Picks" },
  { href: "/shop?sale=1", label: "Deals" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const openCart = useCart((s) => s.openCart);
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.quantity, 0));
  const wishCount = useWishlist((s) => s.items.length);
  const openPalette = useCommandPalette((s) => s.openPalette);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-300",
        scrolled ? "bg-bg/70 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="container flex h-24 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="NexCart home"
          className="group inline-flex items-center"
        >
          <Image
            src="/brand/nexcart-logo.webp"
            alt="NexCart"
            width={1200}
            height={600}
            priority
            className="h-14 w-auto transition-transform group-hover:scale-[1.02] md:h-16"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.href === pathname;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm transition-colors",
                  active
                    ? "text-white"
                    : "text-text-2 hover:text-white",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-bubble"
                    className="absolute inset-0 -z-10 rounded-full bg-white/[0.07] ring-1 ring-white/[0.08]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={openPalette}
            className="hidden h-9 items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 text-sm text-text-2 transition hover:bg-white/[0.06] md:flex"
            aria-label="Open search"
          >
            <Search size={15} />
            <span className="hidden lg:inline">Search products…</span>
            <kbd className="ml-2 hidden rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-text-2 lg:inline">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={openPalette}
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-2 hover:bg-white/[0.05] hover:text-white md:hidden"
          >
            <Search size={17} />
          </button>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative hidden h-9 w-9 items-center justify-center rounded-full text-text-2 hover:bg-white/[0.05] hover:text-white md:inline-flex"
          >
            <Heart size={17} />
            {wishCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white">
                {wishCount}
              </span>
            )}
          </Link>
          <Link
            href="/login"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-text-2 hover:bg-white/[0.05] hover:text-white md:inline-flex"
            aria-label="Account"
          >
            <User size={18} />
          </Link>
          <button
            onClick={openCart}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-text-2 hover:bg-white/[0.05] hover:text-white"
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-brand px-1 text-[10px] font-semibold leading-none text-white">
                {count}
              </span>
            )}
          </button>
          <Link
            href="/shop"
            className="ml-1 hidden h-9 items-center gap-1.5 rounded-full bg-gradient-brand px-4 text-sm font-medium text-white shadow-glow transition hover:brightness-110 md:inline-flex"
          >
            <Sparkles size={14} />
            Start Shopping
          </Link>

          <button
            onClick={() => setMenu((v) => !v)}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-text-2 md:hidden"
            aria-label="Toggle menu"
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/[0.06] bg-bg/90 backdrop-blur-xl md:hidden"
          >
            <div className="container flex flex-col py-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenu(false)}
                  className="rounded-xl px-3 py-3 text-sm text-text-2 transition hover:bg-white/[0.04] hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/shop"
                onClick={() => setMenu(false)}
                className="btn btn-primary mt-2 justify-center"
              >
                <Sparkles size={14} /> Start Shopping
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
