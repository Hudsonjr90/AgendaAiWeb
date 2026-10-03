
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
      <section id="inicio" class="store-hero">
        <div
          class="row items-center q-col-gutter-xl q-px-md q-px-lg-xl q-py-xl store-container"
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
            <div class="store-visual q-pa-lg">
              <q-avatar
                v-if="store.theme?.logoUrl"
                size="112px"
                class="store-visual-logo"
              >
                <img
                  :src="store.theme.logoUrl"
                  :alt="`Logo ${store.name}`"
                />
              </q-avatar>

              <q-avatar
                v-else
                size="112px"
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

              <div class="store-visual-accent q-mt-md" />
            </div>
          </div>
        </div>
      </section>

      <!-- Informações -->
      <section
        id="informacoes"
        class="q-px-md q-px-lg-xl q-py-xl store-container"
      >
        <div class="text-center q-mb-xl">
          <div class="text-overline text-primary text-weight-bold">
            ENCONTRE-NOS
          </div>

          <h2 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
            Estamos esperando por você
          </h2>

          <p class="text-body2 text-grey-7 q-mx-auto store-section-description">
            Confira as informações da nossa loja e entre em contato sempre que
            precisar.
          </p>
        </div>

        <div class="row q-col-gutter-md">
          <!-- Endereço -->
          <div class="col-12 col-md-4">
            <q-card flat bordered class="full-height store-info-card">
              <q-card-section>
                <q-avatar
                  color="primary"
                  :text-color="primaryTextColor"
                  size="48px"
                >
                  <q-icon name="mdi-map-marker-outline" size="26px" />
                </q-avatar>

                <div class="text-subtitle1 text-weight-bold q-mt-md">
                  Nosso endereço
                </div>

                <p class="text-body2 text-grey-7 q-mt-sm q-mb-sm">
                  {{ fullAddress || 'Endereço não informado.' }}
                </p>

                <q-btn
                  v-if="mapsUrl"
                  flat
                  dense
                  no-caps
                  color="primary"
                  icon-right="mdi-open-in-new"
                  label="Ver no mapa"
                  :href="mapsUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Contato -->
          <div class="col-12 col-md-4">
            <q-card flat bordered class="full-height store-info-card">
              <q-card-section>
                <q-avatar
                  color="primary"
                  :text-color="primaryTextColor"
                  size="48px"
                >
                  <q-icon name="mdi-whatsapp" size="26px" />
                </q-avatar>

                <div class="text-subtitle1 text-weight-bold q-mt-md">
                  Fale conosco
                </div>

                <p class="text-body2 text-grey-7 q-mt-sm q-mb-sm">
                  {{ store.phone || 'Telefone não informado.' }}
                </p>

                <q-btn
                  v-if="store.phone"
                  flat
                  dense
                  no-caps
                  color="primary"
                  icon-right="mdi-whatsapp"
                  label="Entrar em contato"
                  :href="phoneUrl"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Identidade visual -->
          <div class="col-12 col-md-4">
            <q-card flat bordered class="full-height store-info-card">
              <q-card-section>
                <q-avatar
                  color="primary"
                  :text-color="primaryTextColor"
                  size="48px"
                >
                  <q-icon name="mdi-palette-outline" size="26px" />
                </q-avatar>

                <div class="text-subtitle1 text-weight-bold q-mt-md">
                  Nossa identidade
                </div>

                <p class="text-body2 text-grey-7 q-mt-sm q-mb-md">
                  Uma experiência com a identidade visual da nossa loja.
                </p>

                <div class="row items-center q-gutter-sm">
                  <q-avatar
                    size="24px"
                    :style="{ backgroundColor: theme.primaryColor }"
                  />
                  <q-avatar
                    size="24px"
                    :style="{ backgroundColor: theme.secondaryColor }"
                  />
                  <q-avatar
                    size="24px"
                    :style="{ backgroundColor: theme.accentColor }"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </section>

      <!-- Prévia do agendamento -->
      <section
        id="agendamento"
        class="q-px-md q-px-lg-xl q-pb-xl store-container"
      >
        <q-card flat class="store-booking-card">
          <q-card-section class="row items-center q-col-gutter-md">
            <div class="col-auto">
              <q-avatar
                color="white"
                text-color="primary"
                size="56px"
              >
                <q-icon name="mdi-calendar-clock-outline" size="30px" />
              </q-avatar>
            </div>

            <div class="col">
              <div class="text-h6 text-weight-bold">
                Agendamento online
              </div>

              <p class="text-body2 q-mt-xs q-mb-none">
                Em breve você poderá conferir nossos serviços, escolher um
                profissional e agendar seu horário por aqui.
              </p>
            </div>

            <div class="col-12 col-sm-auto">
              <q-badge
                color="primary"
                :text-color="primaryTextColor"
                rounded
                class="q-px-md q-py-sm"
                label="Em breve"
              />
            </div>
          </q-card-section>
        </q-card>
      </section>

      <!-- Rodapé -->
      <q-separator />

      <footer
        class="row items-center justify-between q-py-lg q-px-md q-px-lg-xl store-container"
      >
        <div class="column">
          <span class="text-subtitle2 text-weight-bold">
            {{ store.name }}
          </span>

          <span class="text-caption text-grey-7">
            Uma experiência feita para você.
          </span>
        </div>

        <div class="text-caption text-grey-7">
          Desenvolvido com
          <strong class="text-primary">AgendaAi</strong>
        </div>
      </footer>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { CSSProperties } from 'vue'

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

const storeSlug = computed(() => String(route.params.slug ?? ''))

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

const storeHeader = useState<PublicStoreHeader>(
  'public-store-header',
  () => ({
    name: '',
    logoUrl: null,
    ...defaultTheme,
  }),
)

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
    value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4

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
.public-store {
  min-height: 100vh;
  color: #2b2726;
  background: #ffffff;
}

.store-container {
  width: min(100%, 1200px);
  margin-right: auto;
  margin-left: auto;
}

.store-hero {
  background:
    linear-gradient(
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

.store-visual {
  display: flex;
  width: min(100%, 310px);
  min-height: 280px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  background: #ffffff;
  box-shadow:
    0 20px 55px
    color-mix(in srgb, var(--store-primary) 13%, transparent);
}

.store-visual-logo {
  overflow: hidden;
  width: 112px;
  height: 112px;
  border-radius: 50%;
}

.store-visual-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.store-visual-accent {
  width: 42px;
  height: 4px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    var(--store-primary),
    var(--store-accent)
  );
}

.store-section-description {
  max-width: 620px;
}

.store-info-card {
  border-radius: 16px;
  transition:
    box-shadow 180ms ease,
    transform 180ms ease;
}

.store-info-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.07);
}

.store-booking-card {
  border: 1px solid
    color-mix(in srgb, var(--store-primary) 14%, white);
  border-radius: 20px;
  color: #2b2726;
  background: linear-gradient(
    110deg,
    color-mix(in srgb, var(--store-primary) 7%, white),
    color-mix(in srgb, var(--store-accent) 4%, white)
  );
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
