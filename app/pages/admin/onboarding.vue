<template>
  <q-page class="q-pa-lg wrapper">
    <div class="row items-center justify-between q-gutter-md">
      <div>
        <div class="text-h4 text-weight-bold">Configuração inicial</div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Prepare lojas, equipe, serviços e horários para receber agendamentos.
        </div>
      </div>

      <div class="row items-center q-gutter-sm">
        <q-btn
          flat
          no-caps
          icon="mdi-arrow-right"
          label="Configurar depois"
          to="/admin/dashboard"
        />
        <q-btn
          flat
          no-caps
          icon="mdi-refresh"
          label="Atualizar etapas"
          :loading="loading"
          @click="refreshProgress"
        />
      </div>
    </div>

    <q-card flat bordered class="q-mt-lg">
      <q-card-section>
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-medium">
            {{ isComplete ? 'Configuração concluída' : 'Seu progresso' }}
          </div>
          <div class="text-body2 text-grey-7">
            {{ completedCount }} de {{ steps.length }} etapas
          </div>
        </div>
        <q-linear-progress
          rounded
          size="10px"
          color="positive"
          :value="steps.length ? completedCount / steps.length : 0"
        />
      </q-card-section>
    </q-card>

    <q-stepper
      v-model="activeStep"
      color="primary"
      animated
      header-nav
      class="q-mt-lg"
    >
      <q-step
        :name="1"
        title="Lojas"
        icon="mdi-store"
        :done="steps[0]?.completed"
      >
        <div class="text-h6">Cadastre a primeira loja</div>
        <p class="text-body2 text-grey-7">
          A loja define o estabelecimento, o endereço e a unidade em que os
          agendamentos acontecem. Você pode adicionar outras unidades depois.
        </p>
        <q-banner v-if="stores.length" rounded class="bg-green-1 text-positive">
          {{ stores.length }} loja(s) já cadastrada(s).
        </q-banner>
        <q-btn
          color="primary"
          unelevated
          no-caps
          icon="mdi-store-edit-outline"
          label="Gerenciar lojas"
          to="/admin/stores"
          class="q-mt-md"
        />
        <q-stepper-navigation>
          <q-btn color="primary" label="Continuar" no-caps @click="activeStep = 2" />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="2"
        title="Profissionais"
        icon="mdi-account-tie"
        :done="steps[1]?.completed"
      >
        <div class="text-h6">Cadastre os profissionais</div>
        <p class="text-body2 text-grey-7">
          Cada profissional pertence a uma loja. No cadastro ou na edição,
          selecione também os serviços que ele realiza naquela unidade.
        </p>
        <q-banner v-if="!stores.length" rounded class="bg-orange-1 text-orange-10">
          Cadastre uma loja antes de incluir profissionais.
        </q-banner>
        <q-banner v-else-if="professionals.length" rounded class="bg-green-1 text-positive">
          {{ professionals.length }} profissional(is) já cadastrado(s).
        </q-banner>
        <q-btn
          color="primary"
          unelevated
          no-caps
          icon="mdi-account-group-outline"
          label="Gerenciar profissionais"
          to="/admin/professionals"
          class="q-mt-md"
          :disable="!stores.length"
        />
        <q-stepper-navigation>
          <q-btn flat label="Voltar" no-caps @click="activeStep = 1" />
          <q-btn color="primary" label="Continuar" no-caps @click="activeStep = 3" />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="3"
        title="Serviços"
        icon="mdi-content-cut"
        :done="steps[2]?.completed"
      >
        <div class="text-h6">Cadastre e disponibilize serviços</div>
        <p class="text-body2 text-grey-7">
          Um serviço pode ser oferecido em várias lojas. Escolha as unidades
          durante o cadastro ou a edição do serviço.
        </p>
        <q-banner v-if="!stores.length" rounded class="bg-orange-1 text-orange-10">
          Cadastre uma loja antes de disponibilizar serviços.
        </q-banner>
        <q-banner v-else-if="steps[2]?.completed" rounded class="bg-green-1 text-positive">
          {{ steps[2].detail }}.
        </q-banner>
        <q-btn
          color="primary"
          unelevated
          no-caps
          icon="mdi-content-cut"
          label="Gerenciar serviços"
          to="/admin/services"
          class="q-mt-md"
          :disable="!stores.length"
        />
        <q-stepper-navigation>
          <q-btn flat label="Voltar" no-caps @click="activeStep = 2" />
          <q-btn color="primary" label="Continuar" no-caps @click="activeStep = 4" />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="4"
        title="Vínculos"
        icon="mdi-link-variant"
        :done="steps[3]?.completed"
      >
        <div class="text-h6">Associe profissionais aos serviços</div>
        <p class="text-body2 text-grey-7">
          Para cada profissional, selecione somente serviços disponíveis na
          loja à qual ele pertence. Essas associações definem quem poderá ser
          escolhido no agendamento.
        </p>
        <q-banner
          v-if="steps[3]?.completed"
          rounded
          class="bg-green-1 text-positive"
        >
          {{ steps[3].detail }}.
        </q-banner>
        <q-banner
          v-else-if="professionals.length"
          rounded
          class="bg-orange-1 text-orange-10"
        >
          Alguns profissionais ainda não têm um serviço válido associado.
          Edite cada cadastro para ajustar os vínculos.
        </q-banner>
        <q-btn
          color="primary"
          unelevated
          no-caps
          icon="mdi-account-edit-outline"
          label="Gerenciar vínculos nos profissionais"
          to="/admin/professionals"
          class="q-mt-md"
        />
        <q-stepper-navigation>
          <q-btn flat label="Voltar" no-caps @click="activeStep = 3" />
          <q-btn color="primary" label="Continuar" no-caps @click="activeStep = 5" />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="5"
        title="Horários"
        icon="mdi-clock-outline"
        :done="steps[4]?.completed"
      >
        <div class="text-h6">Configure os horários de atendimento</div>
        <p class="text-body2 text-grey-7">
          Defina se cada loja abre em cada dia da semana e informe os horários
          de abertura e fechamento. A configuração pode ser retomada depois.
        </p>

        <q-select
          v-model="selectedStoreId"
          outlined
          emit-value
          map-options
          label="Loja"
          :options="storeOptions"
          :disable="!stores.length || savingHours"
        />

        <q-banner v-if="!stores.length" rounded class="bg-orange-1 text-orange-10 q-mt-md">
          Cadastre uma loja antes de configurar os horários.
        </q-banner>

        <template v-else>
          <q-card
            v-for="day in schedule"
            :key="day.day"
            flat
            bordered
            class="q-mt-md"
          >
            <q-card-section class="row items-center q-col-gutter-md">
              <div class="col-12 col-sm-3 text-weight-medium">
                {{ day.label }}
              </div>
              <div class="col-12 col-sm-2">
                <q-toggle v-model="day.isOpen" label="Aberto" />
              </div>
              <div class="col-6 col-sm-3">
                <q-input
                  v-model="day.opensAt"
                  outlined
                  dense
                  type="time"
                  label="Abre às"
                  :disable="!day.isOpen"
                />
              </div>
              <div class="col-6 col-sm-3">
                <q-input
                  v-model="day.closesAt"
                  outlined
                  dense
                  type="time"
                  label="Fecha às"
                  :disable="!day.isOpen"
                />
              </div>
            </q-card-section>
          </q-card>

          <q-btn
            color="primary"
            unelevated
            no-caps
            label="Salvar horários da loja"
            :loading="savingHours"
            :disable="!selectedStoreId"
            class="q-mt-md"
            @click="saveSchedule"
          />
        </template>

        <q-stepper-navigation>
          <q-btn flat label="Voltar" no-caps @click="activeStep = 4" />
          <q-btn color="primary" label="Continuar" no-caps @click="activeStep = 6" />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="6"
        title="Revisão"
        icon="mdi-check-circle-outline"
        :done="isComplete"
      >
        <div class="text-h6">
          {{ isComplete ? 'Tudo pronto para começar' : 'Revise sua configuração' }}
        </div>
        <p class="text-body2 text-grey-7">
          O painel continua disponível mesmo com etapas pendentes. Você pode
          retornar a qualquer etapa quando quiser.
        </p>

        <q-list bordered separator class="rounded-borders">
          <q-item v-for="item in steps" :key="item.key">
            <q-item-section avatar>
              <q-icon
                :name="item.completed ? 'mdi-check-circle' : 'mdi-alert-circle-outline'"
                :color="item.completed ? 'positive' : 'warning'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.title }}</q-item-label>
              <q-item-label caption>{{ item.detail }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                dense
                no-caps
                label="Revisar"
                @click="activeStep = stepFor(item.key)"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">Resumo da organização</div>
            <div class="text-body2 q-mt-sm">
              <div v-for="store in stores" :key="store.id" class="q-mb-sm">
                <strong>{{ store.name }}</strong>
                <span class="text-grey-7">
                  — {{ professionalsForStore(store.id) }} profissional(is),
                  {{ servicesForStore(store.id) }} serviço(s),
                  {{ businessHoursByStore[store.id]?.length ?? 0 }}/7 dias com horário
                </span>
                <div
                  v-for="professional in professionals.filter((item) => item.storeId === store.id)"
                  :key="professional.id"
                  class="text-caption text-grey-7 q-ml-md"
                >
                  {{ professionalName(professional) }}:
                  {{ professionalServiceNames(professional) }}
                </div>
              </div>
              <div v-if="!stores.length" class="text-grey-7">
                Nenhuma loja cadastrada.
              </div>
            </div>
          </q-card-section>
        </q-card>
        <q-btn
          flat
          no-caps
          icon="mdi-view-dashboard-outline"
          label="Voltar ao painel"
          to="/admin/dashboard"
          class="q-mt-md"
        />
      </q-step>
    </q-stepper>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import type { BusinessHour, DayOfWeek } from '~/types/api'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: ['OWNER', 'ADMIN'],
})

