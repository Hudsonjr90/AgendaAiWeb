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
      <div class="store-container q-pa-md q-pa-lg-xl">
        <q-carousel
          v-if="bannerImages.length"
          v-model="activeSlide"
          animated
          infinite
          autoplay
          arrows
          navigation
          :navigation-position="'bottom'"
          class="storefront-carousel"
        >
          <q-carousel-slide
            v-for="(image, index) in bannerImages"
            :key="`${index}-${image}`"
            :name="index"
            :img-src="image"
            class="storefront-slide"
          >
            <div class="storefront-overlay">
              <div class="storefront-copy">
                <q-badge
                  class="q-px-md q-py-sm store-badge"
                  label="Seja bem-vindo"
                />
                <h1 class="text-h3 text-weight-bolder q-mt-md q-mb-sm store-title">
                  {{ store.name }}
                </h1>
                <p class="text-body1 q-mb-lg storefront-description">
                  {{ store.description || 'Conheça nossa loja e acompanhe nossas novidades.' }}
                </p>
                <div class="row items-center q-gutter-sm">
                  <q-btn
                    color="primary"
                    :text-color="primaryTextColor"
                    unelevated
                    rounded
                    no-caps
                    icon="mdi-calendar-clock-outline"
                    label="Agendar horário"
                    :to="bookingLink"
                  />
                  <q-btn
                    v-if="mapsUrl"
                    color="white"
                    text-color="dark"
                    outline
                    rounded
                    no-caps
                    icon="mdi-map-marker-outline"
                    label="Como chegar"
                    :href="mapsUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                </div>
              </div>
            </div>
          </q-carousel-slide>
        </q-carousel>

        <section v-else class="storefront-fallback q-pa-lg q-pa-md-xl">
          <div class="storefront-copy">
            <q-badge
              class="q-px-md q-py-sm store-badge"
              label="Seja bem-vindo"
            />
            <h1 class="text-h3 text-weight-bolder q-mt-md q-mb-sm store-title">
              {{ store.name }}
            </h1>
            <p class="text-body1 text-grey-7 q-mb-lg store-description">
              {{ store.description || 'Conheça nossa loja e acompanhe nossas novidades.' }}
            </p>
            <div class="row items-center q-gutter-sm">
              <q-btn
                color="primary"
                :text-color="primaryTextColor"
                unelevated
                rounded
                no-caps
                icon="mdi-calendar-clock-outline"
                label="Agendar horário"
                :to="bookingLink"
              />
              <!-- <q-btn
                v-if="mapsUrl"
                color="primary"
                outline
                rounded
                no-caps
                icon="mdi-map-marker-outline"
                label="Como chegar"
                :href="mapsUrl"
                target="_blank"
                rel="noopener noreferrer"
              /> -->
            </div>
          </div>
          <div class="store-logo-wrap">
            <q-img
              v-if="store.theme?.logoUrl"
              :src="store.theme.logoUrl"
              :alt="`Logo ${store.name}`"
              fit="contain"
              class="store-visual-logo"
            />
            <q-avatar
              v-else
              size="100%"
              color="primary"
              :text-color="primaryTextColor"
              class="store-visual-logo"
            >
              <q-icon name="mdi-storefront-outline" size="64px" />
            </q-avatar>
          </div>
        </section>

        <section class="store-info-section q-mt-xl">
          <div class="row q-col-gutter-lg items-stretch">
            <div class="col-12 col-md-5">
              <q-card flat bordered class="full-height border-radius">
                <q-card-section class="q-pa-lg">
                  <div class="text-h5 text-weight-bold">Visite nossa loja</div>
                  <div class="text-body1 text-grey-7 q-mt-md">
                    {{ fullAddress || 'O endereço da loja ainda não foi informado.' }}
                  </div>
                  <div v-if="store.phone" class="text-body1 text-grey-7 q-mt-sm">
                    <q-icon name="mdi-phone-outline" class="q-mr-xs" />
                    {{ phoneFormat(store.phone) }}
                  </div>
                </q-card-section>
                <q-card-actions v-if="googleMapsUrl || wazeUrl" class="q-px-md q-pb-md">
                  <q-btn
                    v-if="googleMapsUrl"
                    color="primary"
                    unelevated
                    no-caps
                    icon="mdi-google-maps"
                    label="Google Maps"
                    :href="googleMapsUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                  <q-btn
                    v-if="wazeUrl"
                    outline
                    color="primary"
                    no-caps
                    icon="mdi-navigation-variant"
                    label="Waze"
                    :href="wazeUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                </q-card-actions>
              </q-card>
            </div>

            <div v-if="mapEmbedUrl" class="col-12 col-md-7">
              <q-card flat bordered class="map-card">
                <iframe
                  :src="mapEmbedUrl"
                  title="Localização da loja no OpenStreetMap"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  class="store-map"
                />
              </q-card>
            </div>
          </div>
        </section>

        <section class="store-links-section row q-col-gutter-md q-mt-xl">
          <div class="col-12 col-sm-6">
            <q-card flat bordered class="full-height border-radius">
              <q-card-section class="row items-center no-wrap">
                <q-avatar color="primary" text-color="white" size="52px">
                  <q-icon name="mdi-content-cut" />
                </q-avatar>
                <div class="q-ml-md col">
                  <div class="text-h6 text-weight-bold">Nossos serviços</div>
                  <div class="text-body2 text-grey-7">Veja opções, valores e duração.</div>
                </div>
                <q-btn flat round color="primary" icon="mdi-arrow-right" :to="servicesPath" />
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6">
            <q-card flat bordered class="full-height border-radius">
              <q-card-section class="row items-center no-wrap">
                <q-avatar color="primary" text-color="white" size="52px">
                  <q-icon name="mdi-account-group-outline" />
                </q-avatar>
                <div class="q-ml-md col">
                  <div class="text-h6 text-weight-bold">Nossa equipe</div>
                  <div class="text-body2 text-grey-7">Conheça nossos profissionais.</div>
                </div>
                <q-btn flat round color="primary" icon="mdi-arrow-right" :to="professionalsPath" />
              </q-card-section>
            </q-card>
          </div>
        </section>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'

