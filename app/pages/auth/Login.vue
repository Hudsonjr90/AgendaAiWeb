<template>
  <q-card flat bordered class="q-pa-lg">
    <q-card-section class="text-center">
      <div class="text-h4 text-weight-bold text-primary">
        AgendaAi
      </div>

      <div class="text-subtitle2 text-grey-7 q-mt-sm">
        Entre na sua conta
      </div>
    </q-card-section>

    <q-card-section>
      <q-banner
        v-if="errorMessage"
        rounded
        class="bg-red-1 text-negative q-mb-md"
      >
        <template #avatar>
          <q-icon name="mdi-alert-circle" />
        </template>

        {{ errorMessage }}
      </q-banner>

      <q-form @submit.prevent="handleLogin">
        <q-input
          v-model="email"
          outlined
          label="E-mail"
          type="email"
          autocomplete="email"
          class="q-mb-md"
          :disable="loading"
        >
          <template #prepend>
            <q-icon name="mdi-email-outline" />
          </template>
        </q-input>

        <q-input
          v-model="password"
          outlined
          label="Senha"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          class="q-mb-lg"
          :disable="loading"
        >
          <template #prepend>
            <q-icon name="mdi-lock-outline" />
          </template>

          <template #append>
            <q-icon
              :name="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-btn
          type="submit"
          color="primary"
          label="Entrar"
          icon="mdi-login"
          unelevated
          no-caps
          class="full-width"
          size="lg"
          :loading="loading"
        />
      </q-form>
    </q-card-section>

    <q-card-section class="text-center">
      <div class="text-body2 text-grey-7">
        Ainda não possui uma conta?
      </div>

      <q-btn
        flat
        no-caps
        color="primary"
        label="Criar conta"
        icon="mdi-account-plus-outline"
        to="/auth/register"
        class="q-mt-xs"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { LoginResponse } from '~/types/api'

definePageMeta({
  layout: 'auth',
})

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