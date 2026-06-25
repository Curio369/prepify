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
    // Many DPP PDFs reference standard fonts (Helvetica/Arial/Times) WITHOUT
    // embedding them. With useSystemFonts:false pdfjs can't substitute them and
    // renders every glyph as a blank box, so the model extracts nothing. Using
    // system fonts makes the text actually paint.
    useSystemFonts: true,
  })

  // Explicitly map and cast to Buffer
  return pngPages.map(page => Buffer.from(page.content as Uint8Array))
}
