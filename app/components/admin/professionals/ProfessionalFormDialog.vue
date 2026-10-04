<template>
  <q-dialog v-model="model" persistent @hide="resetForm">
    <q-card class="wrapper" style="width: 600px; max-width: 95vw">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">
          {{ isEditing ? 'Editar profissional' : 'Novo profissional' }}
        </div>

        <q-btn
          flat
          round
          dense
          icon="mdi-close"
          :disable="saving || uploadingAvatar"
          @click="model = false"
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="handleSubmit">
          <!-- Avatar -->
          <div class="row items-center q-col-gutter-md">
            <div class="col-auto">
              <q-avatar
                size="96px"
                color="grey-2"
                text-color="grey-7"
                class="q-mb-md"
              >
                <img
                  v-if="form.avatarUrl"
                  :src="form.avatarUrl"
                  alt="Foto do profissional"
                  class="q-mb-md"
                />

                <q-icon v-else name="mdi-account-outline" size="48px" />
              </q-avatar>
            </div>

            <div class="col">
              <q-file
                v-model="avatarFile"
                outlined
                dense
                clearable
                accept="image/jpeg,image/png,image/webp"
                :max-file-size="5 * 1024 * 1024"
                label="Foto do profissional"
                hint="JPG, PNG ou WebP • máximo 5 MB"
                :loading="uploadingAvatar"
                :disable="saving || uploadingAvatar"
                @update:model-value="handleAvatarSelected"
                @rejected="handleAvatarRejected"
              >
                <template #prepend>
                  <q-icon name="mdi-camera-outline" />
                </template>
              </q-file>

              <div
                v-if="uploadingAvatar"
                class="text-caption text-grey-7 q-mt-xs"
              >
                Processando e enviando imagem...
              </div>

              <q-btn
                v-if="form.avatarUrl && !uploadingAvatar"
                flat
                dense
                no-caps
                color="negative"
                icon="mdi-delete-outline"
                label="Remover foto"
                class="q-mt-xs"
                @click="removeAvatar"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.firstName"
                outlined
                dense
                label="Nome *"
                :rules="[(value) => !!value || 'Informe o nome']"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.lastName"
                outlined
                dense
                label="Sobrenome *"
                :rules="[(value) => !!value || 'Informe o sobrenome']"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.email"
                outlined
                dense
                type="email"
                label="E-mail"
                :rules="[(value) => !!value || 'Informe o e-mail']"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.phone"
                outlined
                dense
                label="Telefone"
                mask="(##) #####-####"
                :rules="[(value) => !!value || 'Informe o telefone']"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.storeId"
                outlined
                dense
                emit-value
                map-options
                label="Loja *"
                :options="storeOptions"
                :rules="[(value) => !!value || 'Selecione uma loja']"
              />
            </div>
            <div class="col-12">
              <q-select
                v-model="form.serviceIds"
                outlined
                dense
                multiple
                use-chips
                emit-value
                map-options
                label="Serviços que realiza"
                :options="serviceOptions"
                :loading="loadingServices"
                :disable="!form.storeId || loadingServices"
                hint="Somente serviços ativos disponibilizados para a loja selecionada."
              />
              <div
                v-if="form.storeId && !loadingServices && !serviceOptions.length"
                class="text-caption text-grey-7 q-mt-sm"
              >
                Nenhum serviço ativo está disponível nesta loja. Primeiro
                vincule serviços a ela na tela de Serviços.
              </div>
            </div>
            <div class="col-12">
              <q-input
                v-model="form.description"
                outlined
                type="textarea"
                autogrow
                label="Descrição"
              />
            </div>
          </div>

          <q-toggle
            v-if="isEditing"
            v-model="isActive"
            label="Profissional ativo"
          />

          <div class="row justify-end q-gutter-sm q-pt-sm">
            <q-btn
              flat
              no-caps
              label="Cancelar"
              :disable="saving || uploadingAvatar"
              @click="model = false"
            />

            <q-btn
              color="primary"
              unelevated
              no-caps
              type="submit"
              :loading="saving"
              :disable="uploadingAvatar"
              label="Salvar"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type {
  Professional,
  Service,
  Store,
  StoreServiceOption,
} from '~/types/api'

interface Props {
  modelValue: boolean
  professional?: Professional | null
}

interface Emits {
  (event: 'update:modelValue', value: boolean): void
  (event: 'saved', professional: Professional): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const $q = useQuasar()

const { createProfessional, updateProfessional } = useProfessionals()
const { stores, fetchStores } = useStores()
const api = useApi()

const { compress } = useImageCompression()
const { upload: uploadCloudinary, loading: uploadingAvatar } =
  useCloudinaryUpload()

const model = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  },
})

const saving = ref(false)
const avatarFile = ref<File | null>(null)

const form = reactive({
  storeId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  description: '',
  avatarUrl: '',
  serviceIds: [] as string[],
})

const isEditing = computed(() => !!props.professional)
const availableServices = ref<Service[]>([])
const loadingServices = ref(false)

const status = ref<'ACTIVE' | 'INACTIVE'>('ACTIVE')

const isActive = computed({
  get: () => status.value === 'ACTIVE',
  set: (value: boolean) => {
    status.value = value
      ? 'ACTIVE'
      : 'INACTIVE'
  },
})

const storeOptions = computed(() =>
  stores.value.map((store: Store) => ({
    label: store.name,
    value: store.id,
  })),
)

