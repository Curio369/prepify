import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tells Next.js NOT to bundle these packages so their worker paths and native
  // binaries (@napi-rs/canvas) resolve correctly from node_modules on Vercel.
  serverExternalPackages: ["pdf-to-png-converter", "pdfjs-dist", "@napi-rs/canvas"],
};

export default nextConfig;