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
          <q-icon name="mdi-account-plus-outline" size="32px" />
        </q-avatar>

        <div class="text-h5 text-weight-bold">Crie sua conta</div>
        <div class="text-body2 text-grey-7 q-mt-sm">
          Cadastre-se para agendar e acompanhar seus horários.
        </div>
      </q-card-section>

      <q-card-section>
        <q-form class="full-width" @submit.prevent="submit">
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model.trim="firstName"
                label="Nome"
                autocomplete="given-name"
                outlined
                rounded
                maxlength="80"
                :rules="[
                  (value) => !!value || 'Informe seu nome.',
                  (value) =>
                    value.length >= 2 || 'Informe ao menos 2 caracteres.',
                ]"
              >
                <template #prepend>
                  <q-icon name="mdi-account-outline" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-sm-6">
              <q-input
                v-model.trim="lastName"
                label="Sobrenome"
                autocomplete="family-name"
                outlined
                rounded
                maxlength="100"
                :rules="[
                  (value) => !!value || 'Informe seu sobrenome.',
                  (value) =>
                    value.length >= 2 || 'Informe ao menos 2 caracteres.',
                ]"
              >
                <template #prepend>
                  <q-icon name="mdi-account-outline" />
                </template>
              </q-input>
            </div>
          </div>

          <q-input
            v-model.trim="email"
            label="E-mail"
            type="email"
            autocomplete="email"
            outlined
            rounded
            maxlength="255"
            class="q-mb-md"
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
            v-model="phone"
            label="Telefone"
            type="tel"
            mask="(##) #####-####"
            autocomplete="tel"
            outlined
            rounded
            maxlength="20"
            hint="Inclua o DDD."
            class="q-mb-md"
            :rules="[
              (value) =>
                !value ||
                value.replace(/\D/g, '').length >= 10 ||
                'Informe um telefone válido.',
              (value) => !!value || 'Informe seu telefone.',
            ]"
          >
            <template #prepend>
              <q-icon name="mdi-whatsapp" />
            </template>
          </q-input>

          <q-input
            v-model="cpf"
            label="CPF"
            mask="###.###.###-##"
            outlined
            rounded
            class="q-mb-md"
            hint="Informe os 11 dígitos do CPF."
            :rules="[
              (value) =>
                !value ||
                value.replace(/\D/g, '').length === 11 ||
                'O CPF deve conter 11 dígitos.',
              (value) => !!value || 'Informe seu CPF.',
            ]"
          >
            <template #prepend>
              <q-icon name="mdi-card-account-details-outline" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            label="Senha"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            outlined
            rounded
            class="q-mb-md"
            minlength="8"
            maxlength="72"
            hint="Use de 8 a 72 caracteres."
            :rules="[
              (value) => !!value || 'Informe uma senha.',
              (value) =>
                value.length >= 8 || 'A senha deve ter ao menos 8 caracteres.',
              (value) =>
                value.length <= 72 ||
                'A senha deve ter no máximo 72 caracteres.',
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
            label="Confirme sua senha"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            outlined
            rounded
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
                  showConfirmPassword
                    ? 'mdi-eye-off-outline'
                    : 'mdi-eye-outline'
                "
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            color="primary"
            label="Criar conta"
            unelevated
            rounded
            no-caps
            class="full-width q-mt-md"
            :loading="auth.loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none q-pb-sm q-mb-md">
        <q-btn
          flat
          no-caps
          color="secondary"
          label="Já é cliente? Ative seu cadastro"
          icon-right="mdi-email-check-outline"
          to="/customer/login?mode=first-access"
        />
        <q-btn
          flat
          no-caps
          color="secondary"
          label="Já possui uma conta? Entre"
          icon-right="mdi-login"
          :to="`/public/stores/${slug}/login`"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const cpf = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const submit = async () => {
  const normalizedCpf = cpf.value.replace(/\D/g, '')
  const normalizedPhone = phone.value.trim()

  try {
    await auth.register(slug.value, {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      password: password.value,
      ...(normalizedCpf ? { cpf: normalizedCpf } : {}),
      ...(normalizedPhone ? { phone: normalizedPhone } : {}),
    })

    const storePath = `/public/stores/${encodeURIComponent(slug.value)}`
    const redirect = route.query.redirect
    const destination =
      typeof redirect === 'string' &&
      redirect.startsWith(`${storePath}/`)
        ? redirect
        : `${storePath}/account`

    await navigateTo(destination)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível realizar o cadastro. Tente novamente.',
      ),
    })
  }
}

useHead({
  title: 'Criar conta | AgendaAi',
})
</script>

<style scoped>
.auth-page {
 margin-top: -10rem;
}

.auth-card {
  width: 100%;
  max-width: 480px;
  border-radius: 20px;
}
</style>
