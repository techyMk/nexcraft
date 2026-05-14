import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { embedBatch } from "@/lib/ai/gemini";
import { approxTokens, chunk } from "@/lib/ai/chunk";
import { extractText } from "@/lib/ai/parse";

export const runtime = "nodejs";
export const maxDuration = 60; // PDF parse + embed can take a while
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB — matches the bucket cap

/**
 * POST /api/admin/kb/upload
 * Multipart form: file (required), title (optional).
 * Stores the file in the `kb` bucket, parses it, chunks it, embeds the
 * chunks, and writes everything to kb_documents + kb_chunks.
 *
 * Returns: { documentId, chunks } on success.
 */
export async function POST(req: Request) {
  try {
    // 1) Auth — admin only
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return jsonError("Sign in required", 401, "UNAUTH");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return jsonError("Admin role required", 403, "FORBIDDEN");
    }

    // 2) Parse multipart body
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return jsonError("No file in request", 400, "NO_FILE");
    }
    if (file.size === 0) return jsonError("Empty file", 400, "EMPTY_FILE");
    if (file.size > MAX_FILE_BYTES) {
      return jsonError(
        `File too large. Max ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB.`,
        400,
        "TOO_LARGE",
      );
    }

    const title =
      (form.get("title") as string | null)?.trim() ||
      file.name.replace(/\.[^.]+$/, "");

    const buf = Buffer.from(await file.arrayBuffer());
    const admin = supabaseAdmin();

    // 3) Insert pending row + upload file to storage
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await admin.storage
      .from("kb")
      .upload(filePath, buf, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadErr) return jsonError(`Storage upload failed: ${uploadErr.message}`, 500, "STORAGE");

    const { data: doc, error: docErr } = await admin
      .from("kb_documents")
      .insert({
        title,
        filename: file.name,
        mime_type: file.type || "application/octet-stream",
        file_path: filePath,
        size_bytes: file.size,
        status: "indexing",
        uploaded_by: user.id,
      })
      .select()
      .single();
    if (docErr || !doc) {
      // Cleanup the uploaded file if DB write failed
      await admin.storage.from("kb").remove([filePath]);
      const msg = docErr?.message ?? "Document insert failed";
      if (/relation .* does not exist/i.test(msg)) {
        return jsonError(
          "Database is missing the knowledge_base tables — run supabase/migrations/006_knowledge_base.sql in the Supabase SQL Editor.",
          500,
          "DB_MISSING_TABLE",
        );
      }
      return jsonError(msg, 500, "DB");
    }

    // 4) Parse → chunk → embed → write
    try {
      const text = await extractText(buf, file.type, file.name);
      if (!text.trim()) throw new Error("File contains no readable text.");

      const pieces = chunk(text, { size: 1100, overlap: 200 });
      if (pieces.length === 0) throw new Error("No chunks produced.");

      // Embed in batches of 96 to stay well within the API limits
      const BATCH = 96;
      const embeddings: number[][] = [];
      for (let i = 0; i < pieces.length; i += BATCH) {
        const batch = pieces.slice(i, i + BATCH);
        const out = await embedBatch(batch);
        embeddings.push(...out);
      }

      const rows = pieces.map((content, i) => ({
        document_id: doc.id,
        content,
        embedding: embeddings[i] as unknown as string, // pgvector accepts arrays via supabase-js
        chunk_index: i,
        token_count: approxTokens(content),
      }));

      // Insert in batches of 100
      for (let i = 0; i < rows.length; i += 100) {
        const slice = rows.slice(i, i + 100);
        const { error } = await admin.from("kb_chunks").insert(slice);
        if (error) throw new Error(`Chunk insert failed: ${error.message}`);
      }

      await admin
        .from("kb_documents")
        .update({ status: "ready", chunk_count: pieces.length })
        .eq("id", doc.id);

      return NextResponse.json({
        documentId: doc.id,
        chunks: pieces.length,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Indexing failed";
      await admin
        .from("kb_documents")
        .update({ status: "failed", error: msg })
        .eq("id", doc.id);
      return jsonError(msg, 500, "INDEX_FAILED");
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return jsonError(msg, 500);
  }
}
