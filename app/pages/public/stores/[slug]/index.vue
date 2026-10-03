<template>
  <q-page class="wrapper" :style="themeStyles">
    <!-- Carregamento -->
    <div
      v-if="pending"
      class="column flex-center q-gutter-sm q-pa-xl"
      style="min-height: 70vh"
    >
      <q-spinner-dots color="primary" size="48px" />
      <div class="text-body2 text-grey-7">Carregando loja...</div>
    </div>

    <!-- Erro ou loja não encontrada -->
    <div
      v-else-if="error || !store"
      class="column flex-center text-center q-gutter-md q-pa-xl"
      style="min-height: 70vh"
    >
      <q-icon name="mdi-store-outline" size="56px" color="negative" />

      <div class="text-h5 text-weight-bold">Loja não encontrada</div>

      <div class="text-body2 text-grey-7">
        Não foi possível carregar as informações desta loja. Verifique o
        endereço e tente novamente.
      </div>

      <q-btn
        color="primary"
        unelevated
        rounded
        icon="mdi-refresh"
        no-caps
        label="Tentar novamente"
        :loading="pending"
        @click="retryLoad"
      />
    </div>

    <template v-else>
      <!-- Apresentação -->
      <section id="inicio">
        <div
          class="row items-center q-col-gutter-xl q-px-md q-px-lg-xl q-py-xl"
        >
          <div class="col-12 col-md-7">
            <q-badge
              class="q-px-md q-py-sm store-badge"
              label="Seja bem-vindo"
            />

            <h1 class="text-h3 text-weight-bolder q-mt-md q-mb-sm store-title">
              {{ store.name }}
            </h1>

            <p class="text-body1 text-grey-7 q-mb-lg store-description">
              {{
                store.description ||
                'Conheça nossa loja e acompanhe nossas novidades.'
              }}
            </p>

            <div class="row items-center q-gutter-sm">
              <q-btn
                color="primary"
                :text-color="primaryTextColor"
                unelevated
                rounded
                size="md"
                no-caps
                icon="mdi-calendar-clock-outline"
                label="Agendar horário"
                :to="bookingLink"
              />

              <q-btn
                color="primary"
                :text-color="primaryTextColor"
                outline
                rounded
                size="md"
                no-caps
                icon="mdi-map-marker-outline"
                label="Como chegar"
                :disable="!mapsUrl"
                :href="mapsUrl || undefined"
                :target="mapsUrl ? '_blank' : undefined"
                rel="noopener noreferrer"
              />

              <q-btn
                v-if="store.phone"
                color="primary"
                :text-color="primaryTextColor"
                outline
                rounded
                size="md"
                icon="mdi-whatsapp"
                label="Entrar em contato"
                :href="phoneUrl"
                no-caps
              />
            </div>
          </div>

          <div class="col-12 col-md-5 flex flex-center">
            <div class="q-pa-lg">
              <q-avatar v-if="store.theme?.logoUrl" class="store-visual-logo">
                <img :src="store.theme.logoUrl" :alt="`Logo ${store.name}`" />
              </q-avatar>

              <q-avatar
                v-else
                size="100%"
                color="primary"
                :text-color="primaryTextColor"
                class="store-visual-logo"
              >
                <q-icon name="mdi-storefront-outline" size="56px" />
              </q-avatar>

              <div class="text-h6 text-weight-bold text-center q-mt-md">
                {{ store.name }}
              </div>

              <div class="text-caption text-grey-7 text-center q-mt-xs">
                Sua experiência começa aqui
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="agendamento" class="q-px-md q-px-lg-xl q-py-xl">
        <q-card flat class="">
          <q-card-section class="row items-center q-col-gutter-md">
            <div class="col-auto">
              <q-avatar color="white" text-color="primary" size="56px">
                <q-icon name="mdi-calendar-clock-outline" size="30px" />
              </q-avatar>
            </div>

            <div class="col-12 col-sm">
              <div class="text-h6 text-weight-bold">Agendamento online</div>

              <p class="text-body2 q-mt-xs q-mb-none">
                Confira nossos serviços, conheça os profissionais e prepare seu
                próximo agendamento.
              </p>
            </div>

            <div class="col-12 col-sm-auto">
              <div class="row items-center q-gutter-sm">
                <q-btn
                  unelevated
                  no-caps
                  rounded
                  color="primary"
                  :text-color="primaryTextColor"
                  icon="mdi-account-circle-outline"
                  label="Agendamentos"
                  :to="accountPath"
                />

                <q-btn
                  outline
                  no-caps
                  rounded
                  color="primary"
                  icon="mdi-calendar-clock-outline"
                  label="Agendar"
                  :to="bookingLink"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </section>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { CSSProperties } from 'vue'
import { useCustomerAuthStore } from '~/stores/customer-auth'

interface StoreTheme {
  id?: string
  storeId?: string
  logoUrl?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  accentColor?: string | null
  positiveColor?: string | null
  negativeColor?: string | null
  infoColor?: string | null
  warningColor?: string | null
  darkColor?: string | null
  lightColor?: string | null
  fontFamily?: string | null
}

