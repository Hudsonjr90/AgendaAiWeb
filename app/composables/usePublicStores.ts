export interface PublicStoreSummary {
  name: string
  publicSlug: string
  description: string | null
  city: string | null
  state: string | null
  logoUrl: string | null
}

export const usePublicStores = () => {
  const api = useApi()

  const search = (query: string) =>
    api<PublicStoreSummary[]>(
      `/public/stores/search?query=${encodeURIComponent(query)}`,
      { method: 'GET' },
    )

  return { search }
}
