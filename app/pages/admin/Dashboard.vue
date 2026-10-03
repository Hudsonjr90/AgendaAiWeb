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
                  {{ dashboard?.summary.appointmentsToday ?? 0 }}
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

      <!-- Organização 
      <q-card flat bordered class="q-mt-lg">
        <q-card-section>
          <div class="text-h6">
            {{ authStore.organization?.name }}
          </div>

          <div class="text-body2 text-grey-7 q-mt-xs">
            Perfil: {{ roleLabel(authStore.role) }}
          </div>
        </q-card-section>
      </q-card> -->

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
          v-if="!dashboard?.todayAppointments.length"
          class="column items-center justify-center q-py-xl"
        >
          <q-icon
            name="mdi-calendar-blank-outline"
            size="64px"
            color="grey-5"
          />

          <div class="text-h6 q-mt-md">Nenhum agendamento para hoje</div>

          <div class="text-body2 text-grey-7 q-mt-xs">
            Os agendamentos realizados aparecerão aqui.
          </div>
        </q-card-section>

        <!-- Lista -->
        <q-list v-else separator>
          <q-item
            v-for="appointment in dashboard.todayAppointments"
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

watch(error, (message) => {
  if (message) {
    $q.notify({
      type: 'negative',
      message,
    })
  }
})

onMounted(fetchDashboard)
</script>
