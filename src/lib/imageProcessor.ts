import sharp from 'sharp'

export async function cropDiagram(
  imageBuffer: Buffer,
  box: [number, number, number, number]
): Promise<string | null> {
  try {
    const [ymin, xmin, ymax, xmax] = box

    const pngBuffer = await sharp(imageBuffer).png().toBuffer()
    const metadata = await sharp(pngBuffer).metadata()
    const width = metadata.width!
    const height = metadata.height!

    // Add padding offset — nudge down to skip text above diagram
    const padX = 0.12
    const padY = 0.05

    const left = Math.floor(((xmin / 1000) - padX) * width)
    const top = Math.floor(((ymin / 1000) - padY) * height)
    const cropWidth = Math.floor(((xmax - xmin) / 1000 + padX * 3) * width)
    const cropHeight = Math.floor(((ymax - ymin) / 1000 + 0.08) * height)

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