const api = useApi()
const $q = useQuasar()
const {
  stores,
  professionals,
  services,
  businessHoursByStore,
  steps,
  completedCount,
  isComplete,
  loading,
  error,
  fetchProgress,
} = useOrganizationSetup()

const activeStep = ref(1)
const selectedStoreId = ref('')
const savingHours = ref(false)

const dayLabels: Record<DayOfWeek, string> = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
}

const storeOptions = computed(() =>
  stores.value.map((store) => ({
    label: store.name,
    value: store.id,
  })),
)

const createDefaultSchedule = () =>
  setupWeekDays.map((day) => ({
    day,
    label: dayLabels[day],
    isOpen: false,
    opensAt: '09:00',
    closesAt: '18:00',
  }))

const schedule = ref(createDefaultSchedule())

function getStoreName(storeId: string) {
  return stores.value.find((store) => store.id === storeId)?.name ?? 'Loja'
}

function professionalName(professional: {
  firstName: string | null
  lastName: string | null
}) {
  return [professional.firstName, professional.lastName]
    .filter(Boolean)
    .join(' ') || 'Profissional'
}

function professionalServiceNames(professional: {
  services?: Array<{ service: { name: string } }>
}) {
  return (
    professional.services?.map(({ service }) => service.name).join(', ') ||
    'Nenhum serviço vinculado'
  )
}

