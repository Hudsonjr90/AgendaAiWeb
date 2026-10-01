import type { Professional } from '~/types/api'

export interface CreateProfessionalPayload {
  storeId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  description?: string
  avatarUrl?: string
}

export type UpdateProfessionalPayload =
  Partial<CreateProfessionalPayload> & {
    status?: 'ACTIVE' | 'INACTIVE'
  }

export const useProfessionals = () => {
  const api = useApi()

  const professionals = ref<Professional[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProfessionals = async () => {
    loading.value = true
    error.value = null

    try {
      professionals.value =
        await api<Professional[]>('/professionals')
    } catch {
      error.value =
        'Não foi possível carregar os profissionais.'
    } finally {
      loading.value = false
    }
  }

  const createProfessional = async (
    payload: CreateProfessionalPayload,
  ) => {
    return api<Professional>('/professionals', {
      method: 'POST',
      body: payload,
    })
  }

  const updateProfessional = async (
    professionalId: string,
    payload: UpdateProfessionalPayload,
  ) => {
    return api<Professional>(
      `/professionals/${professionalId}`,
      {
        method: 'PATCH',
        body: payload,
      },
    )
  }

  const deleteProfessional = async (
    professionalId: string,
  ) => {
    await api(`/professionals/${professionalId}`, {
      method: 'DELETE',
    })
  }

  return {
    professionals,
    loading,
    error,
    fetchProfessionals,
    createProfessional,
    updateProfessional,
    deleteProfessional,
  }
}