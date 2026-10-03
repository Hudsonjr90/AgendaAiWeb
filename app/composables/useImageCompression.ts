export interface ImageCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: 'image/webp' | 'image/jpeg'
}

const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível processar a imagem.'))
    }

    image.src = url
  })
}

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Não foi possível comprimir a imagem.'))
          return
        }

        resolve(blob)
      },
      mimeType,
      quality,
    )
  })
}

export const useImageCompression = () => {
  const compress = async (
    file: File,
    options: ImageCompressionOptions = {},
  ): Promise<File> => {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.82,
      mimeType = 'image/webp',
    } = options

    if (!file.type.startsWith('image/')) {
      throw new Error('O arquivo selecionado não é uma imagem.')
    }

    const image = await loadImage(file)

    const ratio = Math.min(
      maxWidth / image.width,
      maxHeight / image.height,
      1,
    )

    const width = Math.round(image.width * ratio)
    const height = Math.round(image.height * ratio)

    const canvas = document.createElement('canvas')

    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Não foi possível processar a imagem.')
    }

    context.drawImage(
      image,
      0,
      0,
      width,
      height,
    )

    let outputMimeType = mimeType

    let blob: Blob

    try {
      blob = await canvasToBlob(
        canvas,
        outputMimeType,
        quality,
      )
    } catch {
      outputMimeType = 'image/jpeg'

      blob = await canvasToBlob(
        canvas,
        outputMimeType,
        quality,
      )
    }

    const extension = outputMimeType === 'image/webp'
      ? 'webp'
      : 'jpg'

    const baseName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')

    return new File(
      [blob],
      `${baseName}.${extension}`,
      {
        type: outputMimeType,
        lastModified: Date.now(),
      },
    )
  }

  return {
    compress,
  }
}