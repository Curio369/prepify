import { pdfToPng } from 'pdf-to-png-converter'
import { DOMMatrix, GlobalFonts } from '@napi-rs/canvas'
import { join } from 'node:path'

// Register a real sans-serif font so PDFs whose fonts are NOT embedded still
// render readable text on hosts that ship no system fonts (e.g. Vercel's
// serverless runtime). Without a font available, pdfjs paints every glyph as an
// empty box and the model extracts nothing. Liberation Sans is metric-compatible
// with Arial/Helvetica and already ships inside pdfjs-dist, so no extra asset is
// needed — but next.config.ts must trace these .ttf files into the function.
let fontsRegistered = false
function ensureFonts() {
  if (fontsRegistered) return
  fontsRegistered = true
  try {
    const dir = join(process.cwd(), 'node_modules', 'pdfjs-dist', 'standard_fonts')
    for (const file of [
      'LiberationSans-Regular.ttf',
      'LiberationSans-Bold.ttf',
      'LiberationSans-Italic.ttf',
      'LiberationSans-BoldItalic.ttf',
    ]) {
      GlobalFonts.registerFromPath(join(dir, file), 'Liberation Sans')
    }
  } catch (e) {
    console.error('[pdfToImage] font registration failed:', e)
  }
}

// pdfjs-dist (inside pdf-to-png-converter) needs DOMMatrix as a global.
// Node on Vercel doesn't provide it; @napi-rs/canvas ships a real one.
// We register it at call time (not module top-level) so it is guaranteed to
// be present before pdfjs touches it, regardless of ES-module import order.
export async function pdfToAllImageBuffers(pdfBuffer: Buffer): Promise<Buffer[]> {
  if (typeof (globalThis as any).DOMMatrix === 'undefined') {
    ;(globalThis as any).DOMMatrix = DOMMatrix
  }
  ensureFonts()

  const pngPages = await pdfToPng(pdfBuffer, {
    viewportScale: 2.0,
    disableFontFace: false,
    // Many DPP PDFs reference standard fonts (Helvetica/Arial/Times) WITHOUT
    // embedding them. With useSystemFonts:false pdfjs can't substitute them and
    // renders every glyph as a blank box, so the model extracts nothing. Using
    // system fonts (backed by the Liberation Sans we register above) makes the
    // text actually paint, on Vercel as well as locally.
    useSystemFonts: true,
  })

  // Explicitly map and cast to Buffer
  return pngPages.map(page => Buffer.from(page.content as Uint8Array))
}
