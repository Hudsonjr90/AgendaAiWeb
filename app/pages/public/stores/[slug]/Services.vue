<template>
  <q-page class="public-services-page q-pa-md q-pa-lg-xl wrapper">
    <div class="services-container">
      <div class="text-overline text-primary text-weight-bold">Nosso catálogo</div>
      <h1 class="text-h4 text-weight-bold q-mt-xs q-mb-sm">
        Serviços {{ store?.name ?? 'loja' }}
      </h1>
      <p class="text-body2 text-grey-7 q-mt-none q-mb-lg">
        Confira os serviços disponíveis, seus valores e duração.
      </p>

      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <q-card
        v-else-if="!services.length"
        flat
        bordered
        class="text-center"
      >
        <q-card-section class="q-py-xl">
          <q-icon name="mdi-content-cut" size="48px" color="grey-6" />
          <div class="text-h6 q-mt-md">Nenhum serviço disponível</div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            Esta loja ainda não publicou serviços ativos.
          </div>
        </q-card-section>
      </q-card>

      <div v-else class="row q-col-gutter-md">
        <div
          v-for="service in services"
          :key="service.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card flat bordered class="service-card full-height column">
            <q-card-section class="col">
              <div class="text-h6 text-weight-bold">{{ service.name }}</div>
              <div class="text-body2 text-grey-7 q-mt-sm">
                {{ service.description || 'Consulte a loja para mais informações sobre este serviço.' }}
              </div>
            </q-card-section>

            <q-card-section class="row items-center justify-between q-pt-none">
              <div class="row items-center text-body2 text-grey-8">
                <q-icon name="mdi-clock-outline" class="q-mr-xs" />
                {{ service.durationMinutes }} min
              </div>
              <div class="text-subtitle1 text-weight-bold text-primary">
                {{ formatPrice(service.priceCents) }}
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                color="primary"
                unelevated
                no-caps
                icon="mdi-calendar-clock-outline"
                label="Agendar serviço"
                :to="bookingLink(service.id)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <div class="row justify-end q-mt-lg">
        <q-btn
          flat
          no-caps
          color="primary"
          label="Conheça nossos profissionais"
          icon-right="mdi-arrow-right"
          :to="professionalsPath"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import type { Service } from '~/types/api'
import { getErrorMessage } from '~/utils/global'

definePageMeta({
  layout: 'public-store',
})

const route = useRoute()
const api = useApi()
const $q = useQuasar()
const slug = computed(() => String(route.params.slug ?? ''))
const storePath = computed(
  () => `/public/stores/${encodeURIComponent(slug.value)}`,
)
const professionalsPath = computed(() => `${storePath.value}/professionals`)
const store = ref<{ id: string; name: string } | null>(null)
const services = ref<Service[]>([])
const loading = ref(false)

function bookingLink(serviceId: string) {
  return {
    path: `${storePath.value}/booking`,
    query: { serviceId },
  }
}

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceCents / 100)
}

async function loadServices() {
  loading.value = true

  try {
    const [storeData, serviceData] = await Promise.all([
      api<{ id: string; name: string }>(storePath.value),
      api<Service[]>(`${storePath.value}/services`),
    ])
    store.value = storeData
    services.value = serviceData
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'Não foi possível carregar os serviços desta loja.'),
      actions: [
        {
          label: 'Tentar novamente',
          color: 'white',
          handler: () => void loadServices(),
        },
      ],
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadServices)
</script>

<style scoped>
.public-services-page {
  min-height: 70vh;
}

.services-container {
  width: min(100%, 1080px);
  margin: 0 auto;
}

.service-card {
  border-radius: 16px;
}
</style>
