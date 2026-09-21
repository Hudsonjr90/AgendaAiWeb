<template>
  <q-page class="q-pa-lg">
    <div class="wrapper">
      <div class="q-mb-lg">
        <div class="text-h4 text-weight-bold">
          Empresa
        </div>

        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Gerencie os dados da sua empresa.
        </div>
      </div>

      <q-card
        bordered
        flat
        class="border-radius"
      >
        <q-card-section>
          <div class="row items-center q-col-gutter-md">
            <div class="col-auto">
              <q-avatar
                color="primary"
                text-color="white"
                size="72px"
              >
                <q-icon
                  name="mdi-domain"
                  size="36px"
                />
              </q-avatar>
            </div>

            <div class="col">
              <div class="text-h6">
                {{ form.name || 'Sua empresa' }}
              </div>

              <div class="text-body2 text-grey-7">
                {{ form.slug || 'Identificador da empresa' }}
              </div>
            </div>

            <div class="col-12 col-md-auto">
              <div class="row items-center justify-end q-gutter-sm">
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
            Dados da empresa
          </div>

          <q-form
            class="row q-col-gutter-md"
            @submit.prevent="handleSave"
          >
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.name"
                outlined
                dense
                label="Nome da empresa"
                autocomplete="organization"
                :readonly="!editing"
                :disable="loading"
                :rules="[
                  (value) =>
                    !!value?.trim() ||
                    'Informe o nome da empresa.',
                  (value) =>
                    value.trim().length >= 2 ||
                    'O nome deve ter pelo menos 2 caracteres.',
                ]"
              >
                <template #prepend>
                  <q-icon name="mdi-domain" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.slug"
                outlined
                dense
                label="Identificador"
                hint="Ex.: barbearia-kennedy"
                :readonly="!editing"
                :disable="loading"
                :rules="[
                  (value) =>
                    !!value ||
                    'Informe o identificador.',
                  (value) =>
                    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ||
                    'Use apenas letras minúsculas, números e hífens.',
                ]"
              >
                <template #prepend>
                  <q-icon name="mdi-link-variant" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                :model-value="
                  company?.status === 'ACTIVE'
                    ? 'Ativa'
                    : 'Inativa'
                "
                outlined
                dense
                label="Status"
                readonly
              >
                <template #prepend>
                  <q-icon name="mdi-check-circle-outline" />
                </template>
              </q-input>
            </div>

            <div
              v-if="errorMessage"
              class="col-12"
            >
              <q-banner
                dense
                rounded
                class="bg-red-1 text-negative"
              >
                <template #avatar>
                  <q-icon name="mdi-alert-circle-outline" />
                </template>

                {{ errorMessage }}
              </q-banner>
            </div>

            <div
              v-if="successMessage"
              class="col-12"
            >
              <q-banner
                dense
                rounded
                class="bg-green-1 text-positive"
              >
                <template #avatar>
                  <q-icon name="mdi-check-circle-outline" />
                </template>

                {{ successMessage }}
              </q-banner>
            </div>

            <div
              v-if="editing"
              class="col-12 row q-gutter-sm"
            >
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
import type { Organization } from '~/types/api'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: ['OWNER', 'ADMIN', 'MANAGER'],
})

const api = useApi()

const company = ref<Organization | null>(null)
const loading = ref(false)
const editing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  name: '',
  slug: '',
})

const originalForm = reactive({
  name: '',
  slug: '',
})

const fetchCompany = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api<Organization>(
      '/organizations/me',
    )

    company.value = response

    form.name = response.name
    form.slug = response.slug

    originalForm.name = response.name
    originalForm.slug = response.slug
  } catch (error) {
    console.error(error)

    errorMessage.value =
      'Não foi possível carregar os dados da empresa.'
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  successMessage.value = ''
  errorMessage.value = ''

  originalForm.name = form.name
  originalForm.slug = form.slug

  editing.value = true
}

const cancelEditing = () => {
  form.name = originalForm.name
  form.slug = originalForm.slug

  errorMessage.value = ''
  editing.value = false
}

const handleSave = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.name.trim()) {
    errorMessage.value =
      'Informe o nome da empresa.'
    return
  }

  if (!form.slug.trim()) {
    errorMessage.value =
      'Informe o identificador da empresa.'
    return
  }

  loading.value = true

  try {
    const response = await api<Organization>(
      '/organizations/me',
      {
        method: 'PATCH',
        body: {
          name: form.name.trim(),
          slug: form.slug.trim(),
        },
      },
    )

    company.value = response

    form.name = response.name
    form.slug = response.slug

    originalForm.name = response.name
    originalForm.slug = response.slug

    editing.value = false

    successMessage.value =
      'Dados da empresa atualizados com sucesso.'
  } catch (error) {
    console.error(error)

    errorMessage.value =
      'Não foi possível atualizar os dados da empresa.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchCompany)
</script>