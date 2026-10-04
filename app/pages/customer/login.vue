<template>
  <q-page class="customer-login-page q-pa-md">
    <div class="customer-login-content">
      <q-card flat bordered class="auth-card">
        <q-card-section class="text-center q-pb-sm">
          <q-avatar
            size="64px"
            color="primary"
            text-color="white"
            class="q-mb-md"
          >
            <q-icon
              :name="needsStoreSelection ? 'mdi-store-multiple-outline' : 'mdi-account-outline'"
              size="32px"
            />
          </q-avatar>

          <div class="text-h5 text-weight-bold">
            {{ needsStoreSelection ? 'Escolha um estabelecimento' : 'Acesso do cliente' }}
          </div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            {{
              needsStoreSelection
                ? 'Sua conta está vinculada a mais de um estabelecimento. Escolha onde deseja continuar.'
                : 'Entre para acompanhar os agendamentos associados à sua conta.'
            }}
          </div>
        </q-card-section>

        <q-card-section
          v-if="!needsStoreSelection && !noEstablishments && !firstAccessMode"
        >
          <q-form class="full-width" @submit.prevent="submit">
            <q-input
              v-model.trim="email"
              label="E-mail"
              type="email"
              autocomplete="email"
              outlined
              rounded
              :rules="[
                (value) => !!value || 'Informe seu e-mail.',
                (value) =>
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
                  'Informe um e-mail válido.',
              ]"
            >
              <template #prepend>
                <q-icon name="mdi-email-outline" />
              </template>
            </q-input>

            <q-input
              v-model="password"
              label="Senha"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              outlined
              rounded
              :rules="[(value) => !!value || 'Informe sua senha.']"
            >
              <template #prepend>
                <q-icon name="mdi-lock-outline" />
              </template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  class="cursor-pointer"
                  role="button"
                  tabindex="0"
                  aria-label="Mostrar ou ocultar senha"
                  @click="showPassword = !showPassword"
                  @keydown.enter="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              color="primary"
              label="Entrar"
              unelevated
              rounded
              no-caps
              class="full-width q-mt-md"
              :loading="auth.loading"
            />
          </q-form>

          <div class="text-center q-mt-md">
            <q-btn
              flat
              no-caps
              color="secondary"
              label="Primeiro acesso? Ative seu cadastro"
              icon-right="mdi-email-check-outline"
              @click="startFirstAccess"
            />
          </div>
        </q-card-section>

        <q-card-section
          v-else-if="firstAccessMode && !needsStoreSelection && !noEstablishments"
        >
          <div class="text-body2 text-grey-7 q-mb-md">
            Informe seu e-mail. Se houver um cadastro importado, enviaremos
            um código para confirmar que ele pertence a você.
          </div>

          <q-form
            v-if="!firstAccessRequested"
            class="full-width"
            @submit.prevent="requestFirstAccess"
          >
            <q-input
              v-model.trim="email"
              label="E-mail cadastrado"
              type="email"
              autocomplete="email"
              outlined
              rounded
              :rules="[
                (value) => !!value || 'Informe seu e-mail.',
                (value) =>
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
                  'Informe um e-mail válido.',
              ]"
            >
              <template #prepend>
                <q-icon name="mdi-email-outline" />
              </template>
            </q-input>
            <q-btn
              type="submit"
              color="primary"
              label="Enviar código"
              unelevated
              rounded
              no-caps
              class="full-width q-mt-md"
              :loading="firstAccessLoading"
            />
          </q-form>

          <q-form
            v-else
            class="full-width"
            @submit.prevent="completeFirstAccess"
          >
            <div class="text-body2 text-grey-7 q-mb-md">
              Confira sua caixa de entrada e a pasta de spam. Se não receber
              o código, procure sua loja e faça um cadastro completo.
            </div>
            <q-input
              v-model="firstAccessCode"
              label="Código de 6 dígitos"
              inputmode="numeric"
              mask="######"
              autocomplete="one-time-code"
              outlined
              rounded
              :rules="[
                (value) =>
                  /^\d{6}$/.test(value) || 'Informe o código recebido por e-mail.',
              ]"
            >
              <template #prepend>
                <q-icon name="mdi-shield-key-outline" />
              </template>
            </q-input>
            <q-input
              v-model="firstAccessPassword"
              label="Crie sua senha"
              type="password"
              autocomplete="new-password"
              outlined
              rounded
              :rules="[
                (value) =>
                  value.length >= 8 || 'Use pelo menos 8 caracteres.',
              ]"
            >
              <template #prepend>
                <q-icon name="mdi-lock-outline" />
              </template>
            </q-input>
            <q-input
              v-model="firstAccessPasswordConfirmation"
              label="Confirme sua senha"
              type="password"
              autocomplete="new-password"
              outlined
              rounded
              :rules="[
                (value) =>
                  value === firstAccessPassword || 'As senhas não coincidem.',
              ]"
            >
              <template #prepend>
                <q-icon name="mdi-lock-check-outline" />
              </template>
            </q-input>
            <q-btn
              type="submit"
              color="primary"
              label="Confirmar e criar senha"
              unelevated
              rounded
              no-caps
              class="full-width q-mt-md"
              :loading="firstAccessLoading"
            />
            <q-btn
              flat
              no-caps
              color="grey-7"
              :label="
                firstAccessCooldownSeconds
                  ? `Reenviar código (${firstAccessCooldownSeconds}s)`
                  : 'Enviar outro código'
              "
              class="full-width q-mt-sm"
              :disable="firstAccessLoading || firstAccessCooldownSeconds > 0"
              @click="resendFirstAccessCode"
            />
          </q-form>

          <q-btn
            flat
            no-caps
            color="secondary"
            label="Não encontrou seu cadastro? Escolha uma loja"
            icon-right="mdi-store-search-outline"
            class="full-width q-mt-sm"
            @click="openStoreSearch"
          />
          <q-btn
            flat
            no-caps
            color="grey-7"
            label="Voltar ao login"
            class="full-width"
            @click="cancelFirstAccess"
          />
        </q-card-section>

        <q-card-section v-else-if="needsStoreSelection">
          <q-list bordered separator class="store-list">
            <q-item
              v-for="store in auth.availableStores"
              :key="store.publicSlug"
              clickable
              v-ripple
              class="q-py-md"
              :disable="auth.loading"
              @click="chooseStore(store.publicSlug)"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  <q-img
                    v-if="store.logoUrl"
                    :src="store.logoUrl"
                    :alt="`Logo de ${store.name}`"
                    fit="contain"
                  />
                  <q-icon v-else name="mdi-storefront-outline" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ store.name }}
                </q-item-label>
                <q-item-label v-if="storeLocation(store)" caption>
                  {{ storeLocation(store) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="mdi-chevron-right" color="grey-7" size="sm" />
              </q-item-section>
            </q-item>
          </q-list>

          <q-btn
            flat
            no-caps
            color="grey-7"
            icon="mdi-arrow-left"
            label="Voltar ao login"
            class="full-width q-mt-md"
            :disable="auth.loading"
            @click="backToLogin"
          />
        </q-card-section>

        <q-card-section v-else>
          <q-card flat bordered class="bg-orange-1">
            <q-card-section class="row items-start no-wrap q-gutter-sm">
              <q-icon
                name="mdi-store-search-outline"
                color="primary"
                size="24px"
              />
              <div class="text-body2">{{ noEstablishmentsMessage }}</div>
            </q-card-section>
          </q-card>

          <div class="q-mt-lg">
            <div class="text-subtitle1 text-weight-bold">
              Encontre a loja onde deseja agendar
            </div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              Cada estabelecimento mantém seu próprio cadastro de clientes.
              Para usar outra loja, escolha-a abaixo e crie uma conta naquele
              estabelecimento.
            </div>

            <q-form
              class="row items-start q-col-gutter-sm q-mt-md"
              @submit.prevent="searchStores"
            >
              <div class="col">
                <q-input
                  v-model.trim="storeQuery"
                  label="Nome do estabelecimento"
                  placeholder="Ex.: Barbearia Central"
                  outlined
                  rounded
                  clearable
                  maxlength="100"
                  :disable="searchLoading"
                  :rules="[
                    (value) =>
                      (value?.trim().length ?? 0) >= 2 ||
                      'Digite ao menos 2 caracteres.',
                  ]"
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
                  label="Buscar"
                  icon-right="mdi-magnify"
                  unelevated
                  rounded
                  no-caps
                  :loading="searchLoading"
                  class="search-button"
                />
              </div>
            </q-form>

            <div
              v-if="searchLoading"
              class="row items-center q-gutter-sm q-mt-sm"
              aria-live="polite"
            >
              <q-spinner color="primary" size="24px" />
              <span class="text-body2 text-grey-7">Buscando lojas...</span>
            </div>

            <q-list
              v-else-if="searchPerformed && stores.length"
              bordered
              separator
              class="store-list q-mt-sm"
              aria-live="polite"
            >
              <q-item
                v-for="store in stores"
                :key="store.publicSlug"
                class="q-py-md"
              >
                <q-item-section avatar>
                  <q-avatar rounded color="orange-1" text-color="primary">
                    <q-img
                      v-if="store.logoUrl"
                      :src="store.logoUrl"
                      :alt="`Logo de ${store.name}`"
                      fit="contain"
                    />
                    <q-icon v-else name="mdi-storefront-outline" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ store.name }}
                  </q-item-label>
                  <q-item-label v-if="storeLocation(store)" caption>
                    {{ storeLocation(store) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    color="primary"
                    unelevated
                    rounded
                    no-caps
                    label="Criar cadastro"
                    :to="registerPage(store.publicSlug)"
                  />
                </q-item-section>
              </q-item>
            </q-list>

            <q-card
              v-else-if="searchPerformed"
              flat
              bordered
              class="q-mt-sm"
              aria-live="polite"
            >
              <q-card-section class="text-body2 text-grey-7">
                Nenhum estabelecimento ativo encontrado. Confira o nome e tente
                novamente.
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-section
          v-if="!needsStoreSelection && !noEstablishments"
          class="text-center q-pt-xs q-pb-sm"
        >
          <div class="text-body2 text-grey-7">
            Ainda não tem uma conta?
          </div>
          <q-btn
            flat
            no-caps
            color="secondary"
            label="Encontre uma loja para se cadastrar"
            icon-right="mdi-store-search-outline"
            to="/#buscar"
            class="q-mt-xs"
          />
        </q-card-section>

        <q-card-section class="text-center q-pt-none">
          <q-btn
            flat
            dense
            no-caps
            color="grey-7"
            icon="mdi-arrow-left"
            label="Voltar ao AgendaAi"
            to="/"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useCustomerAuthStore } from '~/stores/customer-auth'
import { getErrorMessage } from '~/utils/global'

definePageMeta({
  layout: 'main-layout',
})

onUnmounted(() => {
  if (firstAccessCooldownTimer) clearInterval(firstAccessCooldownTimer)
})

const route = useRoute()
const auth = useCustomerAuthStore()
const publicStores = usePublicStores()
const api = useApi()
const $q = useQuasar()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const firstAccessMode = ref(false)
const firstAccessRequested = ref(false)
const firstAccessLoading = ref(false)
const firstAccessCooldownSeconds = ref(0)
const firstAccessCode = ref('')
const firstAccessPassword = ref('')
const firstAccessPasswordConfirmation = ref('')
const noEstablishments = ref(false)
const noEstablishmentsMessage = ref('')
const storeQuery = ref('')
const searchLoading = ref(false)
const searchPerformed = ref(false)
const stores = ref<Awaited<ReturnType<typeof publicStores.search>>>([])
let firstAccessCooldownTimer: ReturnType<typeof setInterval> | undefined

const needsStoreSelection = computed(
  () => Boolean(auth.selectionToken) && auth.availableStores.length > 0,
)

function storeLocation(store: (typeof stores.value)[number]) {
  return [store.city, store.state].filter(Boolean).join(', ')
}

function registerPage(publicSlug: string) {
  return `/public/stores/${encodeURIComponent(publicSlug)}/register`
}

function getDestination(publicSlug: string) {
  const redirect = route.query.redirect

  if (
    typeof redirect === 'string' &&
    redirect.startsWith(
      `/public/stores/${encodeURIComponent(publicSlug)}/`,
    )
  ) {
    return redirect
  }

  return `/public/stores/${encodeURIComponent(publicSlug)}/account`
}

function startFirstAccess() {
  firstAccessMode.value = true
  firstAccessRequested.value = false
  email.value = ''
}

function cancelFirstAccess() {
  firstAccessMode.value = false
  firstAccessRequested.value = false
  firstAccessCode.value = ''
  firstAccessPassword.value = ''
  firstAccessPasswordConfirmation.value = ''
  firstAccessCooldownSeconds.value = 0
  if (firstAccessCooldownTimer) clearInterval(firstAccessCooldownTimer)
}

function startFirstAccessCooldown() {
  if (firstAccessCooldownTimer) clearInterval(firstAccessCooldownTimer)
  firstAccessCooldownSeconds.value = 60
  firstAccessCooldownTimer = setInterval(() => {
    firstAccessCooldownSeconds.value -= 1
    if (firstAccessCooldownSeconds.value <= 0 && firstAccessCooldownTimer) {
      clearInterval(firstAccessCooldownTimer)
      firstAccessCooldownTimer = undefined
    }
  }, 1000)
}

function openStoreSearch() {
  noEstablishmentsMessage.value =
    'Busque o estabelecimento onde você deseja criar sua conta.'
  noEstablishments.value = true
}

async function requestFirstAccess() {
  if (firstAccessLoading.value) return

  firstAccessLoading.value = true
  try {
    const response = await api<{ message: string }>(
      '/customer-auth/first-access/request',
      {
        method: 'POST',
        body: { email: email.value.trim().toLowerCase() },
      },
    )
    firstAccessRequested.value = true
    startFirstAccessCooldown()
    $q.notify({
      type: 'positive',
      message: response.message,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível enviar o código. Tente novamente mais tarde.',
      ),
    })
  } finally {
    firstAccessLoading.value = false
  }
}

