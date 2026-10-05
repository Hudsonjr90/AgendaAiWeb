<template>
  <q-page
    class="global-home wrapper q-px-md q-px-lg-xl"
    aria-label="Página inicial do AgendaAi"
  >
    <section class="hero-section">
      <div class="hero-content wrapper q-px-sm q-px-lg-xl">
        <div class="hero-brand">
          <q-img
            src="/banner.png"
            alt="AgendaAi App — agende, organize e evolua"
            class="hero-brand-image"
            fit="contain"
          />
        </div>

        <q-carousel
          v-model="activeAudienceSlide"
          animated
          swipeable
          infinite
          :autoplay="7000"
          transition-prev="slide-right"
          transition-next="slide-left"
          class="audience-carousel bg-transparent"
          aria-label="Destaques para clientes e empresas"
        >
          <!-- CLIENTES -->
          <q-carousel-slide
            name="customers"
            class="audience-slide q-pa-none"
            aria-label="Soluções para clientes"
          >
            <div class="audience-content">
              <div class="audience-copy">
                <q-badge
                  color="orange-1"
                  text-color="deep-orange-10"
                  class="q-px-md q-py-sm"
                >
                  Para clientes
                </q-badge>

                <h1
                  class="text-h2 text-weight-bolder q-mt-lg q-mb-md"
                >
                  Seu próximo horário começa aqui.
                </h1>

                <p
                  class="text-h6 text-grey-7 text-weight-regular q-mb-lg"
                >
                  Encontre estabelecimentos, consulte serviços e
                  solicite seu agendamento online, no seu tempo.
                </p>

                <div
                  class="row items-center q-gutter-sm audience-actions"
                >
                  <q-btn
                    color="primary"
                    unelevated
                    rounded
                    no-caps
                    size="md"
                    icon="mdi-store-search-outline"
                    label="Encontrar loja"
                    href="#buscar"
                  />

                  <q-btn
                    outline
                    rounded
                    no-caps
                    size="md"
                    color="primary"
                    label="Acessar minha conta"
                    to="/customer/login"
                  />
                </div>

                <div
                  class="row items-center q-gutter-sm q-mt-md audience-highlights"
                >
                  <q-chip
                    color="white"
                    text-color="dark"
                    icon="mdi-content-cut"
                  >
                    Consulte serviços
                  </q-chip>

                  <q-chip
                    color="white"
                    text-color="dark"
                    icon="mdi-calendar-check-outline"
                  >
                    Peça seu horário online
                  </q-chip>
                </div>
              </div>

              <!-- VISUAL CLIENTE -->
              <div
                class="audience-visual customer-visual"
                aria-hidden="true"
              >
                <div class="hero-orbit orbit-one" />
                <div class="hero-orbit orbit-two" />

                <q-card flat class="hero-calendar-card-customer">
                  <q-card-section class="customer-card-header">
                    <div class="customer-main-icon">
                      <q-icon
                        name="mdi-calendar-check-outline"
                        size="30px"
                      />
                    </div>

                    <div class="customer-card-copy">
                      <div
                        class="text-subtitle1 text-weight-bold"
                      >
                        Um horário para você
                      </div>

                      <div class="text-body2 text-grey-7">
                        Escolha serviço e profissional
                      </div>
                    </div>
                  </q-card-section>

                  <q-separator />

                  <q-card-section class="customer-benefits">
                    <div
                      class="customer-benefit customer-benefit-time"
                    >
                      <div class="customer-benefit-icon">
                        <q-icon
                          name="mdi-clock-outline"
                          size="20px"
                        />
                      </div>

                      <span>No seu tempo</span>
                    </div>

                    <div
                      class="customer-benefit customer-benefit-online"
                    >
                      <div class="customer-benefit-icon">
                        <q-icon
                          name="mdi-check-circle-outline"
                          size="20px"
                        />
                      </div>

                      <span>Online</span>
                    </div>
                  </q-card-section>
                </q-card>

                <div
                  class="customer-floating-icon customer-floating-store"
                >
                  <q-icon
                    name="mdi-storefront-outline"
                    size="25px"
                  />
                </div>

                <div
                  class="customer-floating-icon customer-floating-clock"
                >
                  <q-icon
                    name="mdi-clock-time-four-outline"
                    size="24px"
                  />
                </div>
              </div>
            </div>
          </q-carousel-slide>

          <!-- EMPRESAS -->
          <q-carousel-slide
            name="business"
            class="audience-slide q-pa-none"
            aria-label="Soluções para empresas"
          >
            <div
              class="audience-content audience-content-business"
            >
              <div class="audience-copy">
                <q-badge
                  color="deep-purple-1"
                  text-color="deep-purple-10"
                  class="q-px-md q-py-sm"
                >
                  Para empresas
                </q-badge>

                <h2
                  class="text-h2 text-weight-bolder q-mt-lg q-mb-md"
                >
                  Sua agenda pronta para crescer.
                </h2>

                <p
                  class="text-h6 text-grey-7 text-weight-regular q-mb-lg"
                >
                  Organize lojas, equipe, serviços e horários em um
                  só lugar e facilite os agendamentos dos seus
                  clientes.
                </p>

                <div
                  class="row items-center q-gutter-sm audience-actions"
                >
                  <q-btn
                    color="primary"
                    unelevated
                    rounded
                    no-caps
                    size="md"
                    icon="mdi-domain"
                    label="Criar conta da empresa"
                    to="/auth/register"
                  />

                  <q-btn
                    outline
                    rounded
                    no-caps
                    size="md"
                    color="primary"
                    label="Já tenho uma conta"
                    to="/auth/login"
                  />
                </div>

                <div
                  class="row items-center q-gutter-sm q-mt-md audience-highlights"
                >
                  <q-chip
                    color="white"
                    text-color="dark"
                    icon="mdi-account-group-outline"
                  >
                    Gerencie sua equipe
                  </q-chip>

                  <q-chip
                    color="white"
                    text-color="dark"
                    icon="mdi-view-dashboard-outline"
                  >
                    Acompanhe sua operação
                  </q-chip>
                </div>
              </div>

              <div
                class="audience-visual business-visual"
                aria-hidden="true"
              >
                <div class="hero-orbit orbit-one" />
                <div class="hero-orbit orbit-two" />

                <q-card
                  flat
                  class="hero-calendar-card business-dashboard"
                >
                  <q-card-section>
                    <div
                      class="row items-center justify-between"
                    >
                      <div>
                        <div class="text-overline text-primary">
                          Painel do estabelecimento
                        </div>

                        <div class="text-h6 text-weight-bold">
                          Sua operação em dia
                        </div>
                      </div>

                      <q-avatar
                        color="deep-purple-1"
                        text-color="deep-purple-10"
                      >
                        <q-icon
                          name="mdi-view-dashboard-outline"
                        />
                      </q-avatar>
                    </div>
                  </q-card-section>

                  <q-separator />

                  <q-card-section
                    class="column q-gutter-sm"
                  >
                    <div class="dashboard-item">
                      <q-icon
                        name="mdi-store-outline"
                        color="primary"
                      />

                      <span>
                        Lojas e identidade visual
                      </span>

                      <q-icon
                        name="mdi-check-circle"
                        color="positive"
                      />
                    </div>

                    <div class="dashboard-item">
                      <q-icon
                        name="mdi-account-group-outline"
                        color="primary"
                      />

                      <span>
                        Equipe e serviços
                      </span>

                      <q-icon
                        name="mdi-check-circle"
                        color="positive"
                      />
                    </div>

                    <div class="dashboard-item">
                      <q-icon
                        name="mdi-calendar-clock-outline"
                        color="primary"
                      />

                      <span>
                        Agenda e solicitações
                      </span>

                      <q-icon
                        name="mdi-check-circle"
                        color="positive"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-carousel-slide>
        </q-carousel>
      </div>
    </section>

    <section
      id="buscar"
      class="search-section q-px-md q-px-lg-xl"
    >
      <div class="search-card wrapper">
        <div class="row items-center q-col-gutter-xl">
          <div class="col-12 col-md-5">
            <div
              class="text-overline text-primary text-weight-bold"
            >
              Comece por aqui
            </div>

            <h2
              class="text-h4 text-weight-bold q-mt-xs q-mb-sm"
            >
              Encontre seu estabelecimento
            </h2>

            <p class="text-body1 text-grey-7 q-mb-none">
              Pesquise pelo nome do estabelecimento e acesse sua
              página pública para consultar os serviços disponíveis.
            </p>
          </div>

          <div class="col-12 col-md-7">
            <q-form
              class="row items-start q-col-gutter-sm"
              @submit.prevent="findStore"
            >
              <div class="col">
                <q-input
                  v-model.trim="storeQuery"
                  outlined
                  rounded
                  clearable
                  maxlength="100"
                  label="Nome da loja"
                  placeholder="Ex.: Barbearia Central"
                  hint="Também é possível pesquisar pelo identificador público."
                  :disable="loading"
                  :rules="[
                    (value) =>
                      (value?.trim().length ?? 0) >= 2 ||
                      'Digite ao menos 2 caracteres.',
                  ]"
                  aria-label="Nome ou identificador público do estabelecimento"
                >
                  <template #prepend>
                    <q-icon
                      name="mdi-store-search-outline"
                    />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-sm-auto">
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  rounded
                  no-caps
                  size="lg"
                  label="Buscar"
                  icon-right="mdi-arrow-right"
                  :loading="loading"
                  class="search-button"
                />
              </div>
            </q-form>

            <div
              v-if="loading"
              class="row items-center q-gutter-sm q-mt-md"
              aria-live="polite"
            >
              <q-spinner
                color="primary"
                size="24px"
              />

              <span class="text-body2 text-grey-7">
                Buscando estabelecimentos...
              </span>
            </div>

            <div
              v-else-if="searchPerformed && stores.length"
              class="row q-col-gutter-md q-mt-sm"
              aria-live="polite"
            >
              <div
                v-for="store in stores"
                :key="store.publicSlug"
                class="col-12 col-sm-6"
              >
                <q-card
                  flat
                  bordered
                  class="found-store-card full-height"
                >
                  <q-card-section
                    class="row items-center no-wrap q-gutter-md"
                  >
                    <q-avatar
                      rounded
                      color="orange-1"
                      text-color="primary"
                      size="52px"
                    >
                      <q-img
                        v-if="store.logoUrl"
                        :src="store.logoUrl"
                        :alt="`Logo de ${store.name}`"
                        fit="contain"
                      />

                      <q-icon
                        v-else
                        name="mdi-storefront-outline"
                      />
                    </q-avatar>

                    <div class="col">
                      <div
                        class="text-subtitle1 text-weight-bold"
                      >
                        {{ store.name }}
                      </div>

                      <div
                        v-if="storeLocation(store)"
                        class="text-body2 text-grey-7"
                      >
                        {{ storeLocation(store) }}
                      </div>

                      <div
                        v-if="store.description"
                        class="text-body2 text-grey-7 q-mt-xs"
                      >
                        {{ store.description }}
                      </div>
                    </div>
                  </q-card-section>

                  <q-card-actions
                    align="right"
                    class="q-px-md q-pb-md"
                  >
                    <q-btn
                      color="primary"
                      unelevated
                      rounded
                      no-caps
                      label="Acessar estabelecimento"
                      :to="storePage(store.publicSlug)"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>

            <q-card
              v-else-if="searchPerformed"
              flat
              bordered
              class="q-mt-md"
              aria-live="polite"
            >
              <q-card-section
                class="row items-center no-wrap q-gutter-md"
              >
                <q-avatar
                  color="grey-2"
                  text-color="grey-7"
                >
                  <q-icon
                    name="mdi-store-off-outline"
                  />
                </q-avatar>

                <div>
                  <div
                    class="text-subtitle1 text-weight-medium"
                  >
                    Nenhum estabelecimento ativo encontrado.
                  </div>

                  <div class="text-body2 text-grey-7">
                    Confira o nome ou identificador e tente
                    novamente.
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { getErrorMessage } from '~/utils/global'

