import { createClient } from "@/lib/supabase/server";
import { KnowledgeView } from "./knowledge-view";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const supabase = createClient();
  const { data: documents, error } = await supabase
    .from("kb_documents")
    .select(
      "id, title, filename, mime_type, size_bytes, status, chunk_count, error, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/knowledge] read failed:", error);
  }

  return <KnowledgeView documents={documents ?? []} />;
}
