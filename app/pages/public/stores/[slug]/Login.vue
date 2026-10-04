
<template>
  <q-page class="auth-page flex flex-center q-pa-md">
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

        <div class="text-h5 text-center text-weight-bold">
          {{ needsStoreSelection ? 'Escolha uma unidade' : 'Bem-vindo de volta' }}
        </div>

        <div class="text-body2 text-center text-grey-7 q-mt-sm">
          {{
            needsStoreSelection
              ? 'Encontramos mais de um estabelecimento vinculado à sua conta. Selecione onde deseja continuar.'
              : 'Entre na sua conta para acompanhar seus agendamentos.'
          }}
        </div>
      </q-card-section>

      <q-card-section v-if="!needsStoreSelection">
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
                @click="showPassword = !showPassword"
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
      </q-card-section>

      <q-card-section v-else>
        <q-list bordered separator class="store-list">
          <q-item
            v-for="store in auth.availableStores"
            :key="store.id"
            clickable
            v-ripple
            class="q-py-md"
            :disable="auth.loading"
            @click="chooseStore(store.publicSlug)"
          >
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white">
                <q-icon name="mdi-storefront-outline" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ store.name }}
              </q-item-label>
              <q-item-label caption>
                Acessar este estabelecimento
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-icon
                name="mdi-chevron-right"
                color="grey-7"
                size="sm"
              />
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

      <q-card-section
        v-if="!needsStoreSelection"
        class="text-center q-pt-md q-pb-sm"
      >
        <q-btn
          flat
          no-caps
          color="secondary"
          label="Não tem uma conta? Crie a sua"
          icon-right="mdi-account-plus-outline"
          :to="`/public/stores/${slug}/register`"
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
          label="Voltar para a loja"
          :to="`/public/stores/${slug}/home`"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useCustomerAuthStore } from '~/stores/customer-auth'
import { getErrorMessage } from '~/utils/global'

definePageMeta({
  layout: 'public-store',
})

const route = useRoute()
const auth = useCustomerAuthStore()
const $q = useQuasar()

const slug = computed(() => String(route.params.slug ?? ''))
const needsStoreSelection = computed(
  () => Boolean(auth.selectionToken) && auth.availableStores.length > 0,
)
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const getDestination = (storeSlug: string) => {
  const redirect = route.query.redirect

  if (
    typeof redirect === 'string' &&
    redirect.startsWith(`/public/stores/${storeSlug}/`)
  ) {
    return redirect
  }

  return `/public/stores/${storeSlug}/account`
}

const submit = async () => {
  auth.clearError()

  try {
    await auth.loginGlobal(email.value, password.value)

    if (needsStoreSelection.value) {
      return
    }

    const destinationSlug =
      auth.selectedStore?.publicSlug || slug.value

    await navigateTo(getDestination(destinationSlug))
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

const chooseStore = async (publicSlug: string) => {
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

const backToLogin = () => {
  auth.clearError()
}

useHead({
  title: 'Entrar | AgendaAi',
})
</script>

<style scoped>
.auth-page {
  margin-top: -10rem;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  border-radius: 20px;
}

.store-list {
  overflow: hidden;
  border-radius: 12px;
}
</style>