definePageMeta({
  layout: 'main-layout',
})

const publicStores = usePublicStores()
const $q = useQuasar()

const activeAudienceSlide = ref('customers')
const storeQuery = ref('')
const loading = ref(false)
const searchPerformed = ref(false)

const stores = ref<
  Awaited<ReturnType<typeof publicStores.search>>
>([])

const ogImage = ref('/favicon.png')

function storePage(slug: string) {
  return `/public/stores/${encodeURIComponent(slug)}/home`
}

function storeLocation(
  store: (typeof stores.value)[number],
) {
  return [store.city, store.state]
    .filter(Boolean)
    .join(', ')
}

async function findStore() {
  const query = storeQuery.value.trim()

  if (query.length < 2 || loading.value) {
    return
  }

  loading.value = true
  searchPerformed.value = false
  stores.value = []

  try {
    stores.value = await publicStores.search(query)
    searchPerformed.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível buscar estabelecimentos. Tente novamente.',
      ),
    })
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'AgendaAi | Agendamento online',

  meta: [
    {
      name: 'description',
      content:
        'Para empresas e clientes: encontre estabelecimentos, consulte serviços e solicite seu próximo agendamento online.',
    },
    {
      property: 'og:title',
      content: 'AgendaAi | Agendamento online',
    },
    {
      property: 'og:description',
      content:
        'Para empresas e clientes: encontre estabelecimentos, consulte serviços e solicite seu próximo agendamento online.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:image',
      content: ogImage.value,
    },
    {
      property: 'og:width',
      content: '1200',
    },
    {
      property: 'og:height',
      content: '630',
    },
  ],
})
</script>

