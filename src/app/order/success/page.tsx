"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export default function OrderSuccessPage() {
  return (
    <div className="grid place-items-center pt-24 md:pt-32">
      <div className="container max-w-2xl text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-brand shadow-glow"
        >
          <Check size={32} className="text-white" />
        </motion.div>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">
          Order confirmed.
        </h1>
        <p className="mt-3 text-text-2">
          Thanks! Your AI-curated order is on the way. We&apos;ve emailed your
          receipt and tracking link.
        </p>
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.03] px-5 py-2 text-sm">
          <Sparkles size={14} className="text-primary-300" />
          Order #NX-{Math.floor(Math.random() * 99999)}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/account" className="btn btn-primary">
            Track order <ArrowRight size={16} />
          </Link>
          <Link href="/shop" className="btn btn-ghost">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
