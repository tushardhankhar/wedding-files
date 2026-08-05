/**
 * Plain constants shared between server and client media code. Deliberately
 * NOT in `server/presign.ts` — that file has a top-level "use server"
 * directive, and Next.js only allows async function exports from those.
 */
export const MAX_MUSIC_UPLOAD_BYTES = 10 * 1024 * 1024;