const serviceOptions = computed(() => {
  const options = availableServices.value.map((service) => ({
    label: service.name,
    value: service.id,
  }))
  const availableIds = new Set(options.map(({ value }) => value))

  for (const association of props.professional?.services ?? []) {
    if (
      form.serviceIds.includes(association.serviceId) &&
      !availableIds.has(association.serviceId)
    ) {
      options.push({
        label: `${association.service.name} (indisponível nesta loja)`,
        value: association.serviceId,
      })
    }
  }

  return options
})

const resetForm = () => {
  avatarFile.value = null

  form.storeId = ''
  form.firstName = ''
  form.lastName = ''
  form.email = ''
  form.phone = ''
  form.description = ''
  form.avatarUrl = ''
  form.serviceIds = []
  availableServices.value = []
  status.value = 'ACTIVE'
}

const populateForm = () => {
  resetForm()

  if (!props.professional) {
    return
  }

  form.storeId = props.professional.storeId
  form.firstName = props.professional.firstName ?? ''
  form.lastName = props.professional.lastName ?? ''
  form.email = props.professional.email ?? ''
  form.phone = props.professional.phone ?? ''
  form.description = props.professional.description ?? ''
  form.avatarUrl = props.professional.avatarUrl ?? ''
  form.serviceIds =
    props.professional.services?.map(({ serviceId }) => serviceId) ?? []

  status.value = props.professional.status ?? 'ACTIVE'
}

const handleAvatarSelected = async (file: File | null) => {
  if (!file) {
    return
  }

  try {
    const compressedFile = await compress(file, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.82,
      mimeType: 'image/webp',
    })

    const result = await uploadCloudinary(compressedFile, 'professional')

    form.avatarUrl = result.secureUrl

    $q.notify({
      type: 'positive',
      message: 'Foto enviada com sucesso.',
    })
  } catch (error: any) {
    avatarFile.value = null

    $q.notify({
      type: 'negative',
      message:
        error?.data?.message ??
        error?.message ??
        'Não foi possível enviar a foto.',
    })
  }
}

const handleAvatarRejected = () => {
  avatarFile.value = null

  $q.notify({
    type: 'negative',
    message: 'Imagem inválida. Utilize JPG, PNG ou WebP com no máximo 5 MB.',
  })
}

const removeAvatar = () => {
  form.avatarUrl = ''
  avatarFile.value = null
}

let serviceRequest = 0
const loadStoreServices = async (storeId: string) => {
  const request = ++serviceRequest

  if (!storeId) {
    availableServices.value = []
    loadingServices.value = false
    return
  }

  availableServices.value = []
  loadingServices.value = true

  try {
    const associations = await api<StoreServiceOption[]>(
      `/stores/${encodeURIComponent(storeId)}/services`,
    )

    if (request === serviceRequest) {
      availableServices.value = associations
        .map(({ service }) => service)
        .filter((service) => service.status === 'ACTIVE')
    }
  } catch (error) {
    if (request === serviceRequest) {
      $q.notify({
        type: 'negative',
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os serviços desta loja.',
      })
    }
  } finally {
    if (request === serviceRequest) {
      loadingServices.value = false
    }
  }
}

const handleSubmit = async () => {
  if (!form.firstName.trim()) {
    $q.notify({
      type: 'negative',
      message: 'Informe o nome do profissional.',
    })

    return
  }

  if (!form.lastName.trim()) {
    $q.notify({
      type: 'negative',
      message: 'Informe o sobrenome do profissional.',
    })

    return
  }

  if (!form.storeId) {
    $q.notify({
      type: 'negative',
      message: 'Selecione uma loja.',
    })

    return
  }

  saving.value = true

  try {
    if (isEditing.value && props.professional) {
      const updated = await updateProfessional(props.professional.id, {
        storeId: form.storeId,
        serviceIds: form.serviceIds,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        description: form.description.trim() || undefined,
        avatarUrl: form.avatarUrl || undefined,
        status: status.value,
      })

      emit('saved', updated)
    } else {
      const created = await createProfessional({
        storeId: form.storeId,
        serviceIds: form.serviceIds,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        description: form.description.trim() || undefined,
        avatarUrl: form.avatarUrl || undefined,
      })

      emit('saved', created)
    }

    $q.notify({
      type: 'positive',
      message: isEditing.value
        ? 'Profissional atualizado com sucesso.'
        : 'Profissional criado com sucesso.',
    })

    model.value = false
  } catch (error: any) {
    const message = Array.isArray(error?.data?.message)
      ? error.data.message.join(', ')
      : (error?.data?.message ??
        error?.message ??
        'Não foi possível salvar o profissional.')

    $q.notify({
      type: 'negative',
      message,
    })
  } finally {
    saving.value = false
  }
}

watch(
  () => props.professional,
  () => {
    if (model.value) {
      populateForm()
    }
  },
  {
    immediate: true,
  },
)

watch(
  () => form.storeId,
  async (storeId, previousStoreId) => {
    await loadStoreServices(storeId)

    if (previousStoreId && previousStoreId !== storeId) {
      const availableIds = new Set(
        availableServices.value.map(({ id }) => id),
      )
      form.serviceIds = form.serviceIds.filter((id) => availableIds.has(id))
    }
  },
)

watch(model, async (isOpen) => {
  if (!isOpen) {
    return
  }

  populateForm()

  if (!stores.value.length) {
    await fetchStores()
  }
})
</script>
