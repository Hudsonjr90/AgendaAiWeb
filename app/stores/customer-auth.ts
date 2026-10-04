import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface CustomerProfile {
  id: string
  organizationId: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone?: string | null
  cpf?: string | null
  status: string
  createdAt?: string
}

export interface CustomerStore {
  id: string
  name: string
  publicSlug: string
  description: string | null
  city: string | null
  state: string | null
  logoUrl: string | null
}

interface CustomerAuthResponse {
  status?: 'AUTHENTICATED'
  customer: CustomerProfile
  store?: CustomerStore
  accessToken: string
  tokenType: 'Bearer'
}

interface CustomerStoreSelectionResponse {
  status: 'STORE_SELECTION_REQUIRED'
  selectionToken: string
  stores: CustomerStore[]
}

interface CustomerNoEstablishmentsResponse {
  status: 'NO_ESTABLISHMENTS'
  message: string
  stores: []
}

export type CustomerDiscoveryLoginResponse =
  | CustomerAuthResponse
  | CustomerStoreSelectionResponse
  | CustomerNoEstablishmentsResponse

interface CustomerSelectStoreResponse {
  status: 'AUTHENTICATED'
  customer: CustomerProfile
  store: CustomerStore
  accessToken: string
  tokenType: 'Bearer'
}

export const useCustomerAuthStore = defineStore('customer-auth', () => {
  const api = useApi()

  const accessToken = useCookie<string | null>('agendaai_customer_token', {
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60,
  })

  const activeStoreSlug = useCookie<string | null>('agendaai_customer_store', {
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60,
  })

  const customer = ref<CustomerProfile | null>(null)
  const selectedStore = ref<CustomerStore | null>(null)
  const availableStores = ref<CustomerStore[]>([])
  const selectionToken = ref<string | null>(null)

  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const isAuthenticated = computed(() =>
    Boolean(accessToken.value && customer.value),
  )

  const needsStoreSelection = computed(() => Boolean(selectionToken.value))

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error !== 'object' || error === null) {
      return fallback
    }

    const apiError = error as {
      data?: { message?: string | string[] }
      response?: {
        _data?: { message?: string | string[] }
      }
      message?: string
    }

    const message =
      apiError.data?.message ??
      apiError.response?._data?.message ??
      apiError.message

    if (Array.isArray(message)) {
      return message.join(' ')
    }

    return message || fallback
  }

  const clearError = () => {
    errorMessage.value = null
  }

  const clearSession = () => {
    accessToken.value = null
    activeStoreSlug.value = null
    customer.value = null
    selectedStore.value = null
    availableStores.value = []
    selectionToken.value = null
  }

  const saveSession = (response: CustomerAuthResponse) => {
    accessToken.value = response.accessToken
    customer.value = response.customer

    if (response.store) {
      selectedStore.value = response.store
      activeStoreSlug.value = response.store.publicSlug
    }

    availableStores.value = []
    selectionToken.value = null
    errorMessage.value = null
  }

  const register = async (
    publicSlug: string,
    data: {
      firstName: string
      lastName: string
      email: string
      password: string
      cpf?: string
      phone?: string
    },
  ) => {
    loading.value = true
    errorMessage.value = null

    try {
      const response = await api<CustomerAuthResponse>(
        `/customer-auth/${encodeURIComponent(publicSlug)}/register`,
        {
          method: 'POST',
          body: {
            ...data,
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email: data.email.trim().toLowerCase(),
            cpf: data.cpf?.replace(/\D/g, ''),
            phone: data.phone?.trim(),
          },
        },
      )

      saveSession(response)
      activeStoreSlug.value = publicSlug

      return response.customer
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Não foi possível realizar o cadastro.',
      )

      errorMessage.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const login = async (publicSlug: string, email: string, password: string) => {
    loading.value = true
    errorMessage.value = null

    try {
      const response = await api<CustomerAuthResponse>('/customer-auth/login', {
        method: 'POST',
        body: {
          publicSlug,
          email: email.trim().toLowerCase(),
          password,
        },
      })

      saveSession(response)
      activeStoreSlug.value = publicSlug

      return response.customer
    } catch (error) {
      const message = getErrorMessage(error, 'E-mail ou senha inválidos.')

      errorMessage.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const loginGlobal = async (
    email: string,
    password: string,
  ): Promise<CustomerDiscoveryLoginResponse> => {
    loading.value = true
    errorMessage.value = null

    try {
      const response = await api<CustomerDiscoveryLoginResponse>(
        '/customer-auth/discovery-login',
        {
          method: 'POST',
          body: {
            email: email.trim().toLowerCase(),
            password,
          },
        },
      )

      if (response.status === 'STORE_SELECTION_REQUIRED') {
        clearSession()
        selectionToken.value = response.selectionToken
        availableStores.value = response.stores
      } else if (response.status === 'NO_ESTABLISHMENTS') {
        clearSession()
        errorMessage.value = response.message
      } else {
        saveSession(response)
      }

      return response
    } catch (error) {
      const message = getErrorMessage(error, 'E-mail ou senha inválidos.')

      errorMessage.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const selectStore = async (publicSlug: string) => {
    if (!selectionToken.value) {
      const message = 'Sua seleção expirou. Faça login novamente.'

      errorMessage.value = message
      throw new Error(message)
    }

    loading.value = true
    errorMessage.value = null

    try {
      const response = await api<CustomerSelectStoreResponse>(
        '/customer-auth/select-store',
        {
          method: 'POST',
          body: {
            selectionToken: selectionToken.value,
            publicSlug,
          },
        },
      )

      saveSession(response)
      activeStoreSlug.value = response.store.publicSlug

      return response
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Não foi possível selecionar este estabelecimento.',
      )

      errorMessage.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  /**
   * Restaura e valida a sessão usando /me.
   */
  const fetchMe = async (): Promise<boolean> => {
    if (!accessToken.value) {
      customer.value = null
      selectedStore.value = null
      return false
    }

    loading.value = true

    try {
      customer.value = await api<CustomerProfile>('/customer-auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })

      return true
    } catch {
      logout()
      return false
    } finally {
      loading.value = false
    }
  }

  const setSelectedStore = (store: CustomerStore) => {
    selectedStore.value = store
    activeStoreSlug.value = store.publicSlug
  }

  const logout = () => {
    clearSession()
    errorMessage.value = null
  }

  return {
    accessToken,
    activeStoreSlug,
    customer,
    selectedStore,
    availableStores,
    selectionToken,
    loading,
    errorMessage,
    isAuthenticated,
    needsStoreSelection,
    clearError,
    register,
    login,
    loginGlobal,
    selectStore,
    fetchMe,
    setSelectedStore,
    logout,
  }
})
