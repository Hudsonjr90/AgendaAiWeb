<template>
  <q-page class="public-professionals-page q-pa-md q-pa-lg-xl wrapper">
    <div class="professionals-container">
      <div class="text-overline text-primary text-weight-bold">Nossa equipe</div>
      <h1 class="text-h4 text-weight-bold q-mt-xs q-mb-sm">
        Profissionais {{ store?.name ?? 'loja' }}
      </h1>
      <p class="text-body2 text-grey-7 q-mt-none q-mb-lg">
        Conheça nossa equipe, os serviços realizados por cada profissional e
        escolha com quem deseja agendar.
      </p>

      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <q-card v-else-if="!professionals.length" flat bordered class="text-center">
        <q-card-section class="q-py-xl">
          <q-icon name="mdi-account-group-outline" size="48px" color="grey-6" />
          <div class="text-h6 q-mt-md">Nenhum profissional disponível</div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            Esta loja ainda não publicou profissionais com serviços ativos.
          </div>
        </q-card-section>
      </q-card>

      <div v-else class="row q-col-gutter-md">
        <div
          v-for="professional in professionals"
          :key="professional.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card flat bordered class="professional-card full-height column">
            <q-card-section class="row items-center q-gutter-md">
              <q-avatar size="72px" color="primary" text-color="white">
                <img
                  v-if="professional.avatarUrl"
                  :src="professional.avatarUrl"
                  :alt="professionalName(professional)"
                />
                <span v-else>{{ initials(professional) }}</span>
              </q-avatar>
              <div class="col">
                <div class="text-h6 text-weight-bold">
                  {{ professionalName(professional) }}
                </div>
              </div>
            </q-card-section>

            <q-card-section v-if="professional.description" class="q-pt-none">
              <div class="text-body2 text-grey-7">
                {{ professional.description }}
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none col">
              <div class="text-caption text-weight-medium text-grey-8 q-mb-sm">
                Serviços realizados
              </div>
              <div class="row q-gutter-xs">
                <q-chip
                  v-for="service in professional.services"
                  :key="service.id"
                  dense
                  color="primary"
                  text-color="white"
                >
                  {{ service.name }}
                </q-chip>
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                color="primary"
                unelevated
                no-caps
                icon="mdi-calendar-clock-outline"
                label="Agendar com este profissional"
                :to="bookingLink(professional.id)"
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
          label="Ver serviços"
          icon-right="mdi-arrow-right"
          :to="servicesPath"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { getErrorMessage } from '~/utils/global'

definePageMeta({
  layout: 'public-store',
})

interface PublicService {
  id: string
  name: string
}

interface PublicProfessional {
  id: string
  firstName: string | null
  lastName: string | null
  description: string | null
  avatarUrl: string | null
  services: PublicService[]
}

const route = useRoute()
const api = useApi()
const $q = useQuasar()
const slug = computed(() => String(route.params.slug ?? ''))
const storePath = computed(
  () => `/public/stores/${encodeURIComponent(slug.value)}`,
)
const servicesPath = computed(() => `${storePath.value}/services`)
const store = ref<{ id: string; name: string } | null>(null)
const professionals = ref<PublicProfessional[]>([])
const loading = ref(false)

function professionalName(professional: PublicProfessional) {
  return (
    [professional.firstName, professional.lastName].filter(Boolean).join(' ') ||
    'Profissional'
  )
}

function initials(professional: PublicProfessional) {
  return (
    [professional.firstName, professional.lastName]
      .filter(Boolean)
      .map((name) => name?.[0]?.toUpperCase())
      .join('') || 'P'
  )
}

function bookingLink(professionalId: string) {
  return {
    path: `${storePath.value}/booking`,
    query: { professionalId },
  }
}

async function loadProfessionals() {
  loading.value = true

  try {
    const [storeData, professionalData] = await Promise.all([
      api<{ id: string; name: string }>(storePath.value),
      api<PublicProfessional[]>(`${storePath.value}/professionals`),
    ])
    store.value = storeData
    professionals.value = professionalData
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível carregar os profissionais desta loja.',
      ),
      actions: [
        {
          label: 'Tentar novamente',
          color: 'white',
          handler: () => void loadProfessionals(),
        },
      ],
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadProfessionals)
</script>

<style scoped>
.public-professionals-page {
  min-height: 70vh;
}

.professionals-container {
  width: min(100%, 1080px);
  margin: 0 auto;
}

.professional-card {
  border-radius: 16px;
}
</style>
