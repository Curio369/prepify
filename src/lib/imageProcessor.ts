import sharp from 'sharp'

export async function cropDiagram(
  imageBuffer: Buffer,
  box: [number, number, number, number],
  fullImage = false
): Promise<string | null> {
  try {
    const [ymin, xmin, ymax, xmax] = box

    const pngBuffer = await sharp(imageBuffer).png().toBuffer()
    const metadata = await sharp(pngBuffer).metadata()
    const width = metadata.width!
    const height = metadata.height!

    // gemini-3.5-flash returns tight, accurate boxes, so we only add a small,
    // symmetric safety margin (fractions of the page). Full-question crops already
    // span the whole body, so they get an even smaller margin to avoid pulling in
    // the answer options or a neighbouring question.
    const padX = fullImage ? 0.008 : 0.02
    const padTop = fullImage ? 0.008 : 0.015
    const padBottom = fullImage ? 0.012 : 0.02

    const left = Math.floor(((xmin / 1000) - padX) * width)
    const top = Math.floor(((ymin / 1000) - padTop) * height)
    const cropWidth = Math.floor(((xmax - xmin) / 1000 + padX * 2) * width)
    const cropHeight = Math.floor(((ymax - ymin) / 1000 + padTop + padBottom) * height)

    // Clamp to image boundaries
    const safeLeft = Math.max(0, left)
    const safeTop = Math.max(0, top)
    const safeWidth = Math.min(cropWidth, width - safeLeft)
    const safeHeight = Math.min(cropHeight, height - safeTop)

    const cropped = await sharp(pngBuffer)
      .extract({ left: safeLeft, top: safeTop, width: safeWidth, height: safeHeight })
      .jpeg()
      .toBuffer()

    return `data:image/jpeg;base64,${cropped.toString('base64')}`
  } catch (err) {
    console.error('Crop failed:', err)
    return null
  }
}