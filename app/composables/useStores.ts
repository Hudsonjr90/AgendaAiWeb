import type { Store } from '~/types/api'

export interface CreateStorePayload {
  name: string
  slug: string
  description?: string
  phone?: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
  latitude?: number | null
  longitude?: number | null
}

export type UpdateStorePayload = Partial<CreateStorePayload>

export const useStores = () => {
  const api = useApi()
  const stores = ref<Store[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchStores = async () => {
    loading.value = true
    error.value = null

    try {
      stores.value = await api<Store[]>('/stores')
    } catch {
      error.value = 'Não foi possível carregar as lojas.'
    } finally {
      loading.value = false
    }
  }

  const createStore = async (payload: CreateStorePayload) => {
    return api<Store>('/stores', {
      method: 'POST',
      body: payload,
    })
  }

  const updateStore = async (
    storeId: string,
    payload: UpdateStorePayload,
  ) => {
    return api<Store>(`/stores/${storeId}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  const deleteStore = async (storeId: string) => {
    await api(`/stores/${storeId}`, {
      method: 'DELETE',
    })
  }

  return {
    stores,
    loading,
    error,
    fetchStores,
    createStore,
    updateStore,
    deleteStore,
  }
}