"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Eraser,
  Loader2,
  Pencil,
  Upload,
  X,
} from "lucide-react";
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
    if (typeof document === "undefined") return;
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
      setTimeout(() => onClose(), 700);
    });
  }

  const dirty =
    fullName.trim() !== initialFullName.trim() ||
    avatarUrl.trim() !== (initialAvatarUrl ?? "").trim();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !pending && onClose()}
            aria-label="Close"
            className="absolute inset-0 cursor-default bg-bg/70 backdrop-blur-md"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-profile-title"
              className="pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/[0.08] bg-surface/95 shadow-card backdrop-blur-2xl"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-accent-purple/20 blur-3xl" />

              <div className="relative flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-500/15 text-primary-300 ring-1 ring-primary-500/30">
                    <Pencil size={13} />
                  </span>
                  <div
                    id="edit-profile-title"
                    className="font-display text-base font-semibold"
                  >
                    Edit profile
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !pending && onClose()}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-2 hover:bg-white/[0.05] hover:text-white"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={onSubmit} className="relative space-y-5 p-6">
                {/* Hero avatar */}
                <div className="flex flex-col items-center gap-3 pt-1 pb-1 sm:flex-row sm:items-center sm:gap-5">
                  <span className="relative inline-flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-brand text-lg font-semibold ring-2 ring-white/10 shadow-glow">
                    {avatarUrl ? (
                      <Image
                        key={avatarUrl}
                        src={avatarUrl}
                        alt="Avatar preview"
                        width={80}
                        height={80}
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
                  <div className="text-center text-xs text-text-2 sm:text-left">
                    <div className="text-sm text-text">Avatar</div>
                    <div className="mt-0.5">
                      Paste any public image URL below, or leave blank to use
                      your initials.
                    </div>
                    <div className="mt-1 text-[11px] text-text-2/80">
                      File uploads via Supabase Storage land in the next migration.
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
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-text-2">
                      Avatar URL
                    </span>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl("")}
                        className="inline-flex items-center gap-1 text-[11px] text-text-2 hover:text-white"
                      >
                        <Eraser size={11} /> Clear
                      </button>
                    )}
                  </div>
                  <input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    type="url"
                    placeholder="https://…"
                    className="w-full truncate rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20"
                  />
                </label>

                <button
                  type="button"
                  disabled
                  title="Coming in the next migration"
                  className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] py-2.5 text-xs text-text-2"
                >
                  <Upload size={13} /> Upload from device · coming soon
                </button>

                {err && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span className="break-words">{err}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
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
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
