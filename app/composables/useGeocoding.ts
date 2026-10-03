export interface GeocodeAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country?: string
}

export interface GeocodingResult {
  latitude: number
  longitude: number
  displayName: string
}

export const useGeocoding = () => {
  const api = useApi()
  const loading = ref(false)

  const geocode = async (
    address: GeocodeAddress,
  ): Promise<GeocodingResult> => {
    loading.value = true

    try {
      return await api<GeocodingResult>('/geocoding', {
        method: 'POST',
        body: {
          street: address.street,
          number: address.number,
          complement: address.complement || undefined,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country ?? 'BR',
        },
      })
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    geocode,
  }
}