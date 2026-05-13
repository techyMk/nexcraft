"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const URL_PATTERN = /^https?:\/\/[^\s<>"']+$/i;

export type UpdateProfileResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateProfileAction(input: {
  fullName: string;
  avatarUrl: string;
}): Promise<UpdateProfileResult> {
  const fullName = (input.fullName ?? "").trim();
  const avatarUrl = (input.avatarUrl ?? "").trim();

  if (fullName.length === 0) {
    return { ok: false, error: "Full name can't be empty." };
  }
  if (fullName.length > 80) {
    return { ok: false, error: "Full name is too long (80 chars max)." };
  }
  if (avatarUrl && !URL_PATTERN.test(avatarUrl)) {
    return { ok: false, error: "Avatar URL must start with http:// or https://" };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: "You need to be signed in to edit your profile." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      avatar_url: avatarUrl || null,
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/account");
  return { ok: true };
}
