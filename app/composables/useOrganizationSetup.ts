import type {
  BusinessHour,
  DayOfWeek,
  Professional,
  Service,
  Store,
} from '~/types/api'

const weekDays: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

export const useOrganizationSetup = () => {
  const api = useApi()
  const stores = ref<Store[]>([])
  const professionals = ref<Professional[]>([])
  const services = ref<Service[]>([])
  const businessHoursByStore = ref<Record<string, BusinessHour[]>>({})
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  const steps = computed(() => {
    const activeStores = stores.value.filter(
      (store) => store.status === 'ACTIVE',
    )
    const activeProfessionals = professionals.value.filter(
      (professional) => professional.status === 'ACTIVE',
    )
    const activeServices = services.value.filter(
      (service) => service.status === 'ACTIVE',
    )
    const servicesByStore = new Map<string, Set<string>>()

    for (const service of activeServices) {
      for (const association of service.stores ?? []) {
        if (association.store?.status !== 'INACTIVE') {
          const serviceIds = servicesByStore.get(association.storeId) ?? new Set()
          serviceIds.add(service.id)
          servicesByStore.set(association.storeId, serviceIds)
        }
      }
    }

    const allServicesHaveStores =
      activeServices.length > 0 &&
      activeServices.every(
        (service) =>
          service.stores?.some(
            (association) =>
              association.store?.status !== 'INACTIVE',
          ) ?? false,
      )

    const allProfessionalsHaveValidServices =
      activeProfessionals.length > 0 &&
      activeProfessionals.every((professional) => {
        const storeServiceIds =
          servicesByStore.get(professional.storeId) ?? new Set<string>()

        return (
          professional.services?.some(
            (association) =>
              association.service.status === 'ACTIVE' &&
              storeServiceIds.has(association.serviceId),
          ) ?? false
        )
      })

    const allStoresHaveHours =
      activeStores.length > 0 &&
      activeStores.every(
        (store) =>
          new Set(
            businessHoursByStore.value[store.id]?.map(({ day }) => day) ?? [],
          ).size === weekDays.length,
      )

    return [
      {
        key: 'stores',
        title: 'Cadastrar uma loja',
        completed: stores.value.length > 0,
        detail: `${stores.value.length} loja(s) cadastrada(s)`,
      },
      {
        key: 'professionals',
        title: 'Cadastrar profissionais',
        completed: professionals.value.length > 0,
        detail: `${professionals.value.length} profissional(is) cadastrado(s)`,
      },
      {
        key: 'services',
        title: 'Cadastrar serviços e escolher lojas',
        completed: allServicesHaveStores,
        detail: `${activeServices.length} serviço(s) ativo(s), ${
          allServicesHaveStores
            ? 'todos disponíveis em pelo menos uma loja'
            : 'vincule cada serviço ativo a uma loja'
        }`,
      },
      {
        key: 'professional-services',
        title: 'Vincular profissionais aos serviços',
        completed: allProfessionalsHaveValidServices,
        detail: allProfessionalsHaveValidServices
          ? 'Todos os profissionais ativos oferecem um serviço válido na própria loja'
          : 'Associe cada profissional ativo a um serviço disponível na sua loja',
      },
      {
        key: 'availability',
        title: 'Configurar horários de atendimento',
        completed: allStoresHaveHours,
        detail: allStoresHaveHours
          ? 'Horários definidos para todos os dias da semana em cada loja ativa'
          : 'Configure os sete dias da semana de cada loja ativa',
      },
    ]
  })

  const completedCount = computed(
    () => steps.value.filter((step) => step.completed).length,
  )
  const isComplete = computed(
    () => steps.value.length > 0 && completedCount.value === steps.value.length,
  )

  const fetchProgress = async () => {
    loading.value = true
    error.value = null

    try {
      const [storeData, professionalData, serviceData] = await Promise.all([
        api<Store[]>('/stores'),
        api<Professional[]>('/professionals'),
        api<Service[]>('/services'),
      ])
      const activeStores = storeData.filter(
        (store) => store.status === 'ACTIVE',
      )
      const hoursEntries = await Promise.all(
        activeStores.map(async (store) => [
          store.id,
          await api<BusinessHour[]>(
            `/stores/${encodeURIComponent(store.id)}/business-hours`,
          ),
        ] as const),
      )

      stores.value = storeData
      professionals.value = professionalData
      services.value = serviceData
      businessHoursByStore.value = Object.fromEntries(hoursEntries)
      loaded.value = true
    } catch (cause) {
      error.value =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível verificar as etapas de configuração.'
    } finally {
      loading.value = false
    }
  }

  return {
    stores,
    professionals,
    services,
    businessHoursByStore,
    steps,
    completedCount,
    isComplete,
    loading,
    loaded,
    error,
    fetchProgress,
  }
}

export const setupWeekDays = weekDays
