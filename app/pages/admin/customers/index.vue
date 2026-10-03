<template>
  <q-page padding class="wrapper">
    <div class="row items-center justify-between q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm">
        <div class="text-h5 text-weight-bold">Clientes</div>
        <div class="text-body2 text-grey-7">
          Consulte e gerencie os clientes da sua organização.
        </div>
      </div>

      <div class="col-12 col-sm-auto">
        <q-btn
          color="primary"
          icon="mdi-account-plus-outline"
          label="Novo cliente"
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
            <div class="text-caption text-grey-7">Total de clientes</div>
            <div class="text-h4 text-weight-bold">{{ customers.length }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">Ativos</div>
            <div class="text-h4 text-weight-bold text-positive">
              {{ countByStatus('ACTIVE') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">
              Inativos ou bloqueados
            </div>
            <div class="text-h4 text-weight-bold text-grey-8">
              {{ customers.length - countByStatus('ACTIVE') }}
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
            placeholder="Buscar por nome, e-mail ou telefone"
          >
            <template #prepend>
              <q-icon name="mdi-magnify" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="statusFilter"
            outlined
            dense
            emit-value
            map-options
            :options="statusFilterOptions"
            label="Status"
            clearable
          />
        </div>

        <div class="col-12 col-sm-auto">
          <q-btn
            flat
            color="primary"
            icon="mdi-refresh"
            label="Atualizar"
            no-caps
            :loading="loading"
            @click="loadCustomers"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-table
        flat
        :rows="filteredCustomers"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="Nenhum cliente encontrado"
        loading-label="Carregando clientes..."
      >
        <template #body-cell-customer="props">
          <q-td :props="props">
            <div class="row items-center no-wrap q-gutter-sm">
              <div class="column">
                <span class="text-weight-medium">
                  {{ fullName(props.row) }}
                </span>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-email="props">
          <q-td :props="props">
            {{ props.row.email || 'Sem e-mail informado' }}
          </q-td>
        </template>

        <template #body-cell-cpf="props">
          <q-td :props="props">
            {{ cpfFormat(props.row.cpf) || '—' }}
          </q-td>
        </template>

        <template #body-cell-phone="props">
          <q-td :props="props">
            {{ phoneFormat(props.row.phone) || '—' }}
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="statusColor(props.row.status)"
              :label="statusLabel(props.row.status)"
            />
          </q-td>
        </template>

        <template #body-cell-createdAt="props">
          <q-td :props="props">
            {{ formatDate(props.row.createdAt) }}
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" auto-width>
            <q-btn
              flat
              round
              dense
              color="grey-8"
              icon="mdi-eye-outline"
              aria-label="Visualizar cliente"
              @click="openDetailsDialog(props.row)"
            >
              <q-tooltip>Visualizar</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              color="primary"
              icon="mdi-pencil-outline"
              aria-label="Editar cliente"
              @click="openEditDialog(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              color="negative"
              icon="mdi-delete-outline"
              aria-label="Excluir cliente"
              @click="openDeleteDialog(props.row)"
            >
              <q-tooltip>Excluir</q-tooltip>
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
        <q-form @submit.prevent="saveCustomer">
          <q-card-section class="row items-center">
            <div class="text-h6">
              {{ editingCustomer ? 'Editar cliente' : 'Novo cliente' }}
            </div>
            <q-space />
            <q-btn v-close-popup flat round dense icon="mdi-close" />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-gutter-md">
            <div class="row q-col-gutter-md q-ml-xs q-mt-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.trim="form.firstName"
                  outlined
                  label="Nome"
                  maxlength="100"
                  :rules="[
                    (value) =>
                      (!!value && value.trim().length >= 2) ||
                      'Informe o nome',
                  ]"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model.trim="form.lastName"
                  outlined
                  label="Sobrenome"
                  maxlength="100"
                  :rules="[
                    (value) =>
                      (!!value && value.trim().length >= 2) ||
                      'Informe o sobrenome',
                  ]"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md q-ml-xs q-mt-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.trim="form.cpf"
                  outlined
                  label="CPF"
                  mask="###.###.###-##"
                  unmasked-value
                  :rules="[
                    (value) =>
                      !value ||
                      isValidCpf(value) ||
                      'Informe um CPF válido',
                  ]"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model.trim="form.email"
                  outlined
                  type="email"
                  label="E-mail"
                  maxlength="254"
                  :rules="[
                    (value) =>
                      !value ||
                      /.+@.+\..+/.test(value) ||
                      'Informe um e-mail válido',
                  ]"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md q-ml-xs q-mt-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.trim="form.phone"
                  outlined
                  label="Telefone"
                  mask="(##) #####-####"
                  unmasked-value
                  hint="DDD + número"
                  :rules="[
                    (value) =>
                      !value ||
                      /^\d{10,11}$/.test(value) ||
                      'Informe um telefone válido',
                  ]"
                />
              </div>
            </div>

            <q-select
              v-if="editingCustomer"
              v-model="form.status"
              outlined
              emit-value
              map-options
              label="Status"
              :options="customerStatusOptions"
            />
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              v-close-popup
              flat
              no-caps
              label="Cancelar"
              color="grey-7"
              :disable="saving"
            />

            <q-btn
              type="submit"
              color="primary"
              no-caps
              unelevated
              :label="
                editingCustomer ? 'Salvar alterações' : 'Cadastrar cliente'
              "
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="detailsDialog">
      <q-card style="width: 500px; max-width: 95vw">
        <q-card-section class="row items-center">
          <div class="text-h6">Dados do cliente</div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="mdi-close" />
        </q-card-section>

        <q-separator />

        <q-card-section
          v-if="selectedCustomer"
          class="q-gutter-md"
        >
          <div class="row items-center q-gutter-md">
            <q-avatar
              color="primary"
              text-color="white"
              size="56px"
            >
              {{ initials(selectedCustomer) }}
            </q-avatar>

            <div>
              <div class="text-h6">
                {{ fullName(selectedCustomer) }}
              </div>

              <q-badge
                class="q-py-xs"
                :color="statusColor(selectedCustomer.status)"
                :label="statusLabel(selectedCustomer.status)"
              />
            </div>
          </div>

          <q-separator />

          <div>
            <div class="text-caption text-grey-7">E-mail</div>
            <div>
              {{ selectedCustomer.email || 'Não informado' }}
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-7">Telefone</div>
            <div>
              {{ phoneFormat(selectedCustomer.phone || 'Não informado') }}
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-7">CPF</div>
            <div>
              {{ cpfFormat(selectedCustomer.cpf || 'Não informado') }}
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-7">Cadastrado em</div>
            <div>
              {{ formatDate(selectedCustomer.createdAt) }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            v-close-popup
            color="primary"
            label="Fechar"
            no-caps
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialog" persistent>
      <q-card style="width: 420px; max-width: 95vw">
        <q-card-section class="row items-center q-gutter-sm">
          <q-icon
            name="mdi-delete"
            color="negative"
            size="md"
          />
          <div class="text-h6">Excluir cliente</div>
        </q-card-section>

        <q-card-section>
          Deseja realmente excluir
          <strong>
            {{
              selectedCustomer
                ? fullName(selectedCustomer)
                : ''
            }}
          </strong>
          ?
          <br />
          A operação pode ser impedida caso existam vínculos relacionados.
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            v-close-popup
            no-caps
            flat
            label="Cancelar"
            color="grey-7"
            :disable="deleting"
          />

          <q-btn
            color="negative"
            unelevated
            no-caps
            label="Excluir"
            :loading="deleting"
            @click="deleteCustomer"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { phoneFormat, cpfFormat } from '../../../utils/global'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: ['OWNER', 'ADMIN', 'MANAGER'],
})

