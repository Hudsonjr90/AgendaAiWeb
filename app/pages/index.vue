<template>
  <q-page class="global-home">
    <section class="hero-section">
      <div class="hero-content wrapper q-px-md q-px-lg-xl">
        <div class="hero-copy">
          <q-badge
            color="orange-1"
            text-color="deep-orange-10"
            class="q-px-md q-py-sm"
          >
            Agendamento online, sem complicação
          </q-badge>
          <h1 class="text-h2 text-weight-bolder q-mt-lg q-mb-md">
            Seu próximo agendamento começa aqui.
          </h1>
          <p class="text-h6 text-grey-7 text-weight-regular q-mb-xl">
            Encontre estabelecimentos, conheça os serviços disponíveis e agende
            seu horário de forma simples, rápida e online.
          </p>
          <div class="row items-center q-gutter-sm">
            <q-btn
              color="primary"
              unelevated
              rounded
              no-caps
              size="lg"
              icon="mdi-store-search-outline"
              label="Encontrar loja"
              href="#buscar"
            />
            <q-btn
              flat
              rounded
              no-caps
              size="lg"
              color="dark"
              label="Como funciona"
              href="#como-funciona"
            />
          </div>
        </div>

        <div class="hero-illustration" aria-hidden="true">
          <div class="hero-orbit orbit-one" />
          <div class="hero-orbit orbit-two" />
          <q-card flat class="hero-calendar-card">
            <q-card-section class="row items-center no-wrap q-gutter-md">
              <q-avatar color="primary" text-color="white" size="58px">
                <q-icon name="mdi-calendar-check-outline" size="32px" />
              </q-avatar>
              <div>
                <div class="text-subtitle1 text-weight-bold">
                  Um horário para você
                </div>
                <div class="text-body2 text-grey-7">
                  Escolha serviço e profissional
                </div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="row items-center q-gutter-sm">
              <q-chip
                color="orange-1"
                text-color="deep-orange-10"
                icon="mdi-clock-outline"
              >
                No seu tempo
              </q-chip>
              <q-chip
                color="green-1"
                text-color="green-10"
                icon="mdi-check-circle-outline"
              >
                Online
              </q-chip>
            </q-card-section>
          </q-card>
          <q-avatar
            class="hero-small-icon hero-small-icon-store"
            color="white"
            text-color="primary"
          >
            <q-icon name="mdi-storefront-outline" />
          </q-avatar>
          <q-avatar
            class="hero-small-icon hero-small-icon-clock"
            color="white"
            text-color="orange-8"
          >
            <q-icon name="mdi-clock-time-four-outline" />
          </q-avatar>
        </div>
      </div>
    </section>

    <section id="buscar" class="search-section q-px-md q-px-lg-xl">
      <div class="search-card wrapper">
        <div class="row items-center q-col-gutter-xl">
          <div class="col-12 col-md-5">
            <div class="text-overline text-primary text-weight-bold">
              Comece por aqui
            </div>
            <h2 class="text-h4 text-weight-bold q-mt-xs q-mb-sm">
              Encontre seu estabelecimento
            </h2>
            <p class="text-body1 text-grey-7 q-mb-none">
              Pesquise pelo nome do estabelecimento e acesse sua página
              pública para consultar os serviços disponíveis.
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
                    <q-icon name="mdi-store-search-outline" />
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
              <q-spinner color="primary" size="24px" />
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
                <q-card flat bordered class="found-store-card full-height">
                  <q-card-section class="row items-center no-wrap q-gutter-md">
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
                      <q-icon v-else name="mdi-storefront-outline" />
                    </q-avatar>
                    <div class="col">
                      <div class="text-subtitle1 text-weight-bold">
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
                  <q-card-actions align="right" class="q-px-md q-pb-md">
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
              <q-card-section class="row items-center no-wrap q-gutter-md">
                <q-avatar color="grey-2" text-color="grey-7">
                  <q-icon name="mdi-store-off-outline" />
                </q-avatar>
                <div>
                  <div class="text-subtitle1 text-weight-medium">
                    Nenhum estabelecimento ativo encontrado.
                  </div>
                  <div class="text-body2 text-grey-7">
                    Confira o nome ou identificador e tente novamente.
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </section>

    <section
      id="como-funciona"
      class="steps-section wrapper q-px-md q-px-lg-xl"
    >
      <div class="section-heading">
        <div class="text-overline text-primary text-weight-bold">
          Simples assim
        </div>
        <h2 class="text-h4 text-weight-bold q-mt-xs q-mb-sm">Como funciona</h2>
        <p class="text-body1 text-grey-7">
          Do estabelecimento ao seu horário, em poucos passos.
        </p>
      </div>

      <div class="row q-col-gutter-md q-mt-md">
        <div
          v-for="step in steps"
          :key="step.number"
          class="col-12 col-sm-6 col-lg-3"
        >
          <q-card flat bordered class="step-card full-height">
            <q-card-section>
              <div class="row items-center justify-between">
                <q-avatar color="primary" text-color="white" size="48px">
                  <q-icon :name="step.icon" />
                </q-avatar>
                <span class="text-h4 text-weight-bolder step-number">
                  {{ step.number }}
                </span>
              </div>
              <div class="text-h6 text-weight-bold q-mt-lg">
                {{ step.title }}
              </div>
              <div class="text-body2 text-grey-7 q-mt-sm">
                {{ step.description }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <section id="beneficios" class="benefits-section q-px-md q-px-lg-xl">
      <div class="wrapper">
        <div class="row items-end justify-between q-col-gutter-md">
          <div class="col-12 col-md-7">
            <div class="text-overline text-primary text-weight-bold">
              Feito para facilitar
            </div>
            <h2 class="text-h4 text-weight-bold q-mt-xs q-mb-sm">
              Mais praticidade para organizar seu atendimento
            </h2>
          </div>
          <p class="col-12 col-md-5 text-body1 text-grey-7 q-mb-sm">
            Consulte as informações de cada estabelecimento e envie sua
            solicitação de agendamento online.
          </p>
        </div>

        <div class="row q-col-gutter-md q-mt-md">
          <div
            v-for="benefit in benefits"
            :key="benefit.title"
            class="col-12 col-sm-6 col-lg-3"
          >
            <div class="benefit-item">
              <q-avatar color="white" text-color="primary" size="52px">
                <q-icon :name="benefit.icon" size="26px" />
              </q-avatar>
              <div class="text-subtitle1 text-weight-bold q-mt-md">
                {{ benefit.title }}
              </div>
              <div class="text-body2 text-grey-7 q-mt-xs">
                {{ benefit.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      id="para-empresas"
      class="business-section q-px-md q-px-lg-xl"
    >
      <div class="wrapper">
        <div class="business-panel">
          <div class="row items-end justify-between q-col-gutter-lg">
            <div class="col-12 col-lg-7">
              <div class="text-overline text-orange-3 text-weight-bold">
                Para empresas
              </div>
              <h2 class="text-h4 text-weight-bold q-mt-xs q-mb-sm">
                Sua operação organizada. Sua agenda pronta para crescer.
              </h2>
            </div>
            <p class="col-12 col-lg-5 text-body1 business-intro q-mb-sm">
              Gerencie o dia a dia do seu estabelecimento em um painel e
              ofereça aos clientes uma forma simples de conhecer seus serviços
              e solicitar horários.
            </p>
          </div>

          <div class="row q-col-gutter-md q-mt-md">
            <div
              v-for="feature in businessFeatures"
              :key="feature.title"
              class="col-12 col-sm-6 col-lg-3"
            >
              <q-card flat class="business-card full-height">
                <q-card-section>
                  <q-avatar
                    color="white"
                    text-color="primary"
                    size="52px"
                  >
                    <q-icon :name="feature.icon" size="26px" />
                  </q-avatar>
                  <div class="text-h6 text-weight-bold q-mt-md">
                    {{ feature.title }}
                  </div>
                  <div class="text-body2 business-card-description q-mt-sm">
                    {{ feature.description }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div class="row items-center justify-between q-gutter-md q-mt-lg">
            <div class="text-body2 business-footnote">
              Você pode começar a configuração e continuar depois pelo painel.
            </div>
            <div class="row items-center q-gutter-sm">
              <q-btn
                flat
                rounded
                no-caps
                color="white"
                label="Já tenho uma conta"
                to="/auth/login"
              />
              <q-btn
                color="white"
                text-color="primary"
                unelevated
                rounded
                no-caps
                icon="mdi-domain"
                label="Criar conta da empresa"
                to="/auth/register"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="closing-section q-px-md q-px-lg-xl">
      <div class="closing-card wrapper text-center">
        <q-avatar color="white" text-color="primary" size="64px">
          <q-icon name="mdi-calendar-heart" size="34px" />
        </q-avatar>
        <h2 class="text-h4 text-weight-bold q-mt-md q-mb-sm">
          Pronto para escolher seu próximo horário?
        </h2>
        <p class="text-body1 q-mx-auto q-mb-lg closing-description">
          Acesse a página pública do estabelecimento e encontre os serviços
          certos para você.
        </p>
        <q-btn
          color="white"
          text-color="primary"
          unelevated
          rounded
          no-caps
          size="lg"
          icon="mdi-store-search-outline"
          label="Encontrar loja"
          href="#buscar"
        />
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
const storeQuery = ref('')
const loading = ref(false)
const searchPerformed = ref(false)
const stores = ref<Awaited<ReturnType<typeof publicStores.search>>>([])

const steps = [
  {
    number: '01',
    icon: 'mdi-store-search-outline',
    title: 'Encontre o estabelecimento',
    description: 'Acesse a página pública da loja onde deseja ser atendido.',
  },
  {
    number: '02',
    icon: 'mdi-content-cut',
    title: 'Escolha o serviço',
    description:
      'Consulte os serviços, valores e duração oferecidos por aquela loja.',
  },
  {
    number: '03',
    icon: 'mdi-account-clock-outline',
    title: 'Escolha profissional e horário',
    description:
      'Selecione um profissional compatível e informe o horário desejado.',
  },
  {
    number: '04',
    icon: 'mdi-calendar-check-outline',
    title: 'Envie sua solicitação',
    description:
      'Acompanhe os detalhes do agendamento na sua conta de cliente.',
  },
]

const benefits = [
  {
    icon: 'mdi-calendar-multiselect',
    title: 'Solicite online',
    description:
      'Envie seu pedido de agendamento sem precisar ligar para a loja.',
  },
  {
    icon: 'mdi-format-list-bulleted',
    title: 'Consulte os serviços',
    description:
      'Veja valores e duração dos serviços publicados por cada estabelecimento.',
  },
  {
    icon: 'mdi-account-check-outline',
    title: 'Encontre o profissional certo',
    description: 'Consulte profissionais e serviços disponíveis em cada loja.',
  },
  {
    icon: 'mdi-clipboard-text-clock-outline',
    title: 'Acompanhe sua solicitação',
    description:
      'Consulte os detalhes e o status dos seus agendamentos na conta do estabelecimento.',
  },
]

const businessFeatures = [
  {
    icon: 'mdi-store-cog-outline',
    title: 'Configure seu estabelecimento',
    description:
      'Cadastre uma ou mais lojas, seus dados e a identidade visual da página pública.',
  },
  {
    icon: 'mdi-account-group-outline',
    title: 'Organize equipe e serviços',
    description:
      'Cadastre profissionais, defina os serviços oferecidos e associe cada profissional ao que realiza.',
  },
  {
    icon: 'mdi-calendar-clock-outline',
    title: 'Defina a disponibilidade',
    description:
      'Configure os horários de atendimento de cada loja para orientar os pedidos de agendamento.',
  },
  {
    icon: 'mdi-view-dashboard-outline',
    title: 'Acompanhe sua operação',
    description:
      'Consulte agendamentos, clientes e indicadores no painel administrativo.',
  },
]

function storePage(slug: string) {
  return `/public/stores/${encodeURIComponent(slug)}/home`
}

function storeLocation(store: (typeof stores.value)[number]) {
  return [store.city, store.state].filter(Boolean).join(', ')
}

async function findStore() {
  const query = storeQuery.value.trim()
  if (query.length < 2 || loading.value) return

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
        'Encontre estabelecimentos, consulte serviços e solicite seu próximo agendamento online com o AgendaAi.',
    },
    { property: 'og:title', content: 'AgendaAi | Agendamento online' },
    {
      property: 'og:description',
      content:
        'Encontre estabelecimentos, consulte serviços e solicite seu próximo agendamento online.',
    },
    { property: 'og:type', content: 'website' },
  ],
})
</script>

<style scoped>
.global-home {
  color: #272321;
  background: white;
}

.hero-section {
  overflow: hidden;
  background:
    radial-gradient(circle at 78% 42%, rgb(255 183 77 / 20%), transparent 30%),
    linear-gradient(135deg, #fffaf3 0%, #fff 75%);
}

.hero-content {
  display: grid;
  min-height: 580px;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  align-items: center;
  gap: 48px;
  padding-top: 64px;
  padding-bottom: 64px;
}

.hero-copy {
  max-width: 680px;
}

.hero-copy h1 {
  max-width: 660px;
  line-height: 1.08;
  letter-spacing: -0.035em;
}

.hero-copy > p {
  max-width: 600px;
  line-height: 1.65;
}

.hero-illustration {
  position: relative;
  display: grid;
  min-height: 340px;
  place-items: center;
}

.hero-calendar-card {
  z-index: 1;
  width: min(100%, 420px);
  border: 1px solid rgb(75 62 47 / 8%);
  border-radius: 22px;
  box-shadow: 0 24px 80px rgb(75 62 47 / 12%);
}

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

.hero-small-icon {
  position: absolute;
  z-index: 2;
  box-shadow: 0 12px 35px rgb(75 62 47 / 12%);
}

.hero-small-icon-store {
  top: 20px;
  left: 5%;
}

.hero-small-icon-clock {
  right: 2%;
  bottom: 35px;
}

.search-section {
  scroll-margin-top: 88px;
  padding-top: 40px;
}

.search-card {
  padding: clamp(24px, 5vw, 52px);
  border: 1px solid #eee8df;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 20px 60px rgb(58 44 27 / 7%);
}

.search-button {
  min-height: 56px;
}

.found-store-card {
  border-radius: 14px;
  background: #fffdfa;
}

.steps-section {
  padding-top: 108px;
  padding-bottom: 108px;
  scroll-margin-top: 80px;
}

.section-heading {
  max-width: 660px;
}

.step-card {
  border-radius: 16px;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.step-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgb(58 44 27 / 8%);
}

.step-number {
  color: #f2eee8;
}

.benefits-section {
  padding-top: 88px;
  padding-bottom: 88px;
  background: #faf8f5;
  scroll-margin-top: 80px;
}

.benefit-item {
  height: 100%;
  padding: 20px 12px;
}

.business-section {
  padding-top: 88px;
  padding-bottom: 88px;
  scroll-margin-top: 80px;
}

.business-panel {
  padding: clamp(28px, 5vw, 56px);
  border-radius: 24px;
  color: white;
  background: linear-gradient(135deg, #77736e 0%, #8140d6 100%);
}

.business-panel h2 {
  max-width: 680px;
}

.business-intro,
.business-footnote {
  color: rgb(255 255 255 / 78%);
  line-height: 1.65;
}

.business-card {
  border-radius: 16px;
  color: #272321;
  background: #fffdfa;
}

.business-card-description {
  color: #6f6861;
  line-height: 1.6;
}

.closing-section {
  padding-top: 88px;
  padding-bottom: 88px;
}

.closing-card {
  padding: clamp(32px, 6vw, 68px) 24px;
  border-radius: 24px;
  color: white;
  background: linear-gradient(135deg, #77736e 0%, #8140d6 100%);
}

.closing-description {
  max-width: 600px;
  color: rgb(255 255 255 / 82%);
  line-height: 1.65;
}

@media (max-width: 899px) {
  .hero-content {
    min-height: auto;
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
    padding-top: 56px;
    padding-bottom: 52px;
  }

  .hero-copy {
    max-width: 760px;
  }

  .hero-illustration {
    min-height: 320px;
  }

  .steps-section {
    padding-top: 76px;
    padding-bottom: 76px;
  }
}

@media (max-width: 599px) {
  .hero-copy h1 {
    font-size: 2.55rem;
  }

  .hero-copy > p {
    font-size: 1.05rem;
  }

  .hero-illustration {
    min-height: 270px;
  }

  .hero-calendar-card {
    width: min(100%, 350px);
  }

  .orbit-one {
    width: 250px;
    height: 250px;
  }

  .orbit-two {
    width: 310px;
    height: 310px;
  }

  .search-button {
    width: 100%;
  }

  .steps-section,
  .business-section,
  .closing-section {
    padding-top: 64px;
    padding-bottom: 64px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .step-card {
    transition: none;
  }
}
</style>
