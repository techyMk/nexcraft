/**
 * Naive character-based chunker with overlap. Good enough for RAG over
 * company docs — splits on paragraph/sentence boundaries when possible to
 * keep semantic units together.
 *
 *   chunk("very long text", { size: 1000, overlap: 200 })
 */
type ChunkOpts = {
  /** Target chunk size in characters. */
  size?: number;
  /** Overlap between consecutive chunks in characters. */
  overlap?: number;
};

export function chunk(text: string, opts: ChunkOpts = {}): string[] {
  const size = opts.size ?? 1000;
  const overlap = opts.overlap ?? 200;
  if (size <= 0) throw new Error("size must be > 0");
  if (overlap >= size) throw new Error("overlap must be < size");

  // Normalise whitespace
  const clean = text
    .replace(/\r\n?/g, "\n")
    .replace(/ /g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (clean.length <= size) return clean.length ? [clean] : [];

  const chunks: string[] = [];
  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);

    // Try to end on a paragraph break, then sentence, then word
    if (end < clean.length) {
      const slice = clean.slice(start, end);
      const para = slice.lastIndexOf("\n\n");
      const sent = Math.max(
        slice.lastIndexOf(". "),
        slice.lastIndexOf("! "),
        slice.lastIndexOf("? "),
      );
      const word = slice.lastIndexOf(" ");
      const breakAt =
        para > size * 0.5
          ? para + 2
          : sent > size * 0.5
            ? sent + 2
            : word > size * 0.5
              ? word + 1
              : -1;
      if (breakAt > 0) end = start + breakAt;
    }

    const piece = clean.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end >= clean.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
}

/** Rough token estimate (~4 chars per token for English). */
export function approxTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
