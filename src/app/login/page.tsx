"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [show, setShow] = useState(false);
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

            <div className="mt-6 grid gap-2">
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm hover:bg-white/[0.06]">
                <GoogleIcon /> Continue with Google
              </button>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm hover:bg-white/[0.06]">
                <AppleIcon /> Continue with Apple
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

function AppleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.39 2.21-1.04 3.04-.7.88-1.84 1.55-2.94 1.46-.13-1.12.42-2.27 1.07-3.02.74-.88 2-1.55 2.91-1.48zM20.5 17.16c-.6 1.37-.89 1.97-1.66 3.18-1.07 1.66-2.58 3.73-4.45 3.74-1.65.02-2.08-1.06-4.34-1.06-2.26 0-2.72 1.04-4.37 1.07-1.78.03-3.13-1.84-4.2-3.5C-.5 17.2-.84 11.6 1.7 8.65c1.62-1.85 3.7-2.94 5.7-2.94 1.74 0 2.85 1.04 4.32 1.04 1.43 0 2.3-1.04 4.31-1.04 1.51 0 3.12.82 4.27 2.22-3.76 2.06-3.15 7.45.2 9.23z" />
    </svg>
  );
}
