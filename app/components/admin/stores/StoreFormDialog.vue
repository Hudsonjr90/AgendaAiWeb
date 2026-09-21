<template>
  <q-dialog
    v-model="model"
    persistent
    @hide="handleClose"
  >
    <q-card style="width: 700px; max-width: 95vw">
      <q-card-section class="row items-center">
        <div class="text-h6">
          {{ isEditing ? 'Editar loja' : 'Nova loja' }}
        </div>

        <q-space />

        <q-btn
          v-close-popup
          flat
          round
          icon="mdi-close"
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form
          ref="formRef"
          class="q-gutter-md"
          @submit="handleSubmit"
        >
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-8">
              <q-input
                v-model="form.name"
                label="Nome *"
                outlined
                dense
                :rules="[
                  (value) => !!value || 'Informe o nome da loja.',
                  (value) =>
                    value.length >= 2 ||
                    'O nome deve ter pelo menos 2 caracteres.',
                ]"
              />
            </div>

            <div class="col-12 col-sm-4">
              <q-input
                v-model="form.slug"
                label="Slug *"
                outlined
                dense
                hint="Ex.: barbearia-centro"
                :rules="[
                  (value) => !!value || 'Informe o slug.',
                  (value) =>
                    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ||
                    'Use apenas letras minúsculas, números e hífens.',
                ]"
              />
            </div>
          </div>

          <q-input
            v-model="form.description"
            label="Descrição"
            type="textarea"
            outlined
            dense
            autogrow
          />

          <q-input
            v-model="form.phone"
            label="Telefone"
            outlined
            dense
            mask="(##) #####-####"
          />

          <div class="text-subtitle2 text-weight-medium q-mt-lg">
            Endereço
          </div>

          <q-input
            v-model="form.addressLine1"
            label="Endereço"
            outlined
            dense
          />

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.addressLine2"
                label="Complemento"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.neighborhood"
                label="Bairro"
                outlined
                dense
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-5">
              <q-input
                v-model="form.city"
                label="Cidade"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-sm-3">
              <q-input
                v-model="form.state"
                label="Estado"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-sm-4">
              <q-input
                v-model="form.postalCode"
                label="CEP"
                outlined
                dense
                mask="#####-###"
              />
            </div>
          </div>

          <q-input
            v-model="form.country"
            label="País"
            outlined
            dense
          />

          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn
              v-close-popup
              flat
              label="Cancelar"
              :disable="loading"
            />

            <q-btn
              color="primary"
              type="submit"
              :label="isEditing ? 'Salvar alterações' : 'Criar loja'"
              :loading="loading"
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

import type {
  CreateStorePayload,
  UpdateStorePayload,
} from '~/composables/useStores'

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

const formRef = ref<QForm | null>(null)
const loading = ref(false)

const isEditing = computed(() => !!props.store)

const createEmptyForm = (): CreateStorePayload => ({
  name: '',
  slug: '',
  description: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  neighborhood: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'BR',
})

const form = reactive<CreateStorePayload>(createEmptyForm())

const resetForm = () => {
  Object.assign(
    form,
    props.store
      ? {
          name: props.store.name,
          slug: props.store.slug,
          description: props.store.description ?? '',
          phone: props.store.phone ?? '',
          addressLine1: props.store.addressLine1 ?? '',
          addressLine2: props.store.addressLine2 ?? '',
          neighborhood: props.store.neighborhood ?? '',
          city: props.store.city ?? '',
          state: props.store.state ?? '',
          postalCode: props.store.postalCode ?? '',
          country: props.store.country ?? 'BR',
        }
      : createEmptyForm(),
  )
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()

  if (!valid) return

  loading.value = true

  try {
    const payload: CreateStorePayload = {
      ...form,
    }

    const store = isEditing.value
      ? await updateStore(
          props.store!.id,
          payload as UpdateStorePayload,
        )
      : await createStore(payload)

    emit('saved', store)

    model.value = false

    $q.notify({
      type: 'positive',
      message: isEditing.value
        ? 'Loja atualizada com sucesso.'
        : 'Loja criada com sucesso.',
      icon: 'mdi-check-circle-outline',
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: isEditing.value
        ? 'Não foi possível atualizar a loja.'
        : 'Não foi possível criar a loja.',
      icon: 'mdi-alert-circle-outline',
    })
  } finally {
    loading.value = false
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
  { immediate: true },
)
</script>