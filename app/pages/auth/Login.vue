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
        Acesse sua conta ou crie uma nova para sua empresa.
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-form class="full-width" @submit.prevent="handleLogin">
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
              value.length >= 6 || 'A senha deve ter pelo menos 6 caracteres.',
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

      <q-btn
        flat
        dense
        no-caps
        color="grey-7"
        icon="mdi-arrow-left"
        label="Voltar ao AgendaAi"
        to="/"
        class="q-mt-xs"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import type { LoginResponse } from '~/types/api'

definePageMeta({
  layout: 'auth',
})

const { isMobile } = useMobile()
const router = useRouter()
const authStore = useAuthStore()
const api = useApi()
const $q = useQuasar()
const organizationSetup = useOrganizationSetup()

const email = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    $q.notify({
      type: 'negative',
      message: 'Informe seu e-mail e senha.',
    })
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

    if (response.role === 'OWNER' || response.role === 'ADMIN') {
      await organizationSetup.fetchProgress()

      if (organizationSetup.error.value) {
        $q.notify({
          type: 'negative',
          message:
            'Não foi possível verificar a configuração inicial. Você pode continuar pelo painel e retomá-la depois.',
        })
      } else if (!organizationSetup.isComplete.value) {
        await router.push('/admin/onboarding')
        return
      }
    }

    await router.push('/admin/dashboard')
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'E-mail ou senha inválidos.',
    })
  } finally {
    loading.value = false
  }
}
</script>