<style scoped>
.global-home {
  color: #272321;
}

.hero-section {
  overflow: hidden;
}

.hero-content {
  padding-top: 32px;
  padding-bottom: 32px;
}

.hero-brand {
  display: flex;
  justify-content: center;
}

.hero-brand-image {
  width: min(100%, 800px);
  height: 100%;
}

.hero-brand-image-footer {
  width: min(100%, 500px);
  height: 100%;
  margin-top: 16px;
  margin-bottom: 16px;
}

/* CAROUSEL */

.audience-carousel {
  height: 580px;
  border-radius: 24px;
}

.audience-slide {
  padding: 28px 64px 52px;
}

.audience-content {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns:
    minmax(0, 1.05fr)
    minmax(300px, 0.95fr);
  align-items: center;
  gap: 36px;
}

.audience-content-business {
  padding: 24px;
  border-radius: 20px;
}

.audience-copy {
  max-width: 680px;
}

.audience-copy h1,
.audience-copy h2 {
  max-width: 660px;
  font-size: clamp(2.5rem, 4vw, 3.25rem);
  line-height: 1.08;
  letter-spacing: -0.035em;
}

.audience-copy > p {
  max-width: 600px;
  font-size: 1.15rem;
  line-height: 1.65;
}

/* VISUAL */

