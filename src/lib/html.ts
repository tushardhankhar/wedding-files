/**
 * Minimal HTML escaping so user- or data-derived strings can't inject markup
 * into emails or other server-rendered HTML fragments. Shared by the enquiry
 * form and the client-invite email.
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