interface StoreTheme {
  id?: string
  storeId?: string
  logoUrl?: string | null
  bannerImages?: string[]
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

const storeSlug = computed(() => String(route.params.slug ?? ''))
const storePath = computed(
  () => `/public/stores/${encodeURIComponent(storeSlug.value)}`,
)
const bookingLink = computed(() => `${storePath.value}/booking`)
const servicesPath = computed(() => `${storePath.value}/services`)
const professionalsPath = computed(
  () => `${storePath.value}/professionals`,
)
const activeSlide = ref(0)
const bannerImages = computed(
  () => store.value?.theme?.bannerImages ?? [],
)

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

const mapCoordinates = computed(() => {
  if (!store.value) return null
  const { latitude, longitude } = store.value

  return latitude != null && longitude != null
    ? { latitude, longitude }
    : null
})

const googleMapsUrl = computed(() => {
  if (!store.value) return ''

  if (mapCoordinates.value) {
    const { latitude, longitude } = mapCoordinates.value
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
  }

  if (fullAddress.value) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress.value)}`
  }

  return ''
})

const wazeUrl = computed(() => {
  if (mapCoordinates.value) {
    const { latitude, longitude } = mapCoordinates.value
    return `https://waze.com/ul?ll=${latitude}%2C${longitude}&navigate=yes`
  }

  return fullAddress.value
    ? `https://waze.com/ul?q=${encodeURIComponent(fullAddress.value)}&navigate=yes`
    : ''
})

const mapsUrl = googleMapsUrl

const mapEmbedUrl = computed(() => {
  if (!mapCoordinates.value) return ''

  const { latitude, longitude } = mapCoordinates.value
  const offset = 0.006
  const params = new URLSearchParams({
    bbox: [
      longitude - offset,
      latitude - offset,
      longitude + offset,
      latitude + offset,
    ].join(','),
    layer: 'mapnik',
    marker: `${latitude},${longitude}`,
  })

  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`
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
.store-container {
  width: min(100%, 1080px);
  margin: 0 auto;
}

.storefront-carousel {
  height: clamp(340px, 52vw, 560px);
  border-radius: 20px;
  background: #242020;
}

.storefront-slide {
  padding: 0;
}

.storefront-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: clamp(24px, 6vw, 64px);
  background: linear-gradient(
    90deg,
    rgb(0 0 0 / 72%) 0%,
    rgb(0 0 0 / 45%) 55%,
    rgb(0 0 0 / 10%) 100%
  );
}

.storefront-copy {
  min-width: 0;
  width: min(100%, 680px);
}

.storefront-description {
  max-width: 560px;
  color: white;
  line-height: 1.7;
}

.storefront-fallback {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 400px);
  min-height: 360px;
  align-items: center;
  gap: 32px;
  border-radius: 20px;
  background: linear-gradient(
    110deg,
    color-mix(in srgb, var(--store-primary) 7%, white),
    color-mix(in srgb, var(--store-accent) 4%, white)
  );
}

.map-card {
  overflow: hidden;
  height: 100%;
  min-height: 300px;
  border-radius: 16px;
}

.store-map {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 300px;
  border: 0;
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
  width: 100%;
  height: 100%;
}

.store-logo-wrap {
  justify-self: center;
  height: clamp(320px, 32vw, 400px);
}

.store-logo-wrap :deep(img) {
  object-fit: contain;
}

@media (max-width: 599px) {
  .storefront-fallback {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  .store-logo-wrap {
    grid-row: 1;
    height: 260px;
  }

  .storefront-copy {
    grid-row: 2;
  }

  .storefront-overlay {
    padding: 24px;
  }

  .store-title {
    font-size: 2rem;
    line-height: 1.15;
  }
}
</style>
