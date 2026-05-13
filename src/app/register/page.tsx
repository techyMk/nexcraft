"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AlertTriangle, Brain, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [loading, setLoading] = useState<"google" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onGoogle() {
    setErr(null);
    setLoading("google");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/account`,
        },
      });
      if (error) {
        setErr(error.message);
        setLoading(null);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-up failed");
      setLoading(null);
    }
  }

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
              {err && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>{err}</span>
                </div>
              )}
              <button
                type="button"
                onClick={onGoogle}
                disabled={loading === "google"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading === "google" ? (
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <GoogleIcon />
                )}
                {loading === "google" ? "Redirecting…" : "Continue with Google"}
              </button>
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

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#fff"
        d="M21.35 11.1H12v3.2h5.35c-.24 1.4-1.74 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.84 3.94 14.66 3 12 3 6.92 3 2.85 7.06 2.85 12s4.07 9 9.15 9c5.27 0 8.78-3.7 8.78-8.92 0-.6-.07-1.06-.16-1.48z"
      />
    </svg>
  );
}
