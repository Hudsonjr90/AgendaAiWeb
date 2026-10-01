<template>
  <q-dialog v-model="model" persistent @hide="handleClose">
    <q-card class="store-form-card">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6 text-weight-medium">
          {{ store ? 'Editar loja' : 'Nova loja' }}
        </div>

        <q-btn flat round dense icon="mdi-close" @click="model = false" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-lg">
        <q-form class="q-gutter-y-md" @submit="handleSubmit">
          <!-- Dados da loja -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-8">
              <q-input
                v-model="form.name"
                outlined
                dense
                label="Nome"
                :rules="[(value) => !!value || 'Informe o nome da loja.']"
              />
            </div>

            <div class="col-12 col-sm-4">
              <q-input
                v-model="form.slug"
                outlined
                dense
                label="Slug"
                hint="Ex.: barbearia-centro"
                :rules="[(value) => !!value || 'Informe o slug.']"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.description"
                outlined
                dense
                label="Descrição"
                type="textarea"
                autogrow
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.phone"
                outlined
                dense
                label="Telefone"
                mask="(##) #####-####"
                :rules="[(value) => !!value || 'Informe o telefone.']"
              />
            </div>
          </div>

          <!-- Endereço -->
          <div class="q-mt-lg">
            <div class="text-subtitle1 text-weight-medium q-mb-md">
              Endereço
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.postalCode"
                  outlined
                  dense
                  label="CEP"
                  mask="#####-###"
                  :loading="viaCepLoading"
                  @blur="handleCepBlur"
                />
              </div>

              <div class="col-12 col-sm-8">
                <q-input
                  v-model="form.street"
                  outlined
                  dense
                  label="Logradouro"
                />
              </div>

              <div class="col-12 col-sm-4">
                <q-input v-model="form.number" outlined dense label="Número" />
              </div>

              <div class="col-12 col-sm-8">
                <q-input
                  v-model="form.complement"
                  outlined
                  dense
                  label="Complemento"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.neighborhood"
                  outlined
                  dense
                  label="Bairro"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input v-model="form.city" outlined dense label="Cidade" />
              </div>

              <div class="col-12 col-sm-4">
                <q-input v-model="form.state" outlined dense label="Estado" />
              </div>

              <div class="col-12 col-sm-4">
                <q-input v-model="form.country" outlined dense label="País" />
              </div>

              <div class="col-12 col-sm-4">
                <q-btn
                  class="full-width"
                  color="primary"
                  outline
                  no-caps
                  icon="mdi-map-marker-plus-outline"
                  label="Localizar no mapa"
                  :loading="geocodingLoading"
                  :disable="!canGeocode"
                  @click="handleGeocode"
                />
              </div>
            </div>
          </div>

          <!-- Localização -->
          <div
            v-if="form.latitude !== null && form.longitude !== null"
            class="q-mt-md"
          >
            <StoreMap
              :latitude="form.latitude"
              :longitude="form.longitude"
              @update:coordinates="handleCoordinatesUpdate"
            />
          </div>

          <q-banner v-else class="bg-grey-2 text-grey-8 q-mt-md" rounded>
            <template #avatar>
              <q-icon
                name="mdi-map-marker-outline"
                color="primary"
                size="28px"
              />
            </template>

            Informe o endereço e clique em
            <strong>Localizar no mapa</strong>
            para definir a localização da loja.
          </q-banner>

          <!-- Ações -->
          <div class="row justify-end items-center q-gutter-sm q-mt-lg">
            <q-btn flat no-caps label="Cancelar" @click="model = false" />

            <q-btn
              color="primary"
              unelevated
              no-caps
              type="submit"
              :loading="saving"
              :label="store ? 'Salvar alterações' : 'Criar loja'"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { QForm } from 'quasar'
import type { Store } from '~/types/api'
import type { CreateStorePayload } from '~/composables/useStores'
import StoreMap from '~/components/admin/stores/StoreMap.vue'
import { useQuasar } from 'quasar'

interface Props {
  store?: Store | null
}

const props = withDefaults(defineProps<Props>(), {
  store: null,
})

const emit = defineEmits<{
  saved: [store: Store]
}>()

const model = defineModel<boolean>({
  default: false,
})

const $q = useQuasar()

const { createStore, updateStore } = useStores()
const { loading: viaCepLoading, findByCep } = useViaCep()
const { loading: geocodingLoading, geocode } = useGeocoding()
const formRef = ref<QForm | null>(null)
const saving = ref(false)
const loading = ref(false)
const cepFound = ref(false)
const createEmptyForm = (): CreateStorePayload => ({
  name: '',
  slug: '',
  description: '',
  phone: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'BR',
  latitude: null,
  longitude: null,
})