async function resendFirstAccessCode() {
  if (firstAccessCooldownSeconds.value) return
  firstAccessRequested.value = false
  await requestFirstAccess()
}

async function completeFirstAccess() {
  if (
    firstAccessLoading.value ||
    firstAccessPassword.value !== firstAccessPasswordConfirmation.value
  ) {
    return
  }

  firstAccessLoading.value = true
  try {
    const response = await api<{
      status: 'ACTIVATED' | 'NO_IMPORTED_CUSTOMER' | 'AMBIGUOUS_CUSTOMER'
      message: string
    }>('/customer-auth/first-access/complete', {
      method: 'POST',
      body: {
        email: email.value.trim().toLowerCase(),
        code: firstAccessCode.value,
        password: firstAccessPassword.value,
      },
    })

    if (response.status === 'NO_IMPORTED_CUSTOMER') {
      firstAccessMode.value = false
      openStoreSearch()
      return
    }

    if (response.status === 'AMBIGUOUS_CUSTOMER') {
      $q.notify({
        type: 'negative',
        message: response.message,
      })
      return
    }

    const login = await auth.loginGlobal(
      email.value,
      firstAccessPassword.value,
    )

    $q.notify({
      type: 'positive',
      message: response.message,
    })

    if (login.status === 'STORE_SELECTION_REQUIRED') return

    if (login.status === 'NO_ESTABLISHMENTS') {
      noEstablishments.value = true
      noEstablishmentsMessage.value = login.message
      return
    }

    const storeSlug = login.store?.publicSlug ?? auth.selectedStore?.publicSlug
    if (storeSlug) await navigateTo(getDestination(storeSlug))
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível ativar sua conta. Confira o código e tente novamente.',
      ),
    })
  } finally {
    firstAccessLoading.value = false
  }
}

