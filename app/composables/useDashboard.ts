import type { DashboardResponse } from '~/types/api'

export const useDashboard = () => {
  const api = useApi()

  const dashboard = ref<DashboardResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchDashboard = async () => {
    loading.value = true
    error.value = null

    try {
      dashboard.value = await api<DashboardResponse>('/dashboard')
    } catch {
      error.value = 'Não foi possível carregar os dados do dashboard.'
    } finally {
      loading.value = false
    }
  }

  return {
    dashboard,
    loading,
    error,
    fetchDashboard,
  }
}