type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

interface Customer {
  id: string
  organizationId: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  cpf: string | null
  status: CustomerStatus
  createdAt: string
  updatedAt: string
}

const api = useApi()
const $q = useQuasar()

const customers = ref<Customer[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const filter = ref('')
const statusFilter = ref<CustomerStatus | null>(null)

const formDialog = ref(false)
const detailsDialog = ref(false)
const deleteDialog = ref(false)
const editingCustomer = ref<Customer | null>(null)
const selectedCustomer = ref<Customer | null>(null)

const emptyForm = () => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  cpf: '',
  status: 'ACTIVE' as CustomerStatus,
})

const form = reactive(emptyForm())

const columns = [
  {
    name: 'customer',
    label: 'Cliente',
    field: (row: Customer) =>
      `${row.firstName ?? ''} ${row.lastName ?? ''}`,
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'email',
    label: 'E-mail',
    field: 'email',
    align: 'left' as const,
  },
  {
    name: 'cpf',
    label: 'CPF',
    field: 'cpf',
    align: 'left' as const,
  },
  {
    name: 'phone',
    label: 'Telefone',
    field: 'phone',
    align: 'left' as const,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'left' as const,
  },
  {
    name: 'createdAt',
    label: 'Cadastro',
    field: 'createdAt',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'right' as const,
  },
]

const customerStatusOptions = [
  { label: 'Ativo', value: 'ACTIVE' },
  { label: 'Inativo', value: 'INACTIVE' },
  { label: 'Bloqueado', value: 'BLOCKED' },
]

