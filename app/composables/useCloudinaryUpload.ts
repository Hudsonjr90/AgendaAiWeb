import { ref } from 'vue'

interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  resource_type: string
  width: number
  height: number
  colors?: Array<[string, number]>
}

export interface CloudinaryColor {
  hex: string
  percentage: number
}

export interface CloudinaryUploadResult {
  secureUrl: string
  publicId: string
  colors: CloudinaryColor[]
}

type CloudinaryUploadType = 'professional' | 'store'

export const useCloudinaryUpload = () => {
  const config = useRuntimeConfig()

  const loading = ref(false)

  const normalizeColor = (hex: string): string => {
    const normalized = hex.toUpperCase()

    if (normalized.length === 9) {
      return normalized.slice(0, 7)
    }

    return normalized
  }

  const getUploadPreset = (type: CloudinaryUploadType): string => {
    if (type === 'professional') {
      return config.public.cloudinaryProfessionalsUploadPreset
    }

    return config.public.cloudinaryStoresUploadPreset
  }

  const upload = async (
    file: File,
    type: CloudinaryUploadType,
  ): Promise<CloudinaryUploadResult> => {
    const cloudName = config.public.cloudinaryCloudName
    const uploadPreset = getUploadPreset(type)

    console.log('[Cloudinary] config:', {
      cloudName,
      uploadPreset,
      type,
    })

    if (!cloudName) {
      throw new Error('Cloudinary cloud name não configurado.')
    }

    if (!uploadPreset) {
      throw new Error(
        `Cloudinary upload preset de ${type} não configurado.`,
      )
    }

    loading.value = true

    try {
      const formData = new FormData()

      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)

      const response = await $fetch<CloudinaryUploadResponse>(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        },
      )

      const colors: CloudinaryColor[] = (response.colors ?? [])
        .map(([hex, percentage]) => ({
          hex: normalizeColor(hex),
          percentage,
        }))
        .filter(
          color =>
            /^#[A-F0-9]{6}$/.test(color.hex) &&
            color.percentage > 0,
        )

      return {
        secureUrl: response.secure_url,
        publicId: response.public_id,
        colors,
      }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    upload,
  }
}