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
          <q-icon name="mdi-account-outline" size="32px" />
        </q-avatar>

        <div class="text-h5 text-center text-weight-bold">
          Bem-vindo de volta
        </div>
        <div class="text-body2 text-center text-grey-7 q-mt-sm">
          Entre na sua conta para acompanhar seus agendamentos.
        </div>
      </q-card-section>

      <q-card-section>
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

          <q-banner
            v-if="errorMessage"
            dense
            rounded
            class="bg-red-1 text-negative"
          >
            {{ errorMessage }}
          </q-banner>

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

      <q-card-section class="text-center q-pt-md q-pb-sm">
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
          :to="`/public/stores/${slug}`"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCustomerAuthStore } from '~/stores/customer-auth'

definePageMeta({
  layout: 'public-store',
})

const route = useRoute()
const auth = useCustomerAuthStore()

const slug = computed(() => String(route.params.slug ?? ''))
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

const submit = async () => {
  errorMessage.value = ''

  try {
    await auth.login(slug.value, email.value, password.value)

    const redirect = route.query.redirect
    const destination =
      typeof redirect === 'string' &&
      redirect.startsWith(`/public/stores/${slug.value}/`)
        ? redirect
        : `/public/stores/${slug.value}/account`

    await navigateTo(destination)
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Não foi possível entrar. Tente novamente.'
  }
}

useHead({
  title: 'Entrar | AgendaAi',
})
</script>

<style scoped>
.auth-page {
  min-height: 70vh;
  background: #f7f7fb;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  border-radius: 20px;
}
</style>
