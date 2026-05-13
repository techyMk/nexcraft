"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AlertTriangle, Eye, EyeOff, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState<"google" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const search = useSearchParams();
  const next = search?.get("next") ?? "/account";
  const queryError = search?.get("error");

  async function onGoogle() {
    setErr(null);
    setLoading("google");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setErr(error.message);
        setLoading(null);
      }
      // success → browser is redirecting, keep the spinner state
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(null);
    }
  }
  return (
    <div className="grid min-h-screen place-items-center pt-24">
      <div className="container max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-bg/60 p-8 backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-600/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-purple/30 blur-3xl" />
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
            <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
              Welcome back.
            </h1>
            <p className="mt-1 text-sm text-text-2">
              Sign in to continue your intelligent shopping journey.
            </p>

            {(err || queryError) && (
              <div className="mt-6 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>{err ?? queryError}</span>
              </div>
            )}

            <div className="mt-6">
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

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-text-2">
              <span className="h-px flex-1 bg-white/[0.06]" /> or with email
              <span className="h-px flex-1 bg-white/[0.06]" />
            </div>

            <form className="space-y-3">
              <Field label="Email" type="email" placeholder="you@email.com" />
              <div className="relative">
                <Field
                  label="Password"
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-9 text-text-2 hover:text-white"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-text-2">
                  <input
                    type="checkbox"
                    className="accent-primary-500"
                    defaultChecked
                  />
                  Remember me
                </label>
                <a href="#" className="text-primary-300 hover:text-white">
                  Forgot password?
                </a>
              </div>
              <button type="button" className="btn btn-primary w-full">
                <Sparkles size={14} /> Sign in
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-text-2">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary-300 hover:text-white">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
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

