import { pdfToPng } from 'pdf-to-png-converter'

export async function pdfPageToImageBuffer(pdfBuffer: Buffer, pageNum = 1): Promise<Buffer> {
  const pngPages = await pdfToPng(pdfBuffer, {
    pagesToProcess: [pageNum], // Only process the exact page we need
    viewportScale: 2.0,        // High resolution so Sharp gets a crisp image
  })

  const page = pngPages.find(p => p.pageNumber === pageNum)
  
  if (!page || !page.content) {
    throw new Error('Failed to convert PDF page to image buffer')
  }

  // Returns the pure PNG Buffer ready for Sharp
  return page.content 
}