<template>
  <q-page class="q-pa-lg wrapper">
    <div class="row items-center justify-between">
      <div>
        <div class="text-h4 text-weight-bold">Dashboard</div>

        <div class="text-subtitle1 q-mt-sm">
          Olá, {{ authStore.user?.firstName ?? '' }}
          {{ authStore.user?.lastName ?? '' }}!
        </div>
      </div>

      <q-btn
        flat
        round
        icon="mdi-refresh"
        :loading="loading"
        aria-label="Atualizar dashboard"
        @click="fetchDashboard"
      >
        <q-tooltip>Atualizar</q-tooltip>
      </q-btn>
    </div>

    <q-card flat bordered class="q-mt-lg">
      <q-card-section>
        <div class="text-h6">
          {{ authStore.organization?.name }}
        </div>

        <div class="text-body2 text-grey-7 q-mt-xs">
          Perfil: {{ roleLabel(authStore.role) }}
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="loading" class="row q-col-gutter-md q-mt-lg">
      <div v-for="item in 3" :key="item" class="col-12 col-sm-4">
        <q-card flat bordered>
          <q-card-section>
            <q-skeleton type="text" width="50%" />
            <q-skeleton type="text" class="text-h4" width="30%" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <template v-else-if="dashboard">
      <!-- Indicadores -->
      <div class="row q-col-gutter-md q-mt-lg">
        <div class="col-12 col-sm-4">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center no-wrap">
              <q-avatar color="primary" text-color="white" size="48px">
                <q-icon name="mdi-calendar-check-outline" />
              </q-avatar>

              <div class="q-ml-md">
                <div class="text-body2 text-grey-7">Agendamentos hoje</div>

                <div class="text-h4 text-weight-bold">
                  {{ confirmedTodayAppointments.length }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-4">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center no-wrap">
              <q-avatar color="info" text-color="white" size="48px">
                <q-icon name="mdi-account-group-outline" />
              </q-avatar>

              <div class="q-ml-md">
                <div class="text-body2 text-grey-7">Clientes</div>

                <div class="text-h4 text-weight-bold">
                  {{ dashboard?.summary.customers ?? 0 }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-4">
          <q-card flat bordered class="full-height">
            <q-card-section class="row items-center no-wrap">
              <q-avatar color="secondary" text-color="white" size="48px">
                <q-icon name="mdi-account-tie-outline" />
              </q-avatar>

              <div class="q-ml-md">
                <div class="text-body2 text-grey-7">Profissionais</div>

                <div class="text-h4 text-weight-bold">
                  {{ dashboard?.summary.professionals ?? 0 }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card
        v-if="
          setupLoaded &&
          !setupComplete &&
          ['OWNER', 'ADMIN'].includes(authStore.role ?? '')
        "
        flat
        bordered
        class="q-mt-lg full-width"
      >
        <q-card-section class="row items-center q-col-gutter-md">
          <div class="col">
            <div class="text-h6 text-weight-bold">
              Termine a configuração da sua organização
            </div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              {{ setupCompletedCount }} de {{ setupSteps.length }} etapas
              concluídas. Você pode continuar agora ou voltar a este checklist
              depois.
            </div>
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              flat
              round
              icon="mdi-refresh"
              aria-label="Atualizar configuração"
              :loading="setupLoading"
              @click="fetchSetupProgress"
            />
            <q-btn
              color="primary"
              unelevated
              no-caps
              label="Continuar configuração"
              to="/admin/onboarding"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-list separator>
          <q-item v-for="setupStep in setupSteps" :key="setupStep.key">
            <q-item-section avatar>
              <q-icon
                :name="
                  setupStep.completed
                    ? 'mdi-check-circle'
                    : 'mdi-circle-outline'
                "
                :color="setupStep.completed ? 'positive' : 'grey-6'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ setupStep.title }}</q-item-label>
              <q-item-label caption>{{ setupStep.detail }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>

      <!-- Agendamentos -->
      <q-card flat bordered class="q-mt-lg">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6">Agendamentos de hoje</div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Estado vazio -->
        <q-card-section
          v-if="!confirmedTodayAppointments.length"
          class="column items-center justify-center q-py-xl"
        >
          <q-icon
            name="mdi-calendar-blank-outline"
            size="64px"
            color="grey-5"
          />

          <div class="text-h6 q-mt-md">
            Nenhum agendamento confirmado para hoje
          </div>

          <div class="text-body2 text-grey-7 q-mt-xs">
            Os agendamentos realizados aparecerão aqui.
          </div>
        </q-card-section>

        <!-- Lista -->
        <q-list v-else separator>
          <q-item
            v-for="appointment in confirmedTodayAppointments"
            :key="appointment.id"
            class="q-py-md"
          >
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white">
                <q-icon name="mdi-calendar-clock-outline" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ appointment.customer.name }}
              </q-item-label>

              <q-item-label caption>
                {{ appointment.service.name }}
                · {{ appointment.professional.name }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="text-weight-medium">
                {{
                  new Date(appointment.startsAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }}
              </div>

              <div class="text-caption text-grey-7">
                {{ appointment.store.name }}
              </div>
              <q-badge class="q-mt-xs q-ml-sm q-px-sm q-py-xs">
                {{ appointmentStatusLabel(appointment.status) }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { roleLabel } from '@/utils/global'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: ['OWNER', 'ADMIN', 'MANAGER', 'STAFF'],
})

const authStore = useAuthStore()
const $q = useQuasar()

const { dashboard, loading, error, fetchDashboard } = useDashboard()
const confirmedTodayAppointments = computed(
  () =>
    dashboard.value?.todayAppointments.filter(
      (appointment) => appointment.status === 'CONFIRMED',
    ) ?? [],
)

const {
  steps: setupSteps,
  completedCount: setupCompletedCount,
  isComplete: setupComplete,
  loaded: setupLoaded,
  loading: setupLoading,
  error: setupError,
  fetchProgress: fetchSetupProgress,
} = useOrganizationSetup()

watch(error, (message) => {
  if (message) {
    $q.notify({
      type: 'negative',
      message,
    })
  }
})

watch(setupError, (message) => {
  if (message) {
    $q.notify({
      type: 'negative',
      message,
    })
  }
})

onMounted(async () => {
  await Promise.all([fetchDashboard(), fetchSetupProgress()])
})
</script>
