#!/usr/bin/env node
/**
 * One-off upload of the curated background-music library to R2. Uploads the
 * local MP3s to `music/library/<id>.mp3` and prints a ready-to-paste
 * `src/modules/website/music/registry.ts` array (source of truth stays in
 * code, mirroring `src/modules/website/themes/registry.ts` — this script
 * writes no database rows).
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-music-library.mjs
 *   SONGS_DIR=/path/to/songs node --env-file=.env.local scripts/seed-music-library.mjs
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const SONGS_DIR = process.env.SONGS_DIR ?? "/Users/tushardhankhar/Downloads/songs";

/** filename → { id, title, artist }. Order here is the dashboard's default order. */
const TRACKS = [
  { file: "Afreen Afreen Rath Fateh Ali Khan 128 Kbps.mp3", id: "afreen-afreen", title: "Afreen Afreen", artist: "Rahat Fateh Ali Khan" },
  { file: "Apna Bana Le Bhediya 128 Kbps.mp3", id: "apna-bana-le", title: "Apna Bana Le", artist: "Bhediya" },
  { file: "Chaap Tilak Namita Choudhary 128 Kbps.mp3", id: "chaap-tilak", title: "Chaap Tilak", artist: "Namita Choudhary" },
  { file: "Din Shagna Da Phillauri 128 Kbps.mp3", id: "din-shagna-da", title: "Din Shagna Da", artist: "Phillauri" },
  { file: "Heeriye Arijit Singh 128 Kbps.mp3", id: "heeriye", title: "Heeriye", artist: "Arijit Singh" },
  { file: "Jashn E Bahaaraa Jodhaa Akbar 128 Kbps.mp3", id: "jashn-e-bahaaraa", title: "Jashn-e-Bahaaraa", artist: "Jodhaa Akbar" },
  { file: "Kesariya Brahmastra 128 Kbps.mp3", id: "kesariya", title: "Kesariya", artist: "Brahmastra" },
  { file: "Madhaniyan Gaurav Raina 128 Kbps.mp3", id: "madhaniyan", title: "Madhaniyan", artist: "Gaurav Raina" },
  { file: "O Maahi Dunki 128 Kbps.mp3", id: "o-maahi", title: "O Maahi", artist: "Dunki" },
  { file: "Raataan Lambiyan Shershaah 128 Kbps.mp3", id: "raataan-lambiyan", title: "Raataan Lambiyan", artist: "Shershaah" },
  { file: "Rang Lageya Mohit Chauhan 128 Kbps.mp3", id: "rang-lageya", title: "Rang Lageya", artist: "Mohit Chauhan" },
  { file: "Ranjha Shershaah 128 Kbps.mp3", id: "ranjha", title: "Ranjha", artist: "Shershaah" },
];

function getR2() {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_BASE_URL,
  } = process.env;
  const missing = Object.entries({
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_BASE_URL,
  })
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(`Missing env var(s): ${missing.join(", ")}. Run with --env-file=.env.local`);
  }
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });
  return { client, bucket: R2_BUCKET, publicBase: R2_PUBLIC_BASE_URL };
}

async function main() {
  const { client, bucket, publicBase } = getR2();
  const results = [];

  for (const track of TRACKS) {
    const filePath = path.join(SONGS_DIR, track.file);
    const body = await readFile(filePath);
    const key = `music/library/${track.id}.mp3`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: "audio/mpeg",
      })
    );

    const url = `${publicBase}/${key}`;
    results.push({ ...track, url });
    console.log(`✓ ${track.title} → ${key} (${(body.length / 1024 / 1024).toFixed(1)}MB)`);
  }

  console.log("\n--- Paste into src/modules/website/music/registry.ts ---\n");
  console.log(
    "export const MUSIC_LIBRARY: MusicTrack[] = [\n" +
      results
        .map(
          (t) =>
            `  { id: "${t.id}", title: "${t.title}", artist: "${t.artist}", url: "${t.url}" },`
        )
        .join("\n") +
      "\n];"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