async function submit() {
  auth.clearError()
  noEstablishments.value = false

  try {
    const response = await auth.loginGlobal(email.value, password.value)

    if (response.status === 'NO_ESTABLISHMENTS') {
      noEstablishments.value = true
      noEstablishmentsMessage.value = response.message
      return
    }

    if (response.status === 'STORE_SELECTION_REQUIRED') return

    const storeSlug =
      response.store?.publicSlug ?? auth.selectedStore?.publicSlug
    if (storeSlug) await navigateTo(getDestination(storeSlug))
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível entrar. Verifique seus dados e tente novamente.',
      ),
    })
  }
}

async function chooseStore(publicSlug: string) {
  auth.clearError()

  try {
    await auth.selectStore(publicSlug)
    await navigateTo(getDestination(publicSlug))
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível acessar este estabelecimento. Tente novamente.',
      ),
    })
  }
}

function backToLogin() {
  auth.clearError()
}

async function searchStores() {
  const query = storeQuery.value.trim()
  if (query.length < 2 || searchLoading.value) return

  searchLoading.value = true
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
    searchLoading.value = false
  }
}

onMounted(async () => {
  if (route.query.mode === 'first-access') {
    firstAccessMode.value = true
  }

  if (auth.accessToken && !auth.customer) {
    await auth.fetchMe()
  }

  const storeSlug =
    auth.selectedStore?.publicSlug ?? auth.activeStoreSlug
  if (auth.isAuthenticated && storeSlug) {
    await navigateTo(getDestination(storeSlug))
  }
})

useHead({
  title: 'Acesso do consumidor | AgendaAi',
  meta: [
    {
      name: 'description',
      content:
        'Acesse sua conta de consumidor para escolher um estabelecimento e acompanhar seus agendamentos no AgendaAi.',
    },
  ],
})
</script>

<style scoped>
.customer-login-page {
  min-height: calc(100vh - 140px);
  background:
    radial-gradient(circle at 15% 15%, rgb(255 183 77 / 12%), transparent 32%),
    #fffdfa;
}

.customer-login-content {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.auth-card {
  width: 100%;
  max-width: 540px;
  border-radius: 20px;
}

.store-list {
  overflow: hidden;
  border-radius: 12px;
}

.search-button {
  min-height: 56px;
}

@media (max-width: 599px) {
  .customer-login-content {
    padding: 24px 0;
  }

  .search-button {
    width: 100%;
  }
}
</style>
