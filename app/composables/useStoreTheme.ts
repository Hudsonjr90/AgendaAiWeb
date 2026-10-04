
import type { CloudinaryColor } from './useCloudinaryUpload'

export interface StoreTheme {
  id?: string
  storeId?: string
  logoUrl?: string | null
  bannerImages?: string[]
  primaryColor: string
  secondaryColor: string
  accentColor: string
  positiveColor: string
  negativeColor: string
  infoColor: string
  warningColor: string
  darkColor: string
  lightColor: string
  fontFamily: string
}

export interface StoreBrandTheme {
  logoUrl: string | null
  bannerImages: string[]
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

export interface StoreThemePaletteSuggestion {
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

export interface AnalyzePaletteResponse
  extends StoreThemePaletteSuggestion {
  paletteId: string
  detectedColors: Array<{
    hex: string
    percentage?: number
  }>
}

export const useStoreTheme = () => {
  const api = useApi()
  const loading = ref(false)

  const getTheme = async (storeId: string) => {
    return api<StoreTheme | null>(
      `/stores/${storeId}/theme`,
      {
        method: 'GET',
      },
    )
  }

  const analyzePalette = async (
    storeId: string,
    colors: CloudinaryColor[],
  ) => {
    loading.value = true

    try {
      return await api<AnalyzePaletteResponse>(
        `/stores/${storeId}/theme/palette/analyze`,
        {
          method: 'POST',
          body: {
            colors,
          },
        },
      )
    } finally {
      loading.value = false
    }
  }

  const saveTheme = async (
    storeId: string,
    theme: Partial<StoreBrandTheme>,
  ) => {
    loading.value = true

    try {
      return await api<StoreTheme>(
        `/stores/${storeId}/theme`,
        {
          method: 'PUT',
          body: theme,
        },
      )
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    getTheme,
    analyzePalette,
    saveTheme,
  }
}