interface PublicStore {
  id: string
  name: string
  slug: string
  publicSlug?: string
  description?: string | null
  phone?: string | null
  street?: string | null
  number?: string | null
  complement?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  latitude?: number | null
  longitude?: number | null
  theme?: StoreTheme | null
}

interface PublicStoreHeader {
  name: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

definePageMeta({
  layout: 'public-store',
})

const route = useRoute()
const api = useApi()
const auth = useCustomerAuthStore()

const storeSlug = computed(() => String(route.params.slug ?? ''))
const storePath = computed(
  () => `/public/stores/${encodeURIComponent(storeSlug.value)}`,
)
const loginPath = computed(() => `${storePath.value}/login`)
const registerPath = computed(() => `${storePath.value}/register`)
const accountPath = computed(() => `${storePath.value}/account`)
const bookingLink = computed(() => ({
  path: storePath.value,
  hash: '#agendamento',
}))

const {
  data: store,
  pending,
  error,
  refresh,
} = await useAsyncData<PublicStore>(
  `public-store-${storeSlug.value}`,
  () =>
    api<PublicStore>(`/public/stores/${encodeURIComponent(storeSlug.value)}`, {
      method: 'GET',
    }),
  {
    watch: [storeSlug],
  },
)

const defaultTheme = {
  primaryColor: '#642AFB',
  secondaryColor: '#FFC107',
  accentColor: '#FF4081',
}

const theme = computed(() => {
  const savedTheme = store.value?.theme

  return {
    primaryColor: savedTheme?.primaryColor || defaultTheme.primaryColor,
    secondaryColor: savedTheme?.secondaryColor || defaultTheme.secondaryColor,
    accentColor: savedTheme?.accentColor || defaultTheme.accentColor,
  }
})

const storeHeader = useState<PublicStoreHeader>('public-store-header', () => ({
  name: '',
  logoUrl: null,
  ...defaultTheme,
}))

watch(
  [store, theme],
  ([currentStore, currentTheme]) => {
    if (!currentStore) {
      storeHeader.value = {
        name: '',
        logoUrl: null,
        ...defaultTheme,
      }
      return
    }

    storeHeader.value = {
      name: currentStore.name,
      logoUrl: currentStore.theme?.logoUrl ?? null,
      primaryColor: currentTheme.primaryColor,
      secondaryColor: currentTheme.secondaryColor,
      accentColor: currentTheme.accentColor,
    }
  },
  { immediate: true },
)

const themeStyles = computed<CSSProperties>(() => ({
  '--store-primary': theme.value.primaryColor,
  '--store-secondary': theme.value.secondaryColor,
  '--store-accent': theme.value.accentColor,
  '--q-primary': theme.value.primaryColor,
  '--q-secondary': theme.value.secondaryColor,
  '--q-accent': theme.value.accentColor,
}))

const getReadableTextColor = (hex: string): string => {
  const normalized = hex.replace('#', '')

  if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) {
    return '#FFFFFF'
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16) / 255
  const green = Number.parseInt(normalized.slice(2, 4), 16) / 255
  const blue = Number.parseInt(normalized.slice(4, 6), 16) / 255

  const linearize = (value: number) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4

  const luminance =
    0.2126 * linearize(red) +
    0.7152 * linearize(green) +
    0.0722 * linearize(blue)

  return luminance > 0.42 ? '#241610' : '#FFFFFF'
}

const primaryTextColor = computed(() =>
  getReadableTextColor(theme.value.primaryColor),
)

const fullAddress = computed(() => {
  if (!store.value) return ''

  return [
    store.value.street,
    store.value.number,
    store.value.complement,
    store.value.neighborhood,
    store.value.city,
    store.value.state,
    store.value.postalCode,
  ]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ')
})

const mapsUrl = computed(() => {
  if (!store.value) return ''

  const { latitude, longitude } = store.value

  if (latitude != null && longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  }

  if (fullAddress.value) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress.value)}`
  }

  return ''
})

const phoneUrl = computed(() => {
  const phone = store.value?.phone?.replace(/\D/g, '')
  return phone ? `tel:${phone}` : ''
})

const retryLoad = () => refresh()

useHead(() => ({
  title: store.value ? `${store.value.name} | AgendaAi` : 'Loja | AgendaAi',
  meta: [
    {
      name: 'description',
      content:
        store.value?.description ||
        `Conheça ${store.value?.name || 'nossa loja'} e confira nossas informações.`,
    },
  ],
}))
</script>

<style scoped>
.store-hero {
  background: linear-gradient(
    110deg,
    color-mix(in srgb, var(--store-primary) 7%, white),
    color-mix(in srgb, var(--store-accent) 4%, white)
  );
}

.store-badge {
  color: var(--store-primary);
  background: color-mix(in srgb, var(--store-primary) 10%, white);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.store-title {
  color: #2b2726;
  overflow-wrap: anywhere;
}

.store-description {
  max-width: 560px;
  line-height: 1.8;
}

.store-visual-logo {
  overflow: hidden;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.store-visual-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 599px) {
  .store-title {
    font-size: 2.25rem;
    line-height: 1.15;
  }

  .store-visual {
    min-height: 240px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .store-info-card {
    transition: none;
  }
}
</style>
