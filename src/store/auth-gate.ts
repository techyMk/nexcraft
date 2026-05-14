"use client";

import { create } from "zustand";

export type AuthIntent = "cart" | "wishlist" | "checkout" | "generic";

type AuthGateState = {
  open: boolean;
  title: string;
  description: string;
  intent: AuthIntent;
  openGate: (opts?: {
    title?: string;
    description?: string;
    intent?: AuthIntent;
  }) => void;
  closeGate: () => void;
};

const DEFAULTS = {
  title: "Sign in to continue",
  description:
    "Create a free account to save products, build your wishlist, and check out faster.",
  intent: "generic" as AuthIntent,
};

export const useAuthGate = create<AuthGateState>((set) => ({
  open: false,
  title: DEFAULTS.title,
  description: DEFAULTS.description,
  intent: DEFAULTS.intent,
  openGate: (opts) =>
    set({
      open: true,
      title: opts?.title ?? DEFAULTS.title,
      description: opts?.description ?? DEFAULTS.description,
      intent: opts?.intent ?? DEFAULTS.intent,
    }),
  closeGate: () => set({ open: false }),
}));
