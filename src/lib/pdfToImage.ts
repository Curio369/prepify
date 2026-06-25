import { pdfToPng } from 'pdf-to-png-converter'

export async function pdfToAllImageBuffers(pdfBuffer: Buffer): Promise<Buffer[]> {
  const pngPages = await pdfToPng(pdfBuffer, {
    viewportScale: 2.0,
  })
  return pngPages.map(page => Buffer.from(page.content as Uint8Array))
}
