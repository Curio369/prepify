import { pdfToPng } from 'pdf-to-png-converter'
import { DOMMatrix } from '@napi-rs/canvas'

// pdfjs-dist (inside pdf-to-png-converter) needs DOMMatrix as a global.
// Node on Vercel doesn't provide it; @napi-rs/canvas ships a real one.
// We register it at call time (not module top-level) so it is guaranteed to
// be present before pdfjs touches it, regardless of ES-module import order.
export async function pdfToAllImageBuffers(pdfBuffer: Buffer): Promise<Buffer[]> {
  if (typeof (globalThis as any).DOMMatrix === 'undefined') {
    ;(globalThis as any).DOMMatrix = DOMMatrix
  }

  const pngPages = await pdfToPng(pdfBuffer, {
    viewportScale: 2.0,
    disableFontFace: false,
    useSystemFonts: false,
  })

  // Explicitly map and cast to Buffer
  return pngPages.map(page => Buffer.from(page.content as Uint8Array))
}