const statusFilterOptions = [
  { label: 'Ativo', value: 'ACTIVE' },
  { label: 'Inativo', value: 'INACTIVE' },
  { label: 'Bloqueado', value: 'BLOCKED' },
]

const filteredCustomers = computed(() => {
  const term = filter.value
    .trim()
    .toLocaleLowerCase('pt-BR')

  return customers.value.filter((customer) => {
    const matchesStatus =
      !statusFilter.value ||
      customer.status === statusFilter.value

    const searchText = [
      customer.firstName,
      customer.lastName,
      customer.email,
      customer.phone,
    ]
      .join(' ')
      .toLocaleLowerCase('pt-BR')

    return (
      matchesStatus &&
      (!term || searchText.includes(term))
    )
  })
})

function countByStatus(status: CustomerStatus) {
  return customers.value.filter(
    (customer) => customer.status === status,
  ).length
}

function fullName(customer: Customer) {
  return (
    `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() ||
    'Cliente sem nome'
  )
}

function initials(customer: Customer) {
  return (
    fullName(customer)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toLocaleUpperCase('pt-BR'),
      )
      .join('') || 'C'
  )
}

function statusLabel(status: CustomerStatus) {
  const labels: Record<CustomerStatus, string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    BLOCKED: 'Bloqueado',
  }

  return labels[status]
}

function statusColor(status: CustomerStatus) {
  const colors: Record<CustomerStatus, string> = {
    ACTIVE: 'positive',
    INACTIVE: 'grey',
    BLOCKED: 'negative',
  }

  return colors[status]
}

function formatDate(value?: string) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(date)
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  const err = error as {
    data?: {
      message?: string | string[]
    }
    response?: {
      _data?: {
        message?: string | string[]
      }
    }
    message?: string
  }

  const message =
    err?.data?.message ??
    err?.response?._data?.message ??
    err?.message

  return Array.isArray(message)
    ? message.join(', ')
    : message || fallback
}

function notifyError(
  error: unknown,
  fallback: string,
) {
  $q.notify({
    type: 'negative',
    message: getErrorMessage(error, fallback),
  })
}

async function loadCustomers() {
  loading.value = true

  try {
    customers.value = await api<Customer[]>(
      '/customers',
      {
        method: 'GET',
      },
    )
  } catch (error) {
    notifyError(
      error,
      'Não foi possível carregar os clientes.',
    )
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, emptyForm())
  editingCustomer.value = null
}

function openCreateDialog() {
  resetForm()
  formDialog.value = true
}

function openEditDialog(customer: Customer) {
  editingCustomer.value = customer

  Object.assign(form, {
    firstName: customer.firstName ?? '',
    lastName: customer.lastName ?? '',
    email: customer.email ?? '',
    phone: customer.phone ?? '',
    cpf: customer.cpf ?? '',
    status: customer.status,
  })

  formDialog.value = true
}

function openDetailsDialog(customer: Customer) {
  selectedCustomer.value = customer
  detailsDialog.value = true
}

function openDeleteDialog(customer: Customer) {
  selectedCustomer.value = customer
  deleteDialog.value = true
}

async function saveCustomer() {
  if (saving.value) return

  saving.value = true

  try {
    if (editingCustomer.value) {
      await api(
        `/customers/${editingCustomer.value.id}`,
        {
          method: 'PATCH',
          body: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email:
              form.email.trim() || undefined,
            cpf:
              form.cpf.trim() || undefined,
            phone:
              form.phone.trim() || undefined,
            status: form.status,
          },
        },
      )

      $q.notify({
        type: 'positive',
        message:
          'Cliente atualizado com sucesso.',
      })
    } else {
      await api('/customers', {
        method: 'POST',
        body: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email:
            form.email.trim() || undefined,
          phone:
            form.phone.trim() || undefined,
          cpf:
            form.cpf.trim() || undefined,
        },
      })

      $q.notify({
        type: 'positive',
        message:
          'Cliente cadastrado com sucesso.',
      })
    }

    formDialog.value = false
    await loadCustomers()
  } catch (error) {
    notifyError(
      error,
      'Não foi possível salvar o cliente.',
    )
  } finally {
    saving.value = false
  }
}

async function deleteCustomer() {
  if (
    !selectedCustomer.value ||
    deleting.value
  ) {
    return
  }

  deleting.value = true

  try {
    await api(
      `/customers/${selectedCustomer.value.id}`,
      {
        method: 'DELETE',
      },
    )

    deleteDialog.value = false

    $q.notify({
      type: 'positive',
      message:
        'Cliente excluído com sucesso.',
    })

    await loadCustomers()
  } catch (error) {
    notifyError(
      error,
      'Não foi possível excluir o cliente.',
    )
  } finally {
    deleting.value = false
  }
}

onMounted(loadCustomers)
</script>