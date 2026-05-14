"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { useAuthGate } from "@/store/auth-gate";

export function CartDrawer() {
  const router = useRouter();
  const { open, closeCart, lines, setQty, remove } = useCart();
  const { user } = useAuth();
  const openGate = useAuthGate((s) => s.openGate);
  const subtotal = lines.reduce((a, l) => a + l.price * l.quantity, 0);
  const shippingFree = 500;
  const progress = Math.min(100, (subtotal / shippingFree) * 100);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-bg/60 backdrop-blur-md"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-white/[0.06] bg-surface/95 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div>
                <div className="font-display text-lg font-semibold">Your Cart</div>
                <div className="text-xs text-text-2">
                  {lines.length} {lines.length === 1 ? "item" : "items"} reserved
                </div>
              </div>
              <button
                onClick={closeCart}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-2 hover:bg-white/[0.05] hover:text-white"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {lines.length > 0 && (
              <div className="px-6 pt-4">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-2">
                      {subtotal >= shippingFree
                        ? "You unlocked free shipping ✨"
                        : `Spend ${formatPrice(shippingFree - subtotal)} more for free shipping`}
                    </span>
                    <span className="text-text-2">
                      {formatPrice(subtotal)} / {formatPrice(shippingFree)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 24 }}
                      className="h-full rounded-full bg-gradient-brand"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-white/[0.03]">
                    <ShoppingBag size={22} className="text-primary-400" />
                  </div>
                  <div className="font-display text-lg font-semibold">
                    Your cart is empty
                  </div>
                  <p className="mt-2 max-w-xs text-sm text-text-2">
                    Let our AI find products tailored exactly to you.
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="btn btn-primary mt-6"
                  >
                    Explore the catalog
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {lines.map((l) => (
                    <li
                      key={l.id}
                      className="flex gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
                        <Image src={l.image} alt={l.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${l.slug}`}
                            onClick={closeCart}
                            className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary-300"
                          >
                            {l.name}
                          </Link>
                          <button
                            onClick={() => remove(l.id)}
                            className="text-text-2 hover:text-danger"
                            aria-label="Remove"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-white/[0.06] bg-white/[0.02]">
                            <button
                              onClick={() => setQty(l.id, l.quantity - 1)}
                              className="grid h-7 w-7 place-items-center text-text-2 hover:text-white"
                              aria-label="Decrease"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-6 text-center text-xs">{l.quantity}</span>
                            <button
                              onClick={() => setQty(l.id, l.quantity + 1)}
                              className="grid h-7 w-7 place-items-center text-text-2 hover:text-white"
                              aria-label="Increase"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <div className="text-sm font-semibold">
                            {formatPrice(l.price * l.quantity)}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-white/[0.06] p-6">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-text-2">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="mb-4 text-xs text-text-2">
                  Taxes and shipping calculated at checkout.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      closeCart();
                      openGate({
                        title: "Sign in to checkout",
                        description:
                          "Sign in or create a free account to place your order securely.",
                        intent: "checkout",
                      });
                      return;
                    }
                    closeCart();
                    router.push("/checkout");
                  }}
                  className="btn btn-primary w-full"
                >
                  Checkout securely <ArrowRight size={16} />
                </button>
                <button
                  onClick={closeCart}
                  className="mt-2 w-full rounded-full py-2 text-sm text-text-2 hover:text-white"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
