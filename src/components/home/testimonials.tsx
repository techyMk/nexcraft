"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";
import { testimonials } from "@/lib/data";

export function Testimonials() {
  return (
    <section className="section">
      <div className="container">
        <div className="mb-10 text-center">
          <div className="section-eyebrow">Loved by humans</div>
          <h2 className="section-title mt-2">
            Trusted by{" "}
            <span className="text-gradient-brand">50,000+</span> shoppers
            worldwide
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-600/20 blur-3xl" />
              <div className="flex items-center gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} size={14} className="fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-[15px] leading-relaxed text-text">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="relative inline-block h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/10">
                  <Image src={t.avatar} alt={t.name} width={40} height={40} />
                </span>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-text-2">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