function professionalsForStore(storeId: string) {
  return professionals.value.filter(
    (professional) => professional.storeId === storeId,
  ).length
}

function servicesForStore(storeId: string) {
  return services.value.filter(
    (service) =>
      service.status === 'ACTIVE' &&
      service.stores?.some(
        (association) => association.storeId === storeId,
      ),
  ).length
}

function stepFor(key: string) {
  const index = steps.value.findIndex((step) => step.key === key)
  return index < 0 ? 1 : index + 1
}

async function loadSchedule(storeId: string) {
  schedule.value = createDefaultSchedule()

  if (!storeId) return

  try {
    const savedHours = await api<BusinessHour[]>(
      `/stores/${encodeURIComponent(storeId)}/business-hours`,
    )
    const byDay = new Map(savedHours.map((item) => [item.day, item]))

    schedule.value = createDefaultSchedule().map((day) => {
      const saved = byDay.get(day.day)

      return saved
        ? {
            ...day,
            isOpen: saved.isOpen,
            opensAt: saved.opensAt ?? day.opensAt,
            closesAt: saved.closesAt ?? day.closesAt,
          }
        : day
    })
  } catch (cause) {
    $q.notify({
      type: 'negative',
      message:
        cause instanceof Error
          ? cause.message
          : 'Não foi possível carregar os horários desta loja.',
    })
  }
}

async function saveSchedule() {
  if (!selectedStoreId.value || savingHours.value) return

  const invalidDay = schedule.value.find(
    (day) =>
      day.isOpen &&
      (!day.opensAt || !day.closesAt || day.opensAt >= day.closesAt),
  )

  if (invalidDay) {
    $q.notify({
      type: 'negative',
      message: `Informe horários válidos para ${invalidDay.label.toLocaleLowerCase('pt-BR')}.`,
    })
    return
  }

  savingHours.value = true

  try {
    await api(
      `/stores/${encodeURIComponent(selectedStoreId.value)}/business-hours/batch`,
      {
        method: 'POST',
        body: {
          businessHours: schedule.value.map(
            ({ day, isOpen, opensAt, closesAt }) => ({
              day,
              isOpen,
              opensAt: isOpen ? opensAt : undefined,
              closesAt: isOpen ? closesAt : undefined,
            }),
          ),
        },
      },
    )
    $q.notify({
      type: 'positive',
      message: `Horários de ${getStoreName(selectedStoreId.value)} salvos.`,
    })
    await refreshProgress()
  } catch (cause) {
    $q.notify({
      type: 'negative',
      message:
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar os horários.',
    })
  } finally {
    savingHours.value = false
  }
}

async function refreshProgress() {
  await fetchProgress()

  if (
    !stores.value.some((store) => store.id === selectedStoreId.value)
  ) {
    selectedStoreId.value = stores.value[0]?.id ?? ''
  }
}

watch(error, (message) => {
  if (message) {
    $q.notify({
      type: 'negative',
      message,
      actions: [{ label: 'Tentar novamente', color: 'white', handler: refreshProgress }],
    })
  }
})

watch(selectedStoreId, (storeId) => {
  void loadSchedule(storeId)
})

onMounted(refreshProgress)
</script>
