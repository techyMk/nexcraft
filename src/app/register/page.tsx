"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, Brain } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen place-items-center pt-24">
      <div className="container">
        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative hidden overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-primary-700/30 via-accent-purple/20 to-bg p-10 backdrop-blur-2xl lg:flex lg:flex-col lg:justify-between"
          >
            <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
            <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-primary-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-accent-purple/30 blur-3xl" />
            <div className="relative">
              <Link href="/" aria-label="NexCart home" className="inline-flex">
                <Image
                  src="/brand/nexcart-logo.webp"
                  alt="NexCart"
                  width={1200}
                  height={600}
                  priority
                  className="h-16 w-auto"
                />
              </Link>
              <h2 className="mt-10 font-display text-4xl font-semibold leading-tight tracking-tight">
                Join the future of{" "}
                <span className="text-gradient-brand">commerce</span>.
              </h2>
              <p className="mt-4 max-w-md text-text-2">
                Get 10% off your first order, exclusive AI-curated picks and
                premium support — free.
              </p>
            </div>
            <ul className="relative space-y-3">
              {(
                [
                  [Sparkles, "Personalized AI recommendations"],
                  [Zap, "Lightning-fast express delivery"],
                  [Brain, "Smart wishlists & price drops"],
                  [ShieldCheck, "2-year warranty on every product"],
                ] as const
              ).map(([I, t]) => (
                <li
                  key={t}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3"
                >
                  <I size={16} className="text-primary-300" />
                  <span className="text-sm">{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-bg/60 p-8 backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-600/30 blur-3xl" />
            <div className="relative">
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                Create your account
              </h1>
              <p className="mt-1 text-sm text-text-2">
                Already have one?{" "}
                <Link href="/login" className="text-primary-300 hover:text-white">
                  Sign in
                </Link>
              </p>

              <form className="mt-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name" placeholder="Alex" />
                  <Field label="Last name" placeholder="Vance" />
                </div>
                <Field label="Email" type="email" placeholder="you@email.com" />
                <Field label="Password" type="password" placeholder="At least 8 characters" />
                <label className="flex items-start gap-2 text-xs text-text-2">
                  <input type="checkbox" className="mt-0.5 accent-primary-500" defaultChecked />
                  I agree to the{" "}
                  <Link href="#" className="text-primary-300">Terms</Link>{" "}
                  &amp;{" "}
                  <Link href="#" className="text-primary-300">Privacy Policy</Link>.
                </label>
                <button className="btn btn-primary mt-2 w-full">
                  <Sparkles size={14} /> Create account
                </button>
              </form>

              <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-text-2">
                <span className="h-px flex-1 bg-white/[0.06]" /> or sign up with
                <span className="h-px flex-1 bg-white/[0.06]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm hover:bg-white/[0.06]">
                  Google
                </button>
                <button className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm hover:bg-white/[0.06]">
                  Apple
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-text-2">
        {label}
      </span>
      <input
        {...rest}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20"
      />
    </label>
  );
}
