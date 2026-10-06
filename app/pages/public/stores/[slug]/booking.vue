<template>
  <q-page class="public-booking-page q-pa-md q-pa-lg-xl">
    <div class="booking-container">
      <div class="text-overline text-primary text-weight-bold">
        Agendamento online
      </div>
      <h1 class="text-h4 text-weight-bold q-mt-xs q-mb-sm">
        {{ store?.name ?? 'loja' }}
      </h1>
      <p class="text-body2 text-grey-7 q-mt-none q-mb-lg">
        Escolha um serviço e profissional para consultar os horários realmente
        disponíveis.
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

        <q-form v-else @submit.prevent="submitBooking">
          <q-stepper
            v-model="step"
            flat
            animated
            color="primary"
            done-color="positive"
            class="booking-stepper"
          >
            <q-step
              :name="1"
              title="Serviço"
              icon="mdi-content-cut"
              :done="!!form.serviceId"
            >
              <div class="row q-col-gutter-md">
                <div
                  v-for="service in services"
                  :key="service.id"
                  class="col-12 col-sm-6"
                >
                  <q-card
                    flat
                    bordered
                    class="selection-card full-height"
                    :class="{ 'selection-card--selected': form.serviceId === service.id }"
                    tabindex="0"
                    role="button"
                    @click="selectService(service.id)"
                    @keydown.enter.prevent="selectService(service.id)"
                    @keydown.space.prevent="selectService(service.id)"
                  >
                    <q-card-section>
                      <div class="row items-start no-wrap">
                        <div class="col">
                          <div class="text-subtitle1 text-weight-bold">
                            {{ service.name }}
                          </div>
                          <div class="text-body2 text-grey-7 q-mt-xs">
                            {{ service.description || 'Atendimento profissional.' }}
                          </div>
                        </div>
                        <q-icon
                          v-if="form.serviceId === service.id"
                          name="mdi-check-circle"
                          color="primary"
                          size="22px"
                        />
                      </div>
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="row items-center justify-between q-py-sm">
                      <span class="text-caption text-grey-8">
                        {{ service.durationMinutes }} min
                      </span>
                      <span class="text-subtitle2 text-weight-bold">
                        {{ formatPrice(service.priceCents) }}
                      </span>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
              <div class="row justify-end q-mt-md">
                <q-btn
                  color="primary"
                  unelevated
                  no-caps
                  label="Escolher profissional"
                  icon-right="mdi-arrow-right"
                  :disable="!form.serviceId || loadingProfessionals"
                  :loading="loadingProfessionals"
                  @click="step = 2"
                />
              </div>
            </q-step>

            <q-step
              :name="2"
              title="Profissional"
              icon="mdi-account"
              :done="!!form.professionalId"
            >
              <div v-if="loadingProfessionals" class="text-center q-py-xl">
                <q-spinner-dots color="primary" size="40px" />
                <div class="text-body2 text-grey-7 q-mt-sm">
                  Carregando profissionais...
                </div>
              </div>
              <div
                v-else-if="!professionals.length"
                class="text-body2 text-grey-7 q-py-md"
              >
                Nenhum profissional ativo está associado a este serviço nesta loja.
              </div>
              <div v-else class="row q-col-gutter-md">
                <div
                  v-for="professional in professionals"
                  :key="professional.id"
                  class="col-12 col-sm-6"
                >
                  <q-card
                    flat
                    bordered
                    class="selection-card full-height"
                    :class="{ 'selection-card--selected': form.professionalId === professional.id }"
                    tabindex="0"
                    role="button"
                    @click="selectProfessional(professional.id)"
                    @keydown.enter.prevent="selectProfessional(professional.id)"
                    @keydown.space.prevent="selectProfessional(professional.id)"
                  >
                    <q-card-section class="row items-center no-wrap">
                      <q-avatar size="56px" color="grey-3" text-color="grey-8">
                        <img
                          v-if="professional.avatarUrl"
                          :src="professional.avatarUrl"
                          :alt="professionalName(professional)"
                        >
                        <q-icon v-else name="mdi-account" size="30px" />
                      </q-avatar>
                      <div class="q-ml-md col">
                        <div class="text-subtitle1 text-weight-bold">
                          {{ professionalName(professional) }}
                        </div>
                        <div class="text-body2 text-grey-7">
                          {{ professional.description || 'Profissional da loja' }}
                        </div>
                      </div>
                      <q-icon
                        v-if="form.professionalId === professional.id"
                        name="mdi-check-circle"
                        color="primary"
                        size="22px"
                      />
                    </q-card-section>
                  </q-card>
                </div>
              </div>
              <div class="row justify-between q-mt-md">
                <q-btn flat no-caps label="Voltar" icon="mdi-arrow-left" @click="step = 1" />
                <q-btn
                  color="primary"
                  unelevated
                  no-caps
                  label="Ver horários"
                  icon-right="mdi-arrow-right"
                  :disable="!form.professionalId || loadingAvailability"
                  :loading="loadingAvailability"
                  @click="step = 3"
                />
              </div>
            </q-step>

            <q-step :name="3" title="Horário" icon="mdi-clock-outline">
              <div class="row items-center justify-between q-mb-md">
                <div>
                  <div class="text-h6 text-weight-bold">
                    {{ availabilityDateLabel }}
                  </div>
                  <div class="text-body2 text-grey-7">
                    Horários no fuso da loja · duração de
                    {{ selectedService?.durationMinutes ?? 0 }} minutos
                  </div>
                </div>
                <q-btn
                  outline
                  color="primary"
                  no-caps
                  icon="mdi-calendar-month-outline"
                  label="Agendar outro dia"
                  :disable="!availability"
                  @click="calendarOpen = true"
                />
              </div>

              <div v-if="loadingAvailability" class="text-center q-py-xl">
                <q-spinner-dots color="primary" size="40px" />
                <div class="text-body2 text-grey-7 q-mt-sm">
                  Consultando horários disponíveis...
                </div>
              </div>
              <div
                v-else-if="availability && !availability.slots.length"
                class="text-center text-body2 text-grey-7 q-py-lg"
              >
                Não há horários disponíveis nesta data. Você pode consultar outro dia.
              </div>
              <div v-else class="row q-col-gutter-sm">
                <div
                  v-for="slot in availability?.slots ?? []"
                  :key="slot.startsAt"
                  class="col-6 col-sm-4 col-md-3"
                >
                  <q-btn
                    outline
                    no-caps
                    class="full-width slot-button"
                    :color="form.startsAt === slot.startsAt ? 'primary' : 'grey-8'"
                    :unelevated="form.startsAt === slot.startsAt"
                    :label="slot.time"
                    @click="form.startsAt = slot.startsAt"
                  />
                </div>
              </div>

              <q-input
                v-model="form.notes"
                outlined
                type="textarea"
                autogrow
                maxlength="500"
                label="Observações (opcional)"
                class="q-mt-lg"
              />

              <div class="row justify-between items-center q-mt-md">
                <q-btn flat no-caps label="Voltar" icon="mdi-arrow-left" @click="step = 2" />
                <div class="row items-center q-gutter-sm">
                  <q-btn
                    v-if="auth.accessToken"
                    type="submit"
                    color="primary"
                    unelevated
                    no-caps
                    icon="mdi-calendar-check-outline"
                    label="Solicitar agendamento"
                    :loading="submitting"
                    :disable="!store?.id || !form.startsAt"
                  />
                  <q-btn
                    v-else
                    color="primary"
                    unelevated
                    no-caps
                    label="Entrar para agendar"
                    :to="loginLink"
                    :disable="!form.startsAt"
                  />
                </div>
              </div>
            </q-step>
          </q-stepper>
        </q-form>
      </q-card>
    </div>
    <q-dialog v-model="calendarOpen">
      <q-card>
        <q-card-section class="text-subtitle1 text-weight-bold">
          Escolha outro dia
        </q-card-section>
        <q-date
          v-model="calendarDate"
          mask="YYYY-MM-DD"
          :min="availability?.today"
          :max="availability?.maxDate"
          color="primary"
          @update:model-value="selectDate"
        />
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Fechar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
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
const loginLink = computed(() => ({
  path: `${storePath.value}/login`,
  query: { redirect: route.fullPath },
}))
const store = ref<{ id: string; name: string } | null>(null)
const services = ref<Service[]>([])
const professionals = ref<PublicProfessional[]>([])
const loadingServices = ref(false)
const loadingProfessionals = ref(false)
const loadingAvailability = ref(false)
const submitting = ref(false)
const step = ref(1)
const calendarOpen = ref(false)
const calendarDate = ref('')
const availability = ref<BookingAvailability | null>(null)
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

