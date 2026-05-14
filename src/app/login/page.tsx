"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search?.get("next") ?? "/account";
  const queryError = search?.get("error");

  // Auth state of the visitor
  const [meEmail, setMeEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<"email" | "google" | "signout" | null>(
    null,
  );
  const [err, setErr] = useState<string | null>(queryError ?? null);

  // Check existing session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!cancelled) setMeEmail(user?.email ?? null);
      } catch {
        /* env missing — fall through to form */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function validateEmail(value: string) {
    if (!value.trim()) return "Email is required.";
    if (!EMAIL_RE.test(value)) return "That doesn't look like a valid email.";
    return null;
  }

  async function onEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = password.length === 0 ? "Enter your password." : null;
    setEmailErr(eErr);
    setPwdErr(pErr);
    if (eErr || pErr) return;

    setErr(null);
    setLoading("email");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login credentials")) {
          setErr(
            "We couldn't find an account with that email and password. Did you mean to sign up first?",
          );
        } else if (msg.includes("email not confirmed")) {
          setErr(
            "Your email isn't verified yet. Check your inbox for the 6-digit code or the verification link.",
          );
        } else {
          setErr(error.message);
        }
        // Clear password on failure, keep email so they can retry
        setPassword("");
        setLoading(null);
        return;
      }
      router.refresh();
      router.push(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
      setPassword("");
      setLoading(null);
    }
  }

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
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(null);
    }
  }

  async function onSignOut() {
    setLoading("signout");
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setMeEmail(null);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  // ── States ────────────────────────────────────────────────────────────

  if (checking) {
    return (
      <div className="grid min-h-[60vh] place-items-center pt-24">
        <Loader2 size={20} className="animate-spin text-text-2" />
      </div>
    );
  }

  // Already signed in — show a friendly switcher
  if (meEmail) {
    return (
      <div className="grid min-h-screen place-items-center pt-24">
        <div className="container max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-bg/60 p-8 backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
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
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-300"
                />
                <div>
                  <div className="font-semibold text-emerald-100">
                    You&apos;re already signed in
                  </div>
                  <div className="text-emerald-200/80">as {meEmail}</div>
                </div>
              </div>
              <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">
                No need to sign in again.
              </h1>
              <p className="mt-1 text-sm text-text-2">
                Want to continue, or switch to a different account?
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Link href={next} className="btn btn-primary w-full">
                  <ArrowRight size={14} /> Continue
                </Link>
                <button
                  onClick={onSignOut}
                  disabled={loading === "signout"}
                  className="btn btn-ghost w-full disabled:opacity-60"
                >
                  {loading === "signout" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <LogOut size={14} />
                  )}
                  {loading === "signout" ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Default: sign-in form
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

            {err && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200"
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>{err}</span>
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
                  <Loader2 size={14} className="animate-spin" />
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

            <form onSubmit={onEmailSubmit} className="space-y-3" noValidate>
              <Field
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailErr) setEmailErr(null);
                }}
                onBlur={() => setEmailErr(validateEmail(email))}
                error={emailErr}
              />
              <div className="relative">
                <Field
                  label="Password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (pwdErr) setPwdErr(null);
                  }}
                  error={pwdErr}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-9 text-text-2 hover:text-white"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
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
              <button
                type="submit"
                disabled={loading === "email"}
                className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading === "email" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <LogIn size={14} />
                )}
                {loading === "email" ? "Signing in…" : "Sign in"}
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
  error,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-text-2">
        {label}
      </span>
      <input
        {...rest}
        aria-invalid={!!error}
        className={`w-full rounded-xl border ${
          error ? "border-rose-500/50" : "border-white/[0.08]"
        } bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20`}
      />
      {error && (
        <span className="mt-1 inline-flex items-center gap-1 text-xs text-rose-300">
          <AlertTriangle size={11} /> {error}
        </span>
      )}
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
