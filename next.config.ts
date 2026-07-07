import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't infer it from a stray lockfile
  // higher up the filesystem (e.g. ~/package-lock.json).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
