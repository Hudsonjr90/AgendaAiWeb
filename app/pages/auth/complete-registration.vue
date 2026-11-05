<template>
  <q-page class="row justify-center items-center q-pa-md">
    <q-card flat bordered class="q-pa-lg" style="width: 500px; max-width: 100%">
      <q-card-section class="text-center">
        <q-icon name="mdi-account-check-outline" color="primary" size="44px" />
        <div class="text-h5 text-weight-bold q-mt-sm">Conclua seu cadastro</div>
        <div class="text-body2 text-grey-7 q-mt-sm">
          O pagamento foi confirmado. Crie sua senha e informe o nome da sua
          empresa para acessar o AgendaAi.
        </div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="completeRegistration">
          <q-input
            v-model="organizationName"
            outlined
            dense
            label="Nome da empresa"
            autocomplete="organization"
            :disable="loading"
            :rules="[
              (value) => !!value || 'Informe o nome da empresa.',
              (value) => value.trim().length >= 2 || 'Informe ao menos 2 caracteres.',
            ]"
          />
          <q-input
            v-model="organizationSlug"
            outlined
            dense
            label="Identificador da empresa"
            hint="Opcional. Ex.: studio-central"
            :disable="loading"
            :rules="[
              (value) =>
                !value ||
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ||
                'Use letras minúsculas, números e hífens.',
            ]"
          />
          <q-input
            v-model="password"
            outlined
            dense
            label="Crie uma senha"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :disable="loading"
            :rules="[
              (value) => value.length >= 8 || 'A senha deve ter pelo menos 8 caracteres.',
            ]"
          >
            <template #append>
              <q-icon
                :name="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
          <q-input
            v-model="confirmPassword"
            outlined
            dense
            label="Confirme sua senha"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :disable="loading"
            :rules="[
              (value) => value === password || 'As senhas não coincidem.',
            ]"
          >
            <template #append>
              <q-icon
                :name="showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>
          <q-btn
            type="submit"
            color="primary"
            unelevated
            no-caps
            icon="mdi-account-plus-outline"
            label="Criar conta e acessar"
            class="full-width"
            :loading="loading"
            :disable="!token"
          />
          <q-banner v-if="!token" rounded class="bg-red-1 text-negative">
            O link está inválido. Use o link enviado após a confirmação do pagamento.
          </q-banner>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import type { LoginResponse, RegisterResponse } from '~/types/api'
import { getErrorMessage } from '~/utils/global'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const router = useRouter()
const api = useApi()
const authStore = useAuthStore()
const $q = useQuasar()
const token = typeof route.query.token === 'string' ? route.query.token : ''
const organizationName = ref('')
const organizationSlug = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)

async function completeRegistration() {
  if (!token || loading.value) return
  if (password.value !== confirmPassword.value) {
    $q.notify({ type: 'negative', message: 'As senhas não coincidem.' })
    return
  }

  loading.value = true
  try {
    const account = await api<RegisterResponse>(
      '/auth/complete-paid-registration',
      {
        method: 'POST',
        body: {
          token,
          password: password.value,
          organizationName: organizationName.value,
          ...(organizationSlug.value
            ? { organizationSlug: organizationSlug.value }
            : {}),
        },
      },
    )
    const session = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: {
        email: account.user.email,
        password: password.value,
      },
    })
    authStore.setSession(session)
    await router.push('/admin/onboarding')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível concluir o cadastro. Confira o link e tente novamente.',
      ),
    })
  } finally {
    loading.value = false
  }
}
</script>
