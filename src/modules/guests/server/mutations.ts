import { createSupabaseServerClient } from "@/lib/supabase/server";
import { randomToken, sha256Hex } from "@/lib/crypto";

export async function createGroup(
  weddingId: string,
  name: string
): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("guest_groups")
    .insert({ wedding_id: weddingId, name })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function renameGroup(id: string, name: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("guest_groups")
    .update({ name })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteGroup(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("guest_groups").delete().eq("id", id);
  if (error) throw error;
}

export async function addGuest(
  groupId: string,
  name: string,
  isPrimary: boolean
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("guests")
    .insert({ group_id: groupId, name, is_primary: isPrimary });
  if (error) throw error;
}

export async function deleteGuest(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("guests").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Generates a fresh invitation token for a group, stores only its hash, and
 * returns the raw token once (for building the shareable link). Regenerating
 * invalidates any previous link.
 */
export async function generateGroupInvite(groupId: string): Promise<string> {
  const token = randomToken(32);
  const tokenHash = await sha256Hex(token);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("guest_groups")
    .update({ invite_token_hash: tokenHash })
    .eq("id", groupId);
  if (error) throw error;
  return token;
}

/** Adds or removes a single group→event invite (the authorization edge). */
export async function setInvite(
  groupId: string,
  eventId: string,
  invited: boolean
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (invited) {
    const { error } = await supabase
      .from("group_event_invites")
      .upsert({ group_id: groupId, event_id: eventId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("group_event_invites")
      .delete()
      .eq("group_id", groupId)
      .eq("event_id", eventId);
    if (error) throw error;
  }
}