const selectedService = computed(() =>
  services.value.find((service) => service.id === form.serviceId) ?? null,
)
const availabilityDateLabel = computed(() => {
  if (!availability.value) return 'Horários disponíveis'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(
    new Date(`${availability.value.date}T12:00:00`),
  )
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
      await loadProfessionals(form.serviceId, requestedProfessionalId.value)
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
  avatarUrl: string | null
  description: string | null
}

interface BookingAvailability {
  date: string
  today: string
  maxDate: string
  timezone: string
  slots: Array<{ startsAt: string; time: string }>
}

function professionalName(professional: PublicProfessional) {
  return [professional.firstName, professional.lastName]
    .filter(Boolean)
    .join(' ') || 'Profissional'
}

async function selectService(serviceId: string) {
  if (form.serviceId === serviceId && professionals.value.length) {
    step.value = 2
    return
  }
  form.serviceId = serviceId
  form.professionalId = ''
  form.startsAt = ''
  availability.value = null
  requestedProfessionalId.value = ''
  step.value = 2
  await loadProfessionals(serviceId)
}

async function loadProfessionals(serviceId: string, preferredId = '') {
  form.professionalId = ''
  professionals.value = []
  availability.value = null

  if (!serviceId) return

  loadingProfessionals.value = true

  try {
    professionals.value = await api<PublicProfessional[]>(
      `/public/stores/${encodeURIComponent(slug.value)}/professionals`,
      {
        query: { serviceId },
      },
    )
    if (professionals.value.some(({ id }) => id === preferredId)) {
      form.professionalId = preferredId
    }
    if (form.professionalId) {
      step.value = 3
      await loadAvailability()
    }
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

async function selectProfessional(professionalId: string) {
  form.professionalId = professionalId
  form.startsAt = ''
  availability.value = null
  step.value = 3
  await loadAvailability()
}

async function loadAvailability(date?: string) {
  if (!form.serviceId || !form.professionalId) return

  loadingAvailability.value = true
  try {
    const query: Record<string, string> = {
      serviceId: form.serviceId,
      professionalId: form.professionalId,
    }
    if (date) query.date = date
    const result = await api<BookingAvailability>(
      `/public/stores/${encodeURIComponent(slug.value)}/availability`,
      { query },
    )
    availability.value = result
    calendarDate.value = result.date
    if (!result.slots.some((slot) => slot.startsAt === form.startsAt)) {
      form.startsAt = ''
    }
  } catch (error) {
    availability.value = null
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível consultar os horários disponíveis.',
      ),
      actions: [
        {
          label: 'Tentar novamente',
          color: 'white',
          handler: () => void loadAvailability(date),
        },
      ],
    })
  } finally {
    loadingAvailability.value = false
  }
}

async function selectDate(date: string) {
  if (!date) return
  calendarOpen.value = false
  form.startsAt = ''
  await loadAvailability(date)
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
  if (
    !availability.value?.slots.some((slot) => slot.startsAt === form.startsAt) ||
    Number.isNaN(startsAt.getTime()) ||
    startsAt.getTime() <= Date.now()
  ) {
    $q.notify({
      type: 'negative',
      message: 'Escolha novamente um horário que ainda esteja disponível.',
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

.booking-stepper {
  background: transparent;
}

.selection-card {
  border-radius: 14px;
  cursor: pointer;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.selection-card:hover,
.selection-card:focus-visible {
  border-color: var(--q-primary);
  box-shadow: 0 4px 16px rgb(0 0 0 / 8%);
  outline: none;
}

.selection-card--selected {
  border: 2px solid var(--q-primary);
}

.slot-button {
  min-height: 44px;
}
</style>
