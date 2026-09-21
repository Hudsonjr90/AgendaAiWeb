<template>
  <q-card
    bordered
    class="q-pa-lg border-radius"
    style="width: 480px; max-width: 92vw"
  >
    <q-card-section class="text-center q-pb-md">
      <q-img
        src="/logo.png"
        alt="AgendaAi"
        width="100%"
        fit="contain"
        class="q-mb-md"
      />

      <div class="text-h6 text-weight-medium">Crie sua empresa</div>

      <div class="text-subtitle2 text-grey-7 q-mt-xs">
        Comece a gerenciar seus agendamentos
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-form class="full-width" @submit.prevent="handleRegister">
        <div class="text-subtitle2 text-weight-medium q-mb-md">Seus dados</div>

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model="firstName"
              outlined
              dense
              label="Nome"
              autocomplete="given-name"
              :disable="loading"
              :rules="[
                (value) => !!value || 'Informe seu nome.',
                (value) =>
                  value.length >= 2 ||
                  'O nome deve ter pelo menos 2 caracteres.',
              ]"
            />
          </div>

          <div class="col-6">
            <q-input
              v-model="lastName"
              outlined
              dense
              label="Sobrenome"
              autocomplete="family-name"
              :disable="loading"
              :rules="[
                (value) => !!value || 'Informe seu sobrenome.',
                (value) =>
                  value.length >= 2 ||
                  'O sobrenome deve ter pelo menos 2 caracteres.',
              ]"
            />
          </div>
        </div>

        <q-input
          v-model="email"
          outlined
          dense
          label="E-mail"
          type="email"
          autocomplete="email"
          class="q-mt-md"
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
          autocomplete="new-password"
          class="q-mt-md"
          :disable="loading"
          :rules="[
            (value) => !!value || 'Informe sua senha.',
            (value) =>
              value.length >= 8 || 'A senha deve ter pelo menos 8 caracteres.',
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

        <q-input
          v-model="confirmPassword"
          outlined
          dense
          label="Confirmar senha"
          :type="showConfirmPassword ? 'text' : 'password'"
          autocomplete="new-password"
          class="q-mt-md"
          :disable="loading"
          :rules="[
            (value) => !!value || 'Confirme sua senha.',
            (value) => value === password || 'As senhas não coincidem.',
          ]"
        >
          <template #prepend>
            <q-icon name="mdi-lock-check-outline" />
          </template>

          <template #append>
            <q-icon
              :name="
                showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
              "
              class="cursor-pointer"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </q-input>

        <q-separator class="q-my-lg" />

        <div class="text-subtitle2 text-weight-medium q-mb-md">
          Dados da empresa
        </div>

        <q-input
          v-model="organizationName"
          outlined
          dense
          label="Nome da empresa"
          autocomplete="organization"
          :disable="loading"
          :rules="[
            (value) => !!value || 'Informe o nome da empresa.',
            (value) =>
              value.length >= 2 || 'O nome deve ter pelo menos 2 caracteres.',
          ]"
        >
          <template #prepend>
            <q-icon name="mdi-domain" />
          </template>
        </q-input>

        <q-input
          v-model="organizationSlug"
          outlined
          dense
          label="Identificador da empresa"
          hint="Opcional. Ex.: barbearia-kennedy"
          class="q-mt-md"
          :disable="loading"
          :rules="[
            (value) =>
              !value ||
              /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ||
              'Use apenas letras minúsculas, números e hífens.',
          ]"
        >
          <template #prepend>
            <q-icon name="mdi-link-variant" />
          </template>
        </q-input>

        <q-banner
          v-if="errorMessage"
          dense
          rounded
          class="bg-red-1 text-negative q-mt-md"
        >
          <template #avatar>
            <q-icon name="mdi-alert-circle-outline" />
          </template>

          {{ errorMessage }}
        </q-banner>

        <q-btn
          type="submit"
          color="primary"
          label="Criar minha conta"
          icon="mdi-account-plus-outline"
          unelevated
          no-caps
          class="full-width q-mt-lg"
          :loading="loading"
        />
      </q-form>
    </q-card-section>

    <q-card-section class="text-center q-pt-md q-pb-sm">
      <q-btn
        flat
        no-caps
        color="secondary"
        label="Já possui uma conta? Entre"
        icon-right="mdi-login"
        to="/auth/login"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { RegisterResponse } from '~/types/api'

definePageMeta({
  layout: 'auth',
})

const router = useRouter()
const api = useApi()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const organizationName = ref('')
const organizationSlug = ref('')

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'As senhas não coincidem.'
    return
  }

  loading.value = true

  try {
    const response = await api<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value,
        organizationName: organizationName.value,
        ...(organizationSlug.value
          ? {
              organizationSlug: organizationSlug.value,
            }
          : {}),
      },
    })

    console.log('Conta criada:', response)

    await router.push('/auth/login')
  } catch (error) {
    console.error(error)

    errorMessage.value =
      'Não foi possível criar sua conta. Verifique os dados e tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>
