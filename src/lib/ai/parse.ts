import "server-only";

/**
 * Extract plain text from an uploaded file Buffer. Handles PDF, plain text,
 * and Markdown. Throws on unsupported types — caller maps to a user-friendly
 * error.
 */
export async function extractText(
  file: Buffer | Uint8Array,
  mimeType: string,
  filename: string,
): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop() ?? "";

  if (mimeType === "application/pdf" || ext === "pdf") {
    return extractPdf(file);
  }

  if (
    mimeType.startsWith("text/") ||
    ["txt", "md", "markdown"].includes(ext)
  ) {
    return new TextDecoder("utf-8").decode(file);
  }

  throw new Error(
    `Unsupported file type "${mimeType || ext}". Upload a PDF, TXT or MD file.`,
  );
}

async function extractPdf(file: Buffer | Uint8Array): Promise<string> {
  // Dynamic import — keeps the heavy pdf.js out of every other route's bundle.
  const { extractText: pdfExtractText, getDocumentProxy } = await import("unpdf");
  const buf = file instanceof Uint8Array ? file : new Uint8Array(file);
  const pdf = await getDocumentProxy(buf);
  const { text } = await pdfExtractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n\n") : text;
}