.audience-visual {
  position: relative;
  display: grid;
  min-height: 340px;
  place-items: center;
}

.business-visual .hero-orbit {
  border-color: rgb(117 67 185 / 14%);
}

.hero-calendar-card,
.hero-calendar-card-customer {
  position: relative;
  z-index: 2;
  width: min(100%, 420px);
  overflow: hidden;
  border: 1px solid rgb(75 62 47 / 8%);
  border-radius: 22px;
  background: #fff;
  box-shadow:
    0 24px 80px rgb(75 62 47 / 12%);
}

/* CARD CLIENTE */

.customer-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px;
}

.customer-main-icon {
  display: grid;
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
  place-items: center;
  border-radius: 18px;
  background:
    linear-gradient(
      145deg,
      #6c2cff,
      #7b35ff
    );
  color: #fff;
  box-shadow:
    0 12px 28px rgb(108 44 255 / 24%);
}

.customer-card-copy {
  min-width: 0;
}

.customer-benefits {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
}

.customer-benefit {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 8px;
  padding: 7px 13px 7px 8px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 500;
}

.customer-benefit-icon {
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  place-items: center;
  border-radius: 50%;
  background: rgb(255 255 255 / 75%);
}

.customer-benefit-time {
  background: #fff3df;
  color: #c84b00;
}

.customer-benefit-online {
  background: #eaf7ec;
  color: #08772d;
}

.customer-floating-icon {
  position: absolute;
  z-index: 3;
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border: 1px solid rgb(108 44 255 / 10%);
  border-radius: 18px;
  background: #fff;
  box-shadow:
    0 16px 38px rgb(75 62 47 / 13%);
}

.customer-floating-store {
  top: 26px;
  left: 5%;
  color: #6c2cff;
}

.customer-floating-clock {
  right: 2%;
  bottom: 30px;
  color: #f07c00;
}

/* EMPRESA */

.business-dashboard {
  width: min(100%, 440px);
}

.dashboard-item {
  display: grid;
  grid-template-columns:
    24px
    minmax(0, 1fr)
    20px;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: #faf8ff;
  font-size: 0.9rem;
}

