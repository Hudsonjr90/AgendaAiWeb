import type {
  LoginOrganization,
  LoginResponse,
  LoginUser,
  OrganizationRole,
} from '~/types/api'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = useCookie<string | null>('agendaai_access_token', {
    default: () => null,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  })

  const tokenType = useCookie<string>('agendaai_token_type', {
    default: () => 'Bearer',
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  })

  const user = useCookie<LoginUser | null>('agendaai_user', {
    default: () => null,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  })

  const organization = useCookie<LoginOrganization | null>(
    'agendaai_organization',
    {
      default: () => null,
      sameSite: 'lax',
      secure: import.meta.env.PROD,
    },
  )

  const role = useCookie<OrganizationRole | null>('agendaai_role', {
    default: () => null,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  })

  const isAuthenticated = computed(() => !!accessToken.value)

  const setSession = (response: LoginResponse) => {
    accessToken.value = response.accessToken
    tokenType.value = response.tokenType
    user.value = response.user
    organization.value = response.organization
    role.value = response.role
  }

  const clearSession = () => {
    accessToken.value = null
    tokenType.value = 'Bearer'
    user.value = null
    organization.value = null
    role.value = null
  }

  return {
    accessToken,
    tokenType,
    user,
    organization,
    role,
    isAuthenticated,
    setSession,
    clearSession,
  }
})