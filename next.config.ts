import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tells Next.js NOT to bundle these packages so their worker paths and native
  // binaries (@napi-rs/canvas) resolve correctly from node_modules on Vercel.
  serverExternalPackages: ["pdf-to-png-converter", "pdfjs-dist", "@napi-rs/canvas"],

  // pdfjs-dist loads pdf.worker.mjs via a dynamic, runtime-computed path that
  // Vercel's file tracer can't follow, so the worker is missing from the
  // serverless function ("Setting up fake worker failed"). Force it into the
  // /api/extract trace.
  outputFileTracingIncludes: {
    '/api/extract': [
      './node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
      './node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs',
      // Bundled fonts so non-embedded-font PDFs render on Vercel (no system fonts).
      './node_modules/pdfjs-dist/standard_fonts/*.ttf',
    ],
  },
};

export default nextConfig;