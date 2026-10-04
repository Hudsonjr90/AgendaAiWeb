<template>
  <q-page class="public-booking-page q-pa-md q-pa-lg-xl">
    <div class="booking-container">
      <div class="text-overline text-primary text-weight-bold">
        Agendamento online
      </div>
      <h1 class="text-h4 text-weight-bold q-mt-xs q-mb-sm">
        Agende na {{ store?.name ?? 'loja' }}
      </h1>
      <p class="text-body2 text-grey-7 q-mt-none q-mb-lg">
        Escolha um serviço, um profissional e o horário desejado. A loja
        confirmará a disponibilidade antes de concluir.
      </p>

      <q-card flat bordered class="booking-card">
        <q-card-section v-if="loadingServices" class="text-center q-py-xl">
          <q-spinner-dots color="primary" size="40px" />
          <div class="text-body2 text-grey-7 q-mt-sm">
            Carregando serviços disponíveis...
          </div>
        </q-card-section>

        <q-card-section
          v-else-if="!services.length"
          class="column items-center text-center q-py-xl"
        >
          <q-icon name="mdi-calendar-remove-outline" size="48px" color="grey-6" />
          <div class="text-h6 q-mt-md">Nenhum serviço disponível</div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            Esta loja ainda não publicou serviços ativos para agendamento.
          </div>
        </q-card-section>

        <q-form v-else class="q-gutter-md" @submit.prevent="submitBooking">
          <q-card-section class="q-gutter-md">
            <q-select
              v-model="form.serviceId"
              outlined
              emit-value
              map-options
              label="Serviço *"
              :options="serviceOptions"
              :loading="loadingServices"
              :rules="[(value) => !!value || 'Selecione um serviço']"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey-7">
                    Nenhum serviço ativo disponível nesta loja.
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-banner
              v-if="form.serviceId && !loadingProfessionals && !professionals.length"
              dense
              rounded
              class="bg-orange-1 text-orange-10"
            >
              Nenhum profissional ativo está associado a este serviço nesta
              loja. Escolha outro serviço ou entre em contato com a loja.
            </q-banner>

            <q-select
              v-model="form.professionalId"
              outlined
              emit-value
              map-options
              label="Profissional *"
              :options="professionalOptions"
              :loading="loadingProfessionals"
              :disable="!form.serviceId || !professionals.length"
              :rules="[(value) => !!value || 'Selecione um profissional']"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey-7">
                    Selecione um serviço com profissionais disponíveis.
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              v-model="form.startsAt"
              outlined
              type="datetime-local"
              label="Data e horário desejado *"
              :min="minimumDateTime"
              :rules="[
                (value) => !!value || 'Informe a data e o horário',
                (value) =>
                  !value || new Date(value).getTime() > Date.now() ||
                  'Escolha um horário futuro',
              ]"
            />

            <q-input
              v-model="form.notes"
              outlined
              type="textarea"
              autogrow
              maxlength="500"
              label="Observações (opcional)"
            />

          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              flat
              no-caps
              label="Ver profissionais"
              :to="professionalsPath"
            />
            <q-btn
              v-if="auth.accessToken"
              type="submit"
              color="primary"
              unelevated
              no-caps
              icon="mdi-calendar-check-outline"
              label="Solicitar agendamento"
              :loading="submitting"
              :disable="!store?.id || !professionals.length"
            />
            <q-btn
              v-else
              color="primary"
              unelevated
              no-caps
              label="Entrar para agendar"
              :to="loginLink"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import type { Service } from '~/types/api'
import { getErrorMessage } from '~/utils/global'
import { useCustomerAuthStore } from '~/stores/customer-auth'

definePageMeta({
  layout: 'public-store',
})

const route = useRoute()
const api = useApi()
const config = useRuntimeConfig()
const auth = useCustomerAuthStore()
const $q = useQuasar()
const slug = computed(() => String(route.params.slug ?? ''))
const storePath = computed(
  () => `/public/stores/${encodeURIComponent(slug.value)}`,
)
const accountPath = computed(() => `${storePath.value}/account`)
const professionalsPath = computed(() => `${storePath.value}/professionals`)
const loginLink = computed(() => ({
  path: `${storePath.value}/login`,
  query: { redirect: route.fullPath },
}))
const registerLink = computed(() => ({
  path: `${storePath.value}/register`,
  query: { redirect: route.fullPath },
}))

const store = ref<{ id: string; name: string } | null>(null)
const services = ref<Service[]>([])
const professionals = ref<PublicProfessional[]>([])
const loadingServices = ref(false)
const loadingProfessionals = ref(false)
const submitting = ref(false)
const form = reactive({
  serviceId: typeof route.query.serviceId === 'string'
    ? route.query.serviceId
    : '',
  professionalId: typeof route.query.professionalId === 'string'
    ? route.query.professionalId
    : '',
  startsAt: '',
  notes: '',
})

const serviceOptions = computed(() =>
  services.value.map((service) => ({
    label: `${service.name} · ${service.durationMinutes} min · ${formatPrice(service.priceCents)}`,
    value: service.id,
  })),
)
const professionalOptions = computed(() =>
  professionals.value.map((professional) => ({
    label:
      [professional.firstName, professional.lastName]
        .filter(Boolean)
        .join(' ') || 'Profissional',
    value: professional.id,
  })),
)
const minimumDateTime = computed(() => {
  const localNow = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
  return localNow.toISOString().slice(0, 16)
})

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceCents / 100)
}

async function loadCatalog() {
  loadingServices.value = true

  try {
    const [storeData, serviceData] = await Promise.all([
      api<{ id: string; name: string }>(
        `/public/stores/${encodeURIComponent(slug.value)}`,
      ),
      api<Service[]>(
        `/public/stores/${encodeURIComponent(slug.value)}/services`,
      ),
    ])
    store.value = storeData
    services.value = serviceData

    if (
      form.serviceId &&
      !serviceData.some((service) => service.id === form.serviceId)
    ) {
      form.serviceId = ''
    }
    if (form.serviceId) {
      await loadProfessionals(form.serviceId)
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível carregar os serviços desta loja.',
      ),
      actions: [
        {
          label: 'Tentar novamente',
          color: 'white',
          handler: () => void loadCatalog(),
        },
      ],
    })
  } finally {
    loadingServices.value = false
  }
}

const requestedProfessionalId = ref(form.professionalId)

interface PublicProfessional {
  id: string
  firstName: string | null
  lastName: string | null
}

async function loadProfessionals(serviceId: string) {
  const requestedId = requestedProfessionalId.value
  form.professionalId = ''
  professionals.value = []

  if (!serviceId) return

  loadingProfessionals.value = true

  try {
    professionals.value = await api<PublicProfessional[]>(
      `/public/stores/${encodeURIComponent(slug.value)}/professionals`,
      {
        query: { serviceId },
      },
    )
    if (professionals.value.some(({ id }) => id === requestedId)) {
      form.professionalId = requestedId
    }
    requestedProfessionalId.value = ''
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível carregar os profissionais disponíveis.',
      ),
      actions: [
        {
          label: 'Tentar novamente',
          color: 'white',
          handler: () => void loadProfessionals(serviceId),
        },
      ],
    })
  } finally {
    loadingProfessionals.value = false
  }
}

async function submitBooking() {
  if (submitting.value) return

  if (!auth.accessToken) {
    await navigateTo(loginLink.value)
    return
  }

  if (!auth.customer && !(await auth.fetchMe())) {
    await navigateTo(loginLink.value)
    return
  }

  const startsAt = new Date(form.startsAt)

  if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
    $q.notify({
      type: 'negative',
      message: 'Escolha uma data e um horário futuros.',
    })
    return
  }

  submitting.value = true

  try {
    await $fetch('/public/appointments', {
      baseURL: config.public.apiBaseUrl,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: {
        storeId: store.value?.id,
        professionalId: form.professionalId,
        serviceId: form.serviceId,
        startsAt: startsAt.toISOString(),
        notes: form.notes.trim() || undefined,
      },
    })
    $q.notify({
      type: 'positive',
      message: 'Solicitação de agendamento enviada.',
      actions: [
        {
          label: 'Ver minha conta',
          noCaps: true,
          color: 'white',
          handler: () => void navigateTo(accountPath.value),
        },
      ],
    })
  } catch (error) {
    const message = getErrorMessage(
      error,
      'Não foi possível solicitar esse horário. Escolha outra opção.',
    )
    if (
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      error.statusCode === 401
    ) {
      auth.logout()
    }
    $q.notify({
      type: 'negative',
      message,
    })
  } finally {
    submitting.value = false
  }
}

watch(
  () => form.serviceId,
  (serviceId) => {
    void loadProfessionals(serviceId)
  },
)

onMounted(loadCatalog)
</script>

<style scoped>
.public-booking-page {
  min-height: 70vh;
  background: #f7f7fb;
}

.booking-container {
  width: min(100%, 820px);
  margin: 0 auto;
}

.booking-card {
  border-radius: 18px;
}
</style>
