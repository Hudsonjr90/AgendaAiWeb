
export interface CustomerProfile {
  id: string
  organizationId: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  cpf: string | null
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

export interface CustomerCredentials {
  email: string
  password: string
}

export interface CustomerRegisterData extends CustomerCredentials {
  firstName: string
  lastName: string
  phone?: string
  cpf?: string
}

export interface CustomerAuthenticatedResponse {
  status?: 'AUTHENTICATED'
  customer: CustomerProfile
  store?: CustomerStore
  accessToken: string
  tokenType: 'Bearer'
}

export interface CustomerStoreSelectionResponse {
  status: 'STORE_SELECTION_REQUIRED'
  selectionToken: string
  stores: CustomerStore[]
}

export interface CustomerNoEstablishmentsResponse {
  status: 'NO_ESTABLISHMENTS'
  message: string
  stores: []
}

export type CustomerDiscoveryLoginResponse =
  | CustomerAuthenticatedResponse
  | CustomerStoreSelectionResponse
  | CustomerNoEstablishmentsResponse

export interface CustomerSelectStoreResponse {
  status: 'AUTHENTICATED'
  customer: CustomerProfile
  store: CustomerStore
  accessToken: string
  tokenType: 'Bearer'
}

export interface CustomerAuthResponse {
  customer: CustomerProfile
  accessToken: string
  tokenType: 'Bearer'
}

export const useCustomerAuthApi = () => {
  const api = useApi()

  const discoveryLogin = (data: CustomerCredentials) =>
    api<CustomerDiscoveryLoginResponse>('/customer-auth/discovery-login', {
      method: 'POST',
      body: data,
    })

  const selectStore = (data: {
    selectionToken: string
    publicSlug: string
  }) =>
    api<CustomerSelectStoreResponse>('/customer-auth/select-store', {
      method: 'POST',
      body: data,
    })

  const loginAtStore = (
    publicSlug: string,
    data: CustomerCredentials,
  ) =>
    api<CustomerAuthResponse>('/customer-auth/login', {
      method: 'POST',
      body: {
        publicSlug,
        email: data.email,
        password: data.password,
      },
    })

  const registerAtStore = (
    publicSlug: string,
    data: CustomerRegisterData,
  ) =>
    api<CustomerAuthResponse>(
      `/customer-auth/${encodeURIComponent(publicSlug)}/register`,
      {
        method: 'POST',
        body: data,
      },
    )

  const me = (accessToken: string) =>
    api<CustomerProfile>('/customer-auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

  return {
    discoveryLogin,
    selectStore,
    loginAtStore,
    registerAtStore,
    me,
  }
}
