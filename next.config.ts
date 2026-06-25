import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tells Next.js NOT to bundle these PDF packages so their worker paths don't break
  serverExternalPackages: ["pdf-to-png-converter", "pdfjs-dist"],
};

export default nextConfig;