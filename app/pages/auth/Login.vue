<template>
  <q-card
    bordered
    class="q-pa-lg border-radius"
    style="width: 420px; max-width: 92vw"
  >
    <q-card-section class="text-center q-pb-md">
      <q-img
        src="/logo.png"
        alt="AgendaAi"
        width="100%"
        fit="contain"
        class="q-mb-md"
      />

      <div class="text-subtitle2 text-grey-7">
        Acesse sua conta
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-form
        class="full-width"
        @submit.prevent="handleLogin"
      >
        <q-input
          v-model="email"
          outlined
          dense
          label="E-mail"
          type="email"
          autocomplete="email"
          class="q-mb-md"
          :disable="loading"
          :rules="[
            (value) => !!value || 'Informe seu e-mail.',
            (value) => /.+@.+\..+/.test(value) || 'Informe um e-mail válido.',
          ]"
        >
          <template #prepend>
            <q-icon name="mdi-email-outline" />
          </template>
        </q-input>

        <q-input
          v-model="password"
          outlined
          dense
          label="Senha"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          class="q-mb-lg"
          :disable="loading"
          :rules="[
            (value) => !!value || 'Informe sua senha.',
            (value) =>
              value.length >= 6 ||
              'A senha deve ter pelo menos 6 caracteres.',
          ]"
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
          class="bg-red-1 text-negative q-mb-md"
        >
          <template #avatar>
            <q-icon name="mdi-alert-circle-outline" />
          </template>

          {{ errorMessage }}
        </q-banner>

        <q-btn
          type="submit"
          color="primary"
          label="Entrar"
          icon="mdi-login"
          unelevated
          no-caps
          class="full-width"
          :loading="loading"
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
        to="/auth/register"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { LoginResponse } from '~/types/api'

definePageMeta({
  layout: 'auth',
})

const { isMobile } = useMobile()
const router = useRouter()
const authStore = useAuthStore()
const api = useApi()

const email = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Informe seu e-mail e senha.'
    return
  }

  loading.value = true

  try {
    const response = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
    })

    authStore.setSession(response)

    await router.push('/admin/dashboard')
  } catch (error) {
    console.error(error)
    errorMessage.value = 'E-mail ou senha inválidos.'
  } finally {
    loading.value = false
  }
}
</script>