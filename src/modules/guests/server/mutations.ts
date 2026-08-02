import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hashGuestToken, newGuestToken } from "@/modules/guest-access/tokens";

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
  isPrimary: boolean,
  phone: string | null
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("guests")
    .insert({ group_id: groupId, name, is_primary: isPrimary, phone });
  if (error) throw error;
}

export async function deleteGuest(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("guests").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Generates a fresh invitation token for a group and returns it.
 *
 * Stores BOTH the hash (the lookup key) and the plaintext (0021), so the admin
 * can re-display and re-share the same link forever instead of regenerating —
 * regeneration mints a different token and silently breaks whatever the family
 * already has. Callers must treat this as destructive when a link exists.
 */
export async function generateGroupInvite(groupId: string): Promise<string> {
  const token = newGuestToken();
  const tokenHash = await hashGuestToken(token);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("guest_groups")
    .update({ invite_token: token, invite_token_hash: tokenHash })
    .eq("id", groupId);
  if (error) throw error;
  return token;
}

// ── Shareable (broadcast) links ─────────────────────────────────────────────
export async function createShareLink(
  weddingId: string,
  label: string
): Promise<{ id: string; token: string }> {
  const token = newGuestToken();
  const tokenHash = await hashGuestToken(token);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("share_links")
    .insert({
      wedding_id: weddingId,
      label,
      token,
      token_hash: tokenHash,
      all_events: true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: (data as { id: string }).id, token };
}

export async function regenerateShareToken(id: string): Promise<string> {
  const token = newGuestToken();
  const tokenHash = await hashGuestToken(token);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("share_links")
    .update({ token, token_hash: tokenHash })
    .eq("id", id);
  if (error) throw error;
  return token;
}

export async function deleteShareLink(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("share_links").delete().eq("id", id);
  if (error) throw error;
}

export async function setShareLinkAllEvents(
  id: string,
  all: boolean
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("share_links")
    .update({ all_events: all })
    .eq("id", id);
  if (error) throw error;
}

export async function toggleShareLinkEvent(
  shareLinkId: string,
  eventId: string,
  on: boolean
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (on) {
    const { error } = await supabase
      .from("share_link_events")
      .upsert({ share_link_id: shareLinkId, event_id: eventId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("share_link_events")
      .delete()
      .eq("share_link_id", shareLinkId)
      .eq("event_id", eventId);
    if (error) throw error;
  }
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
