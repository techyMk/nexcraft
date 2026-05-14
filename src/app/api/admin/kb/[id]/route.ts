import { jsonError, jsonOk } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/admin/kb/:id — removes the file from storage and the row from
 * kb_documents (chunks cascade). Admin-only.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
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

    const admin = supabaseAdmin();
    const { data: doc, error: fetchErr } = await admin
      .from("kb_documents")
      .select("id, file_path")
      .eq("id", params.id)
      .single();
    if (fetchErr || !doc) return jsonError("Document not found", 404, "NOT_FOUND");

    if (doc.file_path) {
      await admin.storage.from("kb").remove([doc.file_path]);
    }
    const { error: delErr } = await admin
      .from("kb_documents")
      .delete()
      .eq("id", params.id);
    if (delErr) return jsonError(delErr.message, 500, "DB");

    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Delete failed", 500);
  }
}