/* ÓRBITAS */

.hero-orbit {
  position: absolute;
  border: 1px solid rgb(240 146 34 / 18%);
  border-radius: 50%;
}

.orbit-one {
  width: 330px;
  height: 330px;
}

.orbit-two {
  width: 440px;
  height: 440px;
}

/* BUSCA */

.search-section {
  scroll-margin-top: 88px;
  padding-top: 40px;
  margin-bottom: 40px;
}

.search-card {
  padding: clamp(24px, 5vw, 52px);
  border: 1px solid #eee8df;
  border-radius: 24px;
  background: #fff;
  box-shadow:
    0 20px 60px rgb(58 44 27 / 7%);
}

.search-button {
  min-height: 56px;
}

.found-store-card {
  border-radius: 14px;
}

/* TABLET */

@media (max-width: 899px) {
  .audience-carousel {
    height: 720px;
  }

  .audience-slide {
    padding-right: 52px;
    padding-left: 52px;
  }

  .audience-content {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows:
      minmax(0, 1fr)
      240px;
    gap: 8px;
  }

  .audience-copy {
    max-width: 760px;
  }

  .audience-visual {
    min-height: 240px;
  }

  .orbit-one {
    width: 240px;
    height: 240px;
  }

  .orbit-two {
    width: 300px;
    height: 300px;
  }
}

/* MOBILE */

@media (max-width: 599px) {
  .hero-content {
    padding-top: 10px;
    padding-bottom: 16px;
  }

  .hero-brand {
    margin-bottom: 2px;
  }

  /*
   * Logo maior no mobile.
   * Antes: 180px / 128px.
   */
  .hero-brand-image {
    width: min(100%, 420px);
    height: 260px;
  }

  .audience-carousel {
    height: 650px;
    border-radius: 18px;
  }

  .audience-slide {
    padding: 12px 16px 30px;
  }

  .audience-content {
    grid-template-rows:
      minmax(0, 1fr)
      220px;
    gap: 4px;
  }

  .audience-content-business {
    padding: 12px;
  }

  .audience-copy h1,
  .audience-copy h2 {
    margin-top: 16px;
    font-size: 2rem;
  }

  .audience-copy > p {
    margin-bottom: 16px;
    font-size: 0.95rem;
  }

  .audience-actions {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
  }

  .audience-actions .q-btn {
    width: 100%;
  }

  .audience-highlights {
    display: none;
  }

  .audience-visual {
    min-height: 220px;
  }

  /*
   * Card de cliente.
   */

  .hero-calendar-card {
    width: min(100%, 330px);
    margin-top: 32px;
  }

  .hero-calendar-card-customer {
    width: min(100%, 300px);
  }

  .customer-card-header {
    gap: 12px;
    padding: 15px 16px;
  }

  .customer-main-icon {
    width: 48px;
    height: 48px;
    flex-basis: 48px;
    border-radius: 15px;
  }

  .customer-card-copy .text-subtitle1 {
    font-size: 0.95rem;
    line-height: 1.3;
  }

  .customer-card-copy .text-body2 {
    margin-top: 3px;
    font-size: 0.8rem;
    line-height: 1.35;
  }

  .customer-benefits {
    gap: 7px;
    padding: 10px 12px;
  }

  .customer-benefit {
    min-height: 36px;
    gap: 5px;
    padding: 5px 10px 5px 5px;
    font-size: 0.76rem;
  }

  .customer-benefit-icon {
    width: 25px;
    height: 25px;
    flex-basis: 25px;
  }

  .customer-floating-icon {
    width: 44px;
    height: 44px;
    border-radius: 15px;
  }

  .customer-floating-store {
    top: 12px;
    left: 1px;
  }

  .customer-floating-clock {
    right: 0;
    bottom: 16px;
  }

  /*
   * Dashboard empresa.
   */

  .business-dashboard .text-overline {
    font-size: 0.65rem;
  }

  .business-dashboard .text-h6 {
    font-size: 1rem;
  }

  .dashboard-item {
    gap: 6px;
    padding: 8px;
    font-size: 0.75rem;
  }

  .orbit-one {
    display: none;
  }

  .orbit-two {
  display: none;
  }

  .search-button {
    width: 100%;
  }
}
</style>