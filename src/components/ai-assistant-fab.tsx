"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";
type Message = {
  id: string;
  role: Role;
  content: string;
  sources?: string[];
};

const SUGGESTIONS = [
  "What does NexCart sell?",
  "What's your return policy?",
  "How do I track my order?",
  "Tell me about NexCart Intelligence.",
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AIAssistantFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  // Cancel any in-flight request when the panel closes
  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setStreaming(false);
    }
  }, [open]);

  if (pathname?.startsWith("/admin")) return null;

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setErr(null);
    const userMsg: Message = { id: uid(), role: "user", content: trimmed };
    const assistantId = uid();
    const next: Message[] = [
      ...messages,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ];
    setMessages(next);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .filter((m) => m.role === "user" || m.content.length > 0)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        let serverMsg = `Chat failed (${res.status})`;
        try {
          serverMsg = JSON.parse(text).error ?? serverMsg;
        } catch {
          /* ignore */
        }
        throw new Error(serverMsg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let sources: string[] | undefined;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const evt of events) {
          const line = evt.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.type === "delta") {
              acc += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: acc } : m,
                ),
              );
            } else if (parsed.type === "sources") {
              sources = parsed.titles;
            } else if (parsed.type === "error") {
              throw new Error(parsed.message ?? "Stream error");
            }
          } catch {
            /* tolerate partial frames */
          }
        }
      }

      if (sources?.length) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, sources } : m)),
        );
      }
      if (!acc) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "I couldn't put together a reply just now. Mind trying again?",
                }
              : m,
          ),
        );
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setErr(e instanceof Error ? e.message : "Chat failed");
      // Strip the empty assistant placeholder on failure
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void send(input);
  }

  function reset() {
    if (streaming) {
      abortRef.current?.abort();
      setStreaming(false);
    }
    setMessages([]);
    setErr(null);
    setInput("");
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 280 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[60] inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-white shadow-glow ring-1 ring-white/20"
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      >
        <span className="absolute inset-0 -z-10 animate-pulse-slow rounded-full bg-gradient-brand opacity-50 blur-xl" />
        {open ? (
          <X size={20} />
        ) : (
          <Image
            src="/brand/bot-icon.webp"
            alt=""
            width={256}
            height={256}
            priority
            className="h-9 w-9 object-contain drop-shadow"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="fixed bottom-24 right-3 z-[60] flex h-[70vh] w-[94vw] max-w-sm flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-surface/95 shadow-card backdrop-blur-2xl sm:right-6"
          >
            <div className="relative border-b border-white/[0.06] p-5">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/40 to-transparent" />
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-gradient-brand shadow-glow">
                  <Image
                    src="/brand/bot-icon.webp"
                    alt=""
                    width={256}
                    height={256}
                    className="h-7 w-7 object-contain drop-shadow"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-display text-base font-semibold">
                    NexCart Intelligence
                  </div>
                  <div className="text-xs text-text-2">
                    {streaming ? "Thinking…" : "Ask me anything about NexCart."}
                  </div>
                </div>
                {messages.length > 0 && (
                  <button
                    onClick={reset}
                    aria-label="Start new chat"
                    className="grid h-8 w-8 place-items-center rounded-full text-text-2 hover:bg-white/[0.05] hover:text-white"
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
              {messages.length === 0 ? (
                <div className="space-y-2">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-text">
                    Hi! I&apos;m NexCart Intelligence. Ask me anything about
                    our products, policies, shipping, returns, or company.
                  </div>
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => void send(s)}
                      className="block w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-left text-sm text-text-2 transition hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <ul className="space-y-3">
                  {messages.map((m) => (
                    <li
                      key={m.id}
                      className={
                        m.role === "user"
                          ? "ml-auto max-w-[85%]"
                          : "max-w-[90%]"
                      }
                    >
                      <div
                        className={
                          m.role === "user"
                            ? "rounded-2xl rounded-br-md bg-gradient-brand px-3 py-2 text-sm text-white"
                            : "rounded-2xl rounded-bl-md bg-white/[0.04] px-3 py-2 text-sm text-text whitespace-pre-wrap"
                        }
                      >
                        {m.content || (
                          <span className="inline-flex gap-1 align-middle">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400" />
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400 [animation-delay:0.15s]" />
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400 [animation-delay:0.3s]" />
                          </span>
                        )}
                      </div>
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px] text-text-2">
                          <Sparkles size={10} className="text-primary-300" />
                          <span className="uppercase tracking-widest">Source:</span>
                          {m.sources.map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-white/[0.04] px-1.5 py-0.5 ring-1 ring-white/[0.06]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {err && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>{err}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06] p-3">
              <form
                onSubmit={onSubmit}
                className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about NexCart…"
                  disabled={streaming}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-2 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-white disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send"
                >
                  {streaming ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
