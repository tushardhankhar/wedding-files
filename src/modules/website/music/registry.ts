/**
 * Curated background-music library. A fixed, platform-owned set (like
 * `themes/registry.ts` — tokens live in code, not the database). Files were
 * uploaded once via `scripts/seed-music-library.mjs`; this array is the
 * source of truth for what the dashboard picker and guest player can play.
 */
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export const MUSIC_LIBRARY: MusicTrack[] = [
  { id: "afreen-afreen", title: "Afreen Afreen", artist: "Rahat Fateh Ali Khan", url: "https://pub-55d26991cc7c4aef9abe84dd78c5762f.r2.dev/music/library/afreen-afreen.mp3" },
  { id: "apna-bana-le", title: "Apna Bana Le", artist: "Bhediya", url: "https://pub-55d26991cc7c4aef9abe84dd78c5762f.r2.dev/music/library/apna-bana-le.mp3" },
  { id: "chaap-tilak", title: "Chaap Tilak", artist: "Namita Choudhary", url: "https://pub-55d26991cc7c4aef9abe84dd78c5762f.r2.dev/music/library/chaap-tilak.mp3" },
  { id: "din-shagna-da", title: "Din Shagna Da", artist: "Phillauri", url: "https://pub-55d26991cc7c4aef9abe84dd78c5762f.r2.dev/music/library/din-shagna-da.mp3" },
  { id: "heeriye", title: "Heeriye", artist: "Arijit Singh", url: "https://pub-55d26991cc7c4aef9abe84dd78c5762f.r2.dev/music/library/heeriye.mp3" },
  { id: "jashn-e-bahaaraa", title: "Jashn-e-Bahaaraa", artist: "Jodhaa Akbar", url: "https://pub-55d26991cc7c4aef9abe84dd78c5762f.r2.dev/music/library/jashn-e-bahaaraa.mp3" },
  { id: "kesariya", title: "Kesariya", artist: "Brahmastra", url: "https://pub-55d26991cc7c4aef9abe84dd78c5762f.r2.dev/music/library/kesariya.mp3" },
  { id: "madhaniyan", title: "Madhaniyan", artist: "Gaurav Raina", url: "https://pub-55d26991cc7c4aef9abe84dd78c5762f.r2.dev/music/library/madhaniyan.mp3" },
  { id: "o-maahi", title: "O Maahi", artist: "Dunki", url: "https://pub-55d26991cc7c4aef9abe84dd78c5762f.r2.dev/music/library/o-maahi.mp3" },
  { id: "raataan-lambiyan", title: "Raataan Lambiyan", artist: "Shershaah", url: "https://pub-55d26991cc7c4aef9abe84dd78c5762f.r2.dev/music/library/raataan-lambiyan.mp3" },
  { id: "rang-lageya", title: "Rang Lageya", artist: "Mohit Chauhan", url: "https://pub-55d26991cc7c4aef9abe84dd78c5762f.r2.dev/music/library/rang-lageya.mp3" },
  { id: "ranjha", title: "Ranjha", artist: "Shershaah", url: "https://pub-55d26991cc7c4aef9abe84dd78c5762f.r2.dev/music/library/ranjha.mp3" },
];

export function getMusicTrack(trackId: string | null | undefined): MusicTrack | undefined {
  if (!trackId) return undefined;
  return MUSIC_LIBRARY.find((t) => t.id === trackId);
}
