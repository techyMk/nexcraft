"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Truck,
  Check,
  Sparkles,
  Apple,
} from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

const steps = ["Address", "Shipping", "Payment", "Review"] as const;

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [pm, setPm] = useState<"card" | "paypal" | "apple" | "upi">("card");
  const { lines } = useCart();
  const subtotal = lines.reduce((a, l) => a + l.price * l.quantity, 0);
  const shipping = subtotal >= 500 ? 0 : 14;
  const tax = subtotal * 0.07;
  const total = subtotal + shipping + tax;

  return (
    <div className="pt-32">
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="section-eyebrow">Almost yours</div>
            <h1 className="section-title mt-2">
              Secure <span className="text-gradient-brand">checkout</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-2">
            <Lock size={13} /> Encrypted with bank-grade security
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl md:p-8">
            <div className="mb-6 flex items-center justify-between gap-2">
              {steps.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setStep(i)}
                  className="flex flex-1 items-center gap-2"
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ring-1 transition ${
                      i <= step
                        ? "bg-gradient-brand text-white ring-white/20"
                        : "bg-white/[0.04] text-text-2 ring-white/[0.06]"
                    }`}
                  >
                    {i < step ? <Check size={13} /> : i + 1}
                  </span>
                  <span
                    className={`text-sm ${i === step ? "text-white" : "text-text-2"}`}
                  >
                    {s}
                  </span>
                  {i < steps.length - 1 && (
                    <span className="flex-1 border-t border-dashed border-white/[0.1]" />
                  )}
                </button>
              ))}
            </div>

            {step === 0 && (
              <FormSection title="Shipping address">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input label="First name" placeholder="Alex" />
                  <Input label="Last name" placeholder="Vance" />
                  <Input
                    label="Email"
                    placeholder="you@email.com"
                    className="md:col-span-2"
                  />
                  <Input
                    label="Address"
                    placeholder="221B Baker Street"
                    className="md:col-span-2"
                  />
                  <Input label="City" placeholder="London" />
                  <Input label="Postal code" placeholder="NW1 6XE" />
                  <Input label="Country" placeholder="United Kingdom" className="md:col-span-2" />
                </div>
              </FormSection>
            )}

            {step === 1 && (
              <FormSection title="Shipping method">
                {[
                  ["Standard", "3–5 business days", "Free", true],
                  ["Express", "1–2 business days", "$14", false],
                  ["Same-day", "Within 4 hours", "$29", false],
                ].map(([t, d, p, def]) => (
                  <label
                    key={t as string}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="ship"
                        defaultChecked={def as boolean}
                        className="accent-primary-500"
                      />
                      <Truck size={16} className="text-primary-300" />
                      <div>
                        <div className="text-sm font-medium">{t as string}</div>
                        <div className="text-xs text-text-2">{d as string}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{p as string}</div>
                  </label>
                ))}
              </FormSection>
            )}

            {step === 2 && (
              <FormSection title="Payment">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { id: "card", Icon: CreditCard, label: "Card" },
                    { id: "paypal", Icon: ShieldCheck, label: "PayPal" },
                    { id: "apple", Icon: Apple, label: "Apple Pay" },
                    { id: "upi", Icon: Sparkles, label: "UPI" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPm(p.id as typeof pm)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        pm === p.id
                          ? "border-primary-400 bg-primary-500/10 ring-2 ring-primary-400/30"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.14]"
                      }`}
                    >
                      <p.Icon size={16} className="text-primary-300" />
                      <div className="mt-2 text-sm font-medium">{p.label}</div>
                    </button>
                  ))}
                </div>
                {pm === "card" && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      label="Card number"
                      placeholder="4242 4242 4242 4242"
                      className="md:col-span-2"
                    />
                    <Input label="Cardholder" placeholder="Alex Vance" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Expiry" placeholder="MM / YY" />
                      <Input label="CVC" placeholder="123" />
                    </div>
                  </div>
                )}
              </FormSection>
            )}

            {step === 3 && (
              <FormSection title="Review your order">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-text-2">
                  Please review your details. By completing this purchase you
                  agree to NexCart&apos;s Terms and Privacy Policy.
                </div>
              </FormSection>
            )}

            <div className="mt-8 flex justify-between">
              <button
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2 text-sm text-text-2 disabled:opacity-40"
              >
                Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="btn btn-primary"
                >
                  Continue
                </button>
              ) : (
                <Link href="/order/success" className="btn btn-primary">
                  Place order · {formatPrice(total)}
                </Link>
              )}
            </div>
          </div>

          <aside className="self-start rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-widest text-text-2">
              Order summary
            </div>
            <ul className="mt-4 space-y-3">
              {lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
                    <Image src={l.image} alt={l.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{l.name}</div>
                    <div className="text-xs text-text-2">× {l.quantity}</div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatPrice(l.price * l.quantity)}
                  </div>
                </li>
              ))}
              {lines.length === 0 && (
                <li className="text-sm text-text-2">Your cart is empty.</li>
              )}
            </ul>
            <div className="my-4 h-px bg-white/[0.06]" />
            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <Row
                label="Shipping"
                value={shipping === 0 ? "Free" : formatPrice(shipping)}
              />
              <Row label="Tax" value={formatPrice(tax)} />
            </div>
            <div className="my-4 h-px bg-white/[0.06]" />
            <Row label="Total" value={formatPrice(total)} bold />

            <div className="mt-5 space-y-2 text-xs text-text-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={13} className="text-emerald-400" /> PCI-DSS encrypted
              </div>
              <div className="flex items-center gap-2">
                <Lock size={13} className="text-emerald-400" /> 256-bit SSL
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-primary-300" /> Powered by NexCart Intelligence™
              </div>
            </div>
          </aside>
        </div>
      </div>
      <div className="h-24" />
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 text-sm font-semibold">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({
  label,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-text-2">
        {label}
      </span>
      <input
        {...rest}
        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm outline-none transition focus:border-primary-400/70 focus:ring-2 focus:ring-primary-400/20"
      />
    </label>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "text-white" : "text-text-2"}>{label}</span>
      <span className={bold ? "font-display text-lg font-semibold" : ""}>
        {value}
      </span>
    </div>
  );
}