const form = reactive<CreateStorePayload>(createEmptyForm())

const canGeocode = computed(() => {
  return Boolean(
    form.street?.trim() &&
    form.number?.trim() &&
    form.neighborhood?.trim() &&
    form.city?.trim() &&
    form.state?.trim() &&
    form.postalCode?.trim(),
  )
})

const resetForm = () => {
  Object.assign(
    form,
    props.store
      ? {
          name: props.store.name,
          slug: props.store.slug,
          description: props.store.description ?? '',
          phone: props.store.phone ?? '',

          street: props.store.street ?? '',
          number: props.store.number ?? '',
          complement: props.store.complement ?? '',
          neighborhood: props.store.neighborhood ?? '',
          city: props.store.city ?? '',
          state: props.store.state ?? '',
          postalCode: props.store.postalCode ?? '',
          country: props.store.country ?? 'BR',

          latitude: props.store.latitude ?? null,
          longitude: props.store.longitude ?? null,
        }
      : createEmptyForm(),
  )

  cepFound.value = false
}

const handleCepBlur = async () => {
  const cleanCep = form.postalCode.replace(/\D/g, '')

  if (cleanCep.length !== 8) {
    cepFound.value = false
    return
  }

  try {
    const address = await findByCep(form.postalCode)

    if (!address) {
      cepFound.value = false

      $q.notify({
        type: 'warning',
        message: 'CEP não encontrado.',
        icon: 'mdi-map-marker-question-outline',
      })

      return
    }

    form.street = address.logradouro ?? ''
    form.neighborhood = address.bairro ?? ''
    form.city = address.localidade ?? ''
    form.state = address.uf ?? ''

    cepFound.value = true

    if (form.number) {
      await handleGeocode()
    }
  } catch {
    cepFound.value = false

    $q.notify({
      type: 'negative',
      message: 'Não foi possível consultar o CEP.',
      icon: 'mdi-alert-circle-outline',
    })
  }
}

const handleGeocode = async () => {
  if (!canGeocode.value) {
    return
  }

  try {
    const result = await geocode({
      street: form.street,
      number: form.number,
      complement: form.complement || undefined,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country || 'BR',
    })

    form.latitude = result.latitude
    form.longitude = result.longitude
  } catch {
    form.latitude = null
    form.longitude = null

    $q.notify({
      type: 'warning',
      message:
        'Não foi possível localizar este endereço no mapa. Confira os dados informados.',
      icon: 'mdi-map-marker-question-outline',
    })
  }
}

const handleCoordinatesUpdate = ({
  latitude,
  longitude,
}: {
  latitude: number
  longitude: number
}) => {
  form.latitude = latitude
  form.longitude = longitude
}

const handleSubmit = async () => {
  if (!canGeocode.value) {
    $q.notify({
      type: 'warning',
      message: 'Preencha o endereço completo antes de localizar a loja.',
    })

    return
  }

  saving.value = true

  try {
    if (form.latitude === null || form.longitude === null) {
      await handleGeocode()
    }

    if (form.latitude === null || form.longitude === null) {
      return
    }

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      phone: form.phone?.replace(/\D/g, '') || undefined,
      street: form.street,
      number: form.number,
      complement: form.complement || undefined,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
      latitude: form.latitude,
      longitude: form.longitude,
    }

    const savedStore = props.store
      ? await updateStore(props.store.id, payload)
      : await createStore(payload)

    $q.notify({
      type: 'positive',
      message: props.store
        ? 'Loja atualizada com sucesso.'
        : 'Loja criada com sucesso.',
    })

    emit('saved', savedStore)
    model.value = false
  } catch (error: unknown) {
    const message =
      error &&
      typeof error === 'object' &&
      'data' in error &&
      typeof error.data === 'object' &&
      error.data !== null &&
      'message' in error.data
        ? String(error.data.message)
        : 'Não foi possível criar a loja.'

    $q.notify({
      type: 'negative',
      message,
    })
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  if (!loading.value) {
    formRef.value?.resetValidation()
    resetForm()
  }
}

watch(
  () => [model.value, props.store],
  () => {
    if (model.value) {
      resetForm()
    }
  },
  {
    immediate: true,
  },
)
</script>
<style scoped>
.store-form-card {
  width: 900px;
  max-width: 95vw;
}
</style>