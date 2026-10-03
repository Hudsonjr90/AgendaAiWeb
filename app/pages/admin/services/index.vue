
<template>
  <q-page padding class="wrapper">
    <div class="row items-center justify-between q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm">
        <div class="text-h5 text-weight-bold">Serviços</div>
        <div class="text-body2 text-grey-7">
          Gerencie os serviços oferecidos pela sua empresa.
        </div>
      </div>

      <div class="col-12 col-sm-auto">
        <q-btn
          color="primary"
          icon="mdi-plus"
          label="Novo serviço"
          no-caps
          unelevated
          class="full-width"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">Total de serviços</div>
            <div class="text-h4 text-weight-bold">{{ services.length }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">Serviços ativos</div>
            <div class="text-h4 text-weight-bold text-positive">
              {{ activeServices }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">Duração média</div>
            <div class="text-h4 text-weight-bold">
              {{ averageDuration }} min
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section class="row items-center q-col-gutter-md">
        <div class="col-12 col-md">
          <q-input
            v-model="filter"
            outlined
            dense
            clearable
            placeholder="Buscar por nome ou descrição"
          >
            <template #prepend>
              <q-icon name="mdi-magnify" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-auto">
          <q-btn
            flat
            color="primary"
            icon="mdi-refresh"
            no-caps
            label="Atualizar"
            :loading="loading"
            @click="loadServices"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-table
        flat
        :rows="filteredServices"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="Nenhum serviço cadastrado"
        loading-label="Carregando serviços..."
      >
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.name }}</div>
            <div class="text-caption text-grey-7 ellipsis">
              {{ props.row.description || 'Sem descrição' }}
            </div>
          </q-td>
        </template>

        <template #body-cell-durationMinutes="props">
          <q-td :props="props">
            {{ props.row.durationMinutes }} min
          </q-td>
        </template>

        <template #body-cell-priceCents="props">
          <q-td :props="props">
            {{ formatCurrency(props.row.priceCents) }}
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.status === 'ACTIVE' ? 'positive' : 'grey'"
              :label="props.row.status === 'ACTIVE' ? 'Ativo' : 'Inativo'"
            />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" auto-width>
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="mdi-pencil"
              aria-label="Editar serviço"
              @click="openEditDialog(props.row)"
            >
              <q-tooltip>Editar serviço</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              color="negative"
              icon="mdi-delete"
              aria-label="Excluir serviço"
              @click="openDeleteDialog(props.row)"
            >
              <q-tooltip>Excluir serviço</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="formDialog" persistent>
      <q-card style="width: 560px; max-width: 95vw">
        <q-form @submit.prevent="saveService">
          <q-card-section class="row items-center">
            <div class="text-h6">
              {{ editingService ? 'Editar serviço' : 'Novo serviço' }}
            </div>
            <q-space />
            <q-btn v-close-popup flat round dense icon="mdi-close" />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-gutter-md">
            <q-input
              v-model.trim="form.name"
              outlined
              label="Nome do serviço"
              maxlength="100"
              counter
              :rules="[
                (value) => !!value && value.trim().length >= 2
                  || 'Informe ao menos 2 caracteres',
              ]"
              autofocus
            />

            <q-input
              v-model="form.description"
              outlined
              type="textarea"
              label="Descrição"
              maxlength="500"
              counter
              autogrow
            />

            <div class="row q-col-gutter-md q-mt-xs q-ml-xs">
              <div class="col-12 col-sm-4">
                <q-input
                  v-model.number="form.durationMinutes"
                  outlined
                  type="number"
                  min="1"
                  label="Duração (minutos)"
                  :rules="[
                    (value) => Number.isInteger(Number(value))
                      && Number(value) >= 1
                      || 'Informe uma duração válida',
                  ]"
                  class="full-width"
                />
              </div>

              <div class="col-12 col-sm-4">
                <q-input
                  v-model.number="form.price"
                  outlined
                  type="number"
                  min="0"
                  step="0.01"
                  prefix="R$"
                  label="Preço"
                  :rules="[
                    (value) => Number.isFinite(Number(value))
                      && Number(value) >= 0
                      || 'Informe um preço válido',
                  ]"
                  class="full-width"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              v-close-popup
              flat
              label="Cancelar"
              no-caps
              color="grey-7"
              :disable="saving"
            />
            <q-btn
              type="submit"
              color="primary"
              unelevated
              no-caps
              :label="editingService ? 'Salvar alterações' : 'Cadastrar serviço'"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialog" persistent>
      <q-card style="width: 420px; max-width: 95vw">
        <q-card-section class="row items-center q-gutter-sm">
          <q-icon name="mdi-alert" color="negative" size="md" />
          <div class="text-h6">Excluir serviço</div>
        </q-card-section>

        <q-card-section>
          Deseja realmente excluir
          <strong>{{ selectedService?.name }}</strong>?<br />
          Essa ação será processada imediatamente e não poderá ser desfeita.
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            no-caps
            v-close-popup
            :disable="deleting"
          />
          <q-btn
            color="negative"
            unelevated
            no-caps
            label="Excluir"
            :loading="deleting"
            @click="deleteService"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { getErrorMessage } from '~/utils/global'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: ['OWNER', 'ADMIN', 'MANAGER'],
})

interface Service {
  id: string
  organizationId: string
  name: string
  description: string | null
  durationMinutes: number
  priceCents: number
  status: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  updatedAt?: string
}

interface ServicePayload {
  name: string
  description?: string
  durationMinutes: number
  priceCents: number
}

const api = useApi()
const $q = useQuasar()

const services = ref<Service[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const filter = ref('')

const formDialog = ref(false)
const deleteDialog = ref(false)
const editingService = ref<Service | null>(null)
const selectedService = ref<Service | null>(null)

const emptyForm = () => ({
  name: '',
  description: '',
  durationMinutes: 30,
  price: 0,
})

const form = reactive(emptyForm())

const columns = [
  {
    name: 'name',
    label: 'Serviço',
    field: 'name',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'durationMinutes',
    label: 'Duração',
    field: 'durationMinutes',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'priceCents',
    label: 'Preço',
    field: 'priceCents',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'left' as const,
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'right' as const,
  },
]

const filteredServices = computed(() => {
  const term = filter.value.trim().toLocaleLowerCase('pt-BR')

  if (!term) return services.value

  return services.value.filter((service) =>
    `${service.name} ${service.description ?? ''}`
      .toLocaleLowerCase('pt-BR')
      .includes(term),
  )
})

const activeServices = computed(() =>
  services.value.filter((service) => service.status === 'ACTIVE').length,
)

const averageDuration = computed(() => {
  if (!services.value.length) return 0

  return Math.round(
    services.value.reduce((total, service) => total + service.durationMinutes, 0)
      / services.value.length,
  )
})

function formatCurrency(priceCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceCents / 100)
}

function notifyError(error: unknown, fallback: string) {
  $q.notify({
    type: 'negative',
    message: getErrorMessage(error, fallback),
  })
}

async function loadServices() {
  loading.value = true

  try {
    services.value = await api<Service[]>('/services', {
      method: 'GET',
    })
  } catch (error) {
    notifyError(error, 'Não foi possível carregar os serviços.')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, emptyForm())
  editingService.value = null
}

function openCreateDialog() {
  resetForm()
  formDialog.value = true
}

function openEditDialog(service: Service) {
  editingService.value = service
  Object.assign(form, {
    name: service.name,
    description: service.description ?? '',
    durationMinutes: service.durationMinutes,
    price: service.priceCents / 100,
  })
  formDialog.value = true
}

async function saveService() {
  if (saving.value) return

  const payload: ServicePayload = {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    durationMinutes: Number(form.durationMinutes),
    priceCents: Math.round(Number(form.price) * 100),
  }

  saving.value = true

  try {
    if (editingService.value) {
      await api(`/services/${editingService.value.id}`, {
        method: 'PATCH',
        body: payload,
      })
      $q.notify({
        type: 'positive',
        message: 'Serviço atualizado com sucesso.',
      })
    } else {
      await api('/services', {
        method: 'POST',
        body: payload,
      })
      $q.notify({
        type: 'positive',
        message: 'Serviço cadastrado com sucesso.',
      })
    }

    formDialog.value = false
    await loadServices()
  } catch (error) {
    notifyError(error, 'Não foi possível salvar o serviço.')
  } finally {
    saving.value = false
  }
}

function openDeleteDialog(service: Service) {
  selectedService.value = service
  deleteDialog.value = true
}

async function deleteService() {
  if (!selectedService.value || deleting.value) return

  deleting.value = true

  try {
    await api(`/services/${selectedService.value.id}`, {
      method: 'DELETE',
    })

    deleteDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Serviço excluído com sucesso.',
    })
    await loadServices()
  } catch (error) {
    notifyError(error, 'Não foi possível excluir o serviço.')
  } finally {
    deleting.value = false
  }
}

onMounted(loadServices)
</script>
