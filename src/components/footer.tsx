"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Twitter, Github, Instagram, Linkedin } from "lucide-react";

const cols = [
  {
    title: "Shop",
    links: [
      ["All products", "/shop"],
      ["Smartphones", "/shop?cat=smartphones"],
      ["Laptops", "/shop?cat=laptops"],
      ["Audio", "/shop?cat=audio"],
      ["Gaming", "/shop?cat=gaming"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Careers", "/about"],
      ["Press", "/about"],
      ["Brand kit", "/about"],
      ["Contact", "/about"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Help center", "/about"],
      ["Order tracking", "/account"],
      ["Returns & warranty", "/about"],
      ["NexCart Intelligence", "/about"],
      ["Status", "/about"],
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="relative z-10 mt-24 border-t border-white/[0.06] bg-bg/60 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link
              href="/"
              aria-label="NexCart home"
              className="inline-flex items-center"
            >
              <Image
                src="/brand/nexcart-logo.webp"
                alt="NexCart"
                width={1200}
                height={600}
                className="h-20 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-text-2">
              Intelligent commerce, engineered for the next decade. AI-curated
              products, lightning checkout, premium service worldwide.
            </p>
            <form className="mt-6 flex max-w-sm overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-text-2"
              />
              <button className="rounded-full bg-gradient-brand px-4 py-2 text-sm font-medium text-white shadow-glow">
                Subscribe
              </button>
            </form>
            <div className="mt-6 flex items-center gap-2 text-text-2">
              {[Twitter, Instagram, Github, Linkedin].map((I, i) => (
                <a
                  key={i}
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] transition hover:bg-white/[0.07] hover:text-white"
                  aria-label="Social link"
                >
                  <I size={15} />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="mb-4 text-xs uppercase tracking-[0.18em] text-text-2">
                {c.title}
              </div>
              <ul className="space-y-2.5 text-sm">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-text-2 transition hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-text-2 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <div>© {new Date().getFullYear()} NexCart Inc. All rights reserved.</div>
            <div>
              Designed &amp; developed by{" "}
              <a
                href="https://techymk.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white transition hover:text-primary-300"
              >
                techyMk
              </a>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="/security" className="transition hover:text-white">
              Security
            </Link>
            <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-widest text-text-2">
              Powered by NexCart Intelligence™
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
