
<template>
  <q-page class="account-page q-pa-md q-pa-lg-xl">
    <div class="account-container">
      <div class="row items-center justify-between q-col-gutter-md q-mb-lg">
        <div class="col">
          <div class="text-overline text-primary text-weight-bold">
            Minha conta
          </div>

          <h1 class="text-h4 text-weight-bold q-my-sm">
            Olá, {{ firstName }}!
          </h1>

          <p class="text-body2 text-grey-7 q-mb-none">
            Acompanhe seus dados e seus agendamentos.
          </p>
        </div>

        <div class="col-auto">
          <q-btn
            outline
            rounded
            no-caps
            color="grey-8"
            icon="mdi-logout"
            label="Sair"
            @click="logout"
          />
        </div>
      </div>

      <q-card flat bordered class="account-card q-mb-md">
        <q-card-section class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar size="64px" color="primary" text-color="white">
              <span class="text-h5 text-weight-bold">
                {{ initials }}
              </span>
            </q-avatar>
          </div>

          <div class="col">
            <div class="text-h6 text-weight-bold">
              {{ fullName }}
            </div>

            <div
              v-if="auth.customer?.email"
              class="text-body2 text-grey-7"
            >
              {{ auth.customer.email }}
            </div>

            <div
              v-if="auth.customer?.phone"
              class="text-body2 text-grey-7"
            >
              {{ auth.customer.phone }}
            </div>
          </div>

          <div class="col-12 col-sm-auto">
            <q-badge
              :color="auth.customer?.status === 'ACTIVE' ? 'positive' : 'grey'"
              :label="auth.customer?.status === 'ACTIVE' ? 'Conta ativa' : 'Conta'"
              rounded
              class="q-px-md q-py-sm"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="account-card">
        <q-card-section>
          <div class="row items-center q-col-gutter-md q-mb-md">
            <div class="col">
              <div class="text-h6 text-weight-bold">
                Meus agendamentos
              </div>
            </div>

            <div class="col-auto">
              <q-btn
                flat
                round
                icon="mdi-refresh"
                aria-label="Atualizar agendamentos"
                :loading="loadingAppointments"
                @click="loadAppointments"
              />
            </div>
          </div>

          <div v-if="loadingAppointments" class="row justify-center q-pa-lg">
            <q-spinner-dots color="primary" size="36px" />
          </div>

          <div
            v-else-if="!appointments.length"
            class="column items-center text-center q-py-lg"
          >
            <q-icon
              name="mdi-calendar-blank-outline"
              color="grey-6"
              size="42px"
            />
            <div class="text-subtitle1 text-weight-medium q-mt-sm">
              Você ainda não tem agendamentos nesta loja
            </div>
            <q-btn
              color="primary"
              unelevated
              rounded
              no-caps
              icon="mdi-calendar-clock-outline"
              label="Escolher um serviço"
              :to="bookingPath"
              class="q-mt-md"
            />
          </div>

          <q-list v-else separator>
            <q-item
              v-for="appointment in appointments"
              :key="appointment.id"
              class="q-px-none q-py-md"
            >
              <q-item-section avatar top>
                <q-avatar color="primary" text-color="white">
                  <q-icon name="mdi-calendar-clock-outline" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-subtitle1 text-weight-bold">
                  {{ appointment.service.name }}
                </q-item-label>
                <q-item-label class="q-mt-xs">
                  {{ formatAppointmentDate(appointment.startsAt) }}
                </q-item-label>
                <q-item-label caption class="q-mt-xs">
                  {{ formatAppointmentTime(appointment.startsAt) }} –
                  {{ formatAppointmentTime(appointment.endsAt) }}
                  <span v-if="professionalName(appointment)">
                    · {{ professionalName(appointment) }}
                  </span>
                </q-item-label>
                <q-item-label caption>
                  {{ appointment.store.name }} ·
                  {{ formatPrice(appointment.service.priceCents) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side top>
                <q-badge
                  rounded
                  :color="appointmentStatusColor(appointment.status)"
                  :label="appointmentStatusLabel(appointment.status)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useCustomerAuthStore } from '~/stores/customer-auth';
import { getErrorMessage } from '~/utils/global'

definePageMeta({
  layout: 'public-store',
  middleware: ['customer-auth'],
});

const route = useRoute();
const api = useApi()
const $q = useQuasar()
const auth = useCustomerAuthStore();

const slug = computed(() => String(route.params.slug ?? ''));
const bookingPath = computed(
  () => `/public/stores/${encodeURIComponent(slug.value)}/booking`,
)

type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

interface CustomerAppointment {
  id: string
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  store: {
    id: string
    name: string
  }
  professional: {
    firstName: string | null
    lastName: string | null
  }
  service: {
    name: string
    priceCents: number
  }
}

const appointments = ref<CustomerAppointment[]>([])
const loadingAppointments = ref(false)

const storePath = computed(
  () => `/public/stores/${encodeURIComponent(slug.value)}`,
);

const firstName = computed(
  () => auth.customer?.firstName?.trim() || 'cliente',
);

const fullName = computed(() => {
  const customer = auth.customer;

  if (!customer) {
    return 'Cliente';
  }

  const name = [customer.firstName, customer.lastName]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(' ')
    .trim();

  return name || 'Cliente';
});

const initials = computed(() => {
  const names = fullName.value
    .split(/\s+/)
    .filter(Boolean);

  return (
    names
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join('') || 'C'
  );
});

function professionalName(appointment: CustomerAppointment) {
  return [
    appointment.professional.firstName,
    appointment.professional.lastName,
  ]
    .filter(Boolean)
    .join(' ')
}

function formatAppointmentDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
  }).format(new Date(value))
}

function formatAppointmentTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceCents / 100)
}

function appointmentStatusLabel(status: AppointmentStatus) {
  const labels: Record<AppointmentStatus, string> = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'Não compareceu',
  }
  return labels[status]
}

function appointmentStatusColor(status: AppointmentStatus) {
  const colors: Record<AppointmentStatus, string> = {
    PENDING: 'warning',
    CONFIRMED: 'positive',
    COMPLETED: 'primary',
    CANCELLED: 'negative',
    NO_SHOW: 'grey-7',
  }
  return colors[status]
}

async function loadAppointments() {
  if (!auth.accessToken) return

  loadingAppointments.value = true

  try {
    appointments.value = await api<CustomerAppointment[]>(
      '/public/appointments',
      {
        query: { publicSlug: slug.value },
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível carregar seus agendamentos.',
      ),
    })
  } finally {
    loadingAppointments.value = false
  }
}

const logout = async () => {
  auth.logout()
  await navigateTo('/customer/login')
};

onMounted(loadAppointments)

useHead({
  title: 'Minha conta | AgendaAi',
});
</script>

<style scoped>
.account-page {
  min-height: 70vh;
  background: #f7f7fb;
}

.account-container {
  width: min(100%, 1000px);
  margin: 0 auto;
}

.account-card {
  border-radius: 18px;
}
</style>
