"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Loader2, Pencil, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateProfileAction } from "./actions";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EditProfileModal({
  open,
  onClose,
  initialFullName,
  initialAvatarUrl,
}: {
  open: boolean;
  onClose: () => void;
  initialFullName: string;
  initialAvatarUrl: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(initialFullName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setFullName(initialFullName);
      setAvatarUrl(initialAvatarUrl ?? "");
      setErr(null);
      setSaved(false);
    }
  }, [open, initialFullName, initialAvatarUrl]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onClose]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    startTransition(async () => {
      const result = await updateProfileAction({ fullName, avatarUrl });
      if (!result.ok) {
        setErr(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
      // brief success state before auto-close
      setTimeout(() => onClose(), 700);
    });
  }

  const dirty =
    fullName.trim() !== initialFullName.trim() ||
    avatarUrl.trim() !== (initialAvatarUrl ?? "").trim();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !pending && onClose()}
            className="fixed inset-0 z-[80] bg-bg/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-[90] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/[0.08] bg-surface/95 shadow-card backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-2">
                <Pencil size={15} className="text-primary-300" />
                <div className="font-display text-base font-semibold">
                  Edit profile
                </div>
              </div>
              <button
                onClick={() => !pending && onClose()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-2 hover:bg-white/[0.05] hover:text-white"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <span className="relative inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-brand text-base font-semibold ring-1 ring-white/10">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Preview"
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <span className="text-white">
                      {initials(fullName) || "·"}
                    </span>
                  )}
                </span>
                <div className="text-xs text-text-2">
                  <div className="text-text">Avatar preview</div>
                  <div className="mt-0.5">
                    Paste any public image URL.
                    <br className="hidden sm:block" />
                    Avatar uploads via Supabase Storage land in the next migration.
                  </div>
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-widest text-text-2">
                  Full name
                </span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  maxLength={80}
                  placeholder="Alex Vance"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-widest text-text-2">
                  Avatar URL
                </span>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  type="url"
                  placeholder="https://lh3.googleusercontent.com/…"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20"
                />
                <span className="mt-1.5 block text-[11px] text-text-2">
                  Leave empty to use your initials.
                </span>
              </label>

              {err && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>{err}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={pending}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-text-2 hover:text-white disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending || !dirty || saved}
                  className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving…
                    </>
                  ) : saved ? (
                    <>
                      <Check size={14} /> Saved
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Save changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
