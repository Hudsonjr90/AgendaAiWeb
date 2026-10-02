<template>
  <q-page class="q-pa-lg">
    <div class="wrapper">
      <div class="q-mb-lg">
        <div class="text-h4 text-weight-bold">Minha conta</div>

        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Gerencie seus dados pessoais e informações de acesso.
        </div>
      </div>

      <q-card bordered flat class="border-radius">
        <q-card-section>
          <div class="row items-center q-col-gutter-md">
            <div class="col-auto">
              <q-avatar color="primary" text-color="white" size="72px">
                {{ initials }}
              </q-avatar>
            </div>

            <div class="col">
              <div class="text-h6">
                {{ fullName }}
              </div>

              <div class="text-body2 text-grey-7">
                {{ user?.email }}
              </div>
            </div>

            <div class="col-12 col-md-auto">
              <div class="row justify-end">
                <q-btn
                  v-if="!editing"
                  outline
                  color="primary"
                  icon="mdi-pencil-outline"
                  label="Editar"
                  no-caps
                  @click="startEditing"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            Dados pessoais
          </div>

          <q-form class="row q-col-gutter-md" @submit.prevent="handleSave">
            <div class="col-12 col-md-6">
              <q-input
                v-model="fullNameField"
                outlined
                dense
                label="Nome completo"
                autocomplete="name"
                :readonly="!editing"
                :disable="loading"
                :rules="[
                  (value) => !!value?.trim() || 'Informe seu nome completo.',
                  (value) =>
                    value.trim().split(/\s+/).length >= 2 ||
                    'Informe nome e sobrenome.',
                ]"
              >
                <template #prepend>
                  <q-icon name="mdi-account-outline" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                :model-value="user?.email ?? ''"
                outlined
                dense
                label="E-mail"
                type="email"
                :readonly="!editing"
              >
                <template #prepend>
                  <q-icon name="mdi-email-outline" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                :model-value="user?.cpf ?? ''"
                outlined
                dense
                label="CPF"
                autocomplete="cpf"
                :readonly="!editing"
              >
                <template #prepend>
                  <q-icon name="mdi-account-badge-outline" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                :model-value="user?.phone ?? ''"
                outlined
                dense
                label="Telefone"
                autocomplete="tel"
                :readonly="!editing"
              >
                <template #prepend>
                  <q-icon name="mdi-phone-outline" />
                </template>
              </q-input>
            </div>

            <div v-if="errorMessage" class="col-12">
              <q-banner dense rounded class="bg-red-1 text-negative">
                <template #avatar>
                  <q-icon name="mdi-alert-circle-outline" />
                </template>

                {{ errorMessage }}
              </q-banner>
            </div>

            <div v-if="successMessage" class="col-12">
              <q-banner dense rounded class="bg-green-1 text-positive">
                <template #avatar>
                  <q-icon name="mdi-check-circle-outline" />
                </template>

                {{ successMessage }}
              </q-banner>
            </div>

            <div v-if="editing" class="col-12 row q-gutter-sm">
              <q-btn
                type="submit"
                color="primary"
                label="Salvar alterações"
                icon="mdi-content-save-outline"
                unelevated
                no-caps
                :loading="loading"
              />

              <q-btn
                flat
                color="grey-7"
                label="Cancelar"
                icon="mdi-close"
                no-caps
                :disable="loading"
                @click="cancelEditing"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import type { User } from '~/types/api'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: ['OWNER', 'ADMIN', 'MANAGER', 'STAFF'],
})

const api = useApi()
const authStore = useAuthStore()
const { initials } = useUserInitials()

const user = ref<User | null>(null)
const loading = ref(false)
const editing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  cpf: '',
})

const originalForm = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  cpf: '',
})

const fullName = computed(() => {
  if (!user.value) {
    return ''
  }

  return `${user.value.firstName} ${user.value.lastName}`.trim()
})

const fullNameField = computed({
  get: () => `${form.firstName} ${form.lastName}`.trim(),

  set: (value: string) => {
    const parts = value.trim().split(/\s+/).filter(Boolean)

    form.firstName = parts.shift() ?? ''
    form.lastName = parts.join(' ')
  },
})

const fetchUser = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api<User>('/users/me')

    user.value = response

    form.firstName = response.firstName
    form.lastName = response.lastName
    form.phone = response.phone
    form.cpf = response.cpf

    originalForm.firstName = response.firstName
    originalForm.lastName = response.lastName
    originalForm.phone = response.phone
    originalForm.cpf = response.cpf
  } catch (error) {
    console.error(error)

    errorMessage.value = 'Não foi possível carregar seus dados.'
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  successMessage.value = ''
  errorMessage.value = ''

  originalForm.firstName = form.firstName
  originalForm.lastName = form.lastName
  originalForm.phone = form.phone
  originalForm.cpf = form.cpf

  editing.value = true
}

const cancelEditing = () => {
  form.firstName = originalForm.firstName
  form.lastName = originalForm.lastName
  form.phone = originalForm.phone
  form.cpf = originalForm.cpf

  errorMessage.value = ''
  editing.value = false
}

const handleSave = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  const fullNameValue = `${form.firstName} ${form.lastName}`.trim()
  const parts = fullNameValue.split(/\s+/).filter(Boolean)

  if (parts.length < 2) {
    errorMessage.value = 'Informe nome e sobrenome.'
    return
  }

  form.firstName = parts.shift() ?? ''
  form.lastName = parts.join(' ')
  form.phone = form.phone.trim()
  form.cpf = form.cpf.trim()

  loading.value = true

  try {
    const response = await api<User>('/users/me', {
      method: 'PATCH',
      body: {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        cpf: form.cpf,
      },
    })

    user.value = response

    form.firstName = response.firstName
    form.lastName = response.lastName
    form.phone = response.phone
    form.cpf = response.cpf

    originalForm.firstName = response.firstName
    originalForm.lastName = response.lastName
    originalForm.phone = response.phone
    originalForm.cpf = response.cpf

    authStore.user = {
      ...authStore.user,
      ...response,
    }

    editing.value = false

    successMessage.value = 'Seus dados foram atualizados com sucesso.'
  } catch (error) {
    console.error(error)

    errorMessage.value = 'Não foi possível atualizar seus dados.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchUser)
</script>
