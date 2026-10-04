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
          icon="mdi-file-upload-outline"
          label="Importar clientes"
          no-caps
          unelevated
          class="full-width"
          @click="openImportDialog"
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

    <q-dialog v-model="importDialog" persistent>
      <q-card class="import-dialog">
        <q-card-section class="row items-center">
          <div>
            <div class="text-h6">Importar clientes</div>
            <div class="text-body2 text-grey-7">
              Importe até 1.000 registros por arquivo. Cadastros duplicados
              serão ignorados.
            </div>
          </div>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="mdi-close"
            aria-label="Fechar importação"
            :disable="importing"
            @click="closeImportDialog"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-file
            v-model="importFile"
            outlined
            clearable
            accept=".csv,.xls,.xlsx,.pdf"
            label="Arquivo CSV, XLS, XLSX ou PDF"
            hint="PDFs precisam conter texto selecionável. Limite de 10 MB."
            :max-file-size="10 * 1024 * 1024"
            :loading="parsingFile"
            :disable="importing"
            @update:model-value="parseImportFile"
            @rejected="notifyRejectedFile"
          >
            <template #prepend>
              <q-icon name="mdi-file-table-outline" />
            </template>
          </q-file>

          <template v-if="rawHeaders.length">
            <div class="text-subtitle1 text-weight-medium">
              Relacione as colunas do arquivo aos dados dos clientes
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="mapping.fullName"
                  outlined
                  clearable
                  emit-value
                  map-options
                  label="Nome completo (opcional)"
                  :options="headerOptions"
                  hint="Se usado, separaremos nome e sobrenome automaticamente."
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="mapping.firstName"
                  outlined
                  clearable
                  emit-value
                  map-options
                  label="Nome"
                  :options="headerOptions"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="mapping.lastName"
                  outlined
                  clearable
                  emit-value
                  map-options
                  label="Sobrenome"
                  :options="headerOptions"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="mapping.email"
                  outlined
                  clearable
                  emit-value
                  map-options
                  label="E-mail (opcional)"
                  :options="headerOptions"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="mapping.phone"
                  outlined
                  clearable
                  emit-value
                  map-options
                  label="Telefone (opcional)"
                  :options="headerOptions"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="mapping.cpf"
                  outlined
                  clearable
                  emit-value
                  map-options
                  label="CPF (opcional)"
                  :options="headerOptions"
                />
              </div>
            </div>

            <q-banner rounded class="bg-grey-2 text-grey-9">
              Os dados serão importados para esta organização, sem senha.
              Clientes poderão ativar o acesso com um código enviado ao
              e-mail cadastrado.
            </q-banner>

            <q-table
              flat
              bordered
              dense
              :rows="previewRows"
              :columns="previewColumns"
              row-key="rowNumber"
              :pagination="{ rowsPerPage: 5 }"
              no-data-label="Nenhum registro para pré-visualizar"
              title="Prévia dos primeiros registros"
            />

            <div class="text-body2">
              {{ validImportCount }} registros prontos
              <span v-if="invalidImportCount">
                · {{ invalidImportCount }} registros incompletos serão ignorados
              </span>
            </div>

            <q-checkbox
              v-model="importAuthorized"
              label="Confirmo que tenho autorização para importar e utilizar estes dados de clientes."
              :disable="importing"
            />
          </template>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            color="grey-7"
            :disable="importing"
            @click="closeImportDialog"
          />
          <q-btn
            color="primary"
            unelevated
            no-caps
            icon="mdi-upload"
            label="Importar clientes"
            :loading="importing"
            :disable="!canImport"
            @click="importCustomers"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
import * as XLSX from '@e965/xlsx'
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
const importDialog = ref(false)
const editingCustomer = ref<Customer | null>(null)
const selectedCustomer = ref<Customer | null>(null)
const importFile = ref<File | null>(null)
const parsingFile = ref(false)
const importing = ref(false)
const importAuthorized = ref(false)
const rawHeaders = ref<string[]>([])
const rawRows = ref<Record<string, string>[]>([])
const mapping = reactive({
  fullName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  cpf: '',
})

const headerOptions = computed(() => [
  { label: 'Não utilizar', value: '' },
  ...rawHeaders.value.map((header) => ({
    label: header,
    value: header,
  })),
])

interface MappedImportCustomer {
  rowNumber: number
  firstName: string
  lastName: string
  email?: string
  phone?: string
  cpf?: string
}

const mappedImportRows = computed<MappedImportCustomer[]>(() =>
  rawRows.value.map((row, index) => {
    const fullName = mapping.fullName
      ? row[mapping.fullName]?.trim().split(/\s+/).filter(Boolean) ?? []
      : []
    const firstName =
      (mapping.firstName ? row[mapping.firstName]?.trim() : '') ||
      fullName.shift() ||
      ''
    const lastName =
      (mapping.lastName ? row[mapping.lastName]?.trim() : '') ||
      fullName.join(' ')

    return {
      rowNumber: index + 2,
      firstName,
      lastName,
      email: mapping.email
        ? row[mapping.email]?.trim().toLowerCase() || undefined
        : undefined,
      phone: mapping.phone
        ? row[mapping.phone]?.trim().replace(/\D/g, '') || undefined
        : undefined,
      cpf: mapping.cpf
        ? row[mapping.cpf]?.trim().replace(/\D/g, '') || undefined
        : undefined,
    }
  }),
)

const validMappedRows = computed(() =>
  mappedImportRows.value.filter((row) => {
    const validNames =
      row.firstName.length >= 2 && row.lastName.length >= 2
    const validEmail =
      !row.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)
    const validCpf = !row.cpf || row.cpf.length === 11
    const validPhone =
      !row.phone || (row.phone.length >= 8 && row.phone.length <= 20)

    return validNames && validEmail && validCpf && validPhone
  }),
)

const previewRows = computed(() => mappedImportRows.value.slice(0, 15))
const validImportCount = computed(() => validMappedRows.value.length)
const invalidImportCount = computed(
  () => mappedImportRows.value.length - validImportCount.value,
)
const canImport = computed(
  () =>
    importAuthorized.value &&
    validImportCount.value > 0 &&
    validImportCount.value <= 1000 &&
    (mapping.fullName || (mapping.firstName && mapping.lastName)) &&
    !importing.value,
)

const previewColumns = [
  { name: 'rowNumber', label: 'Linha', field: 'rowNumber', align: 'left' as const },
  { name: 'firstName', label: 'Nome', field: 'firstName', align: 'left' as const },
  { name: 'lastName', label: 'Sobrenome', field: 'lastName', align: 'left' as const },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' as const },
  { name: 'phone', label: 'Telefone', field: 'phone', align: 'left' as const },
  { name: 'cpf', label: 'CPF', field: 'cpf', align: 'left' as const },
]

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

function resetImport() {
  importFile.value = null
  rawHeaders.value = []
  rawRows.value = []
  importAuthorized.value = false
  Object.assign(mapping, {
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cpf: '',
  })
}

function openImportDialog() {
  resetImport()
  importDialog.value = true
}

function closeImportDialog() {
  if (importing.value) return
  importDialog.value = false
  resetImport()
}

function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]/g, '')
}

function chooseHeader(headers: string[], aliases: string[]) {
  const aliasSet = new Set(aliases.map(normalizeHeader))
  return (
    headers.find((header) => aliasSet.has(normalizeHeader(header))) ?? ''
  )
}

function parseCsv(content: string) {
  const text = content.replace(/^\uFEFF/, '')
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const delimiters = [',', ';', '\t']
  const delimiter = delimiters
    .map((candidate) => {
      let count = 0
      let quoted = false

      for (let index = 0; index < firstLine.length; index += 1) {
        const character = firstLine[index]
        if (character === '"' && firstLine[index + 1] === '"' && quoted) {
          index += 1
        } else if (character === '"') {
          quoted = !quoted
        } else if (character === candidate && !quoted) {
          count += 1
        }
      }

      return { candidate, count }
    })
    .sort((left, right) => right.count - left.count)[0]?.candidate ?? ','
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]

    if (character === '"' && quoted && text[index + 1] === '"') {
      cell += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === delimiter && !quoted) {
      row.push(cell.trim())
      cell = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(cell.trim())
      if (row.some((value) => value)) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += character
    }
  }

  if (quoted) {
    throw new Error('O arquivo CSV contém aspas não finalizadas.')
  }

  row.push(cell.trim())
  if (row.some((value) => value)) rows.push(row)
  return rows
}

function setImportData(matrix: string[][]) {
  const headerIndex = matrix.findIndex((row) =>
    row.some((cell) => cell.trim()),
  )

  if (headerIndex < 0) {
    throw new Error('O arquivo não contém dados para importar.')
  }

  const headerRow = matrix[headerIndex]

  if (!headerRow) {
    throw new Error('O arquivo não contém dados para importar.')
  }

  const headerOccurrences = new Map<string, number>()
  const headers = headerRow.map((header, index) => {
    const normalized = header.trim()
    const baseName = normalized || `Coluna ${index + 1}`
    const occurrence = (headerOccurrences.get(baseName) ?? 0) + 1
    headerOccurrences.set(baseName, occurrence)
    return occurrence === 1 ? baseName : `${baseName} (${occurrence})`
  })
  const dataRows = matrix
    .slice(headerIndex + 1)
    .filter((row) => row.some((cell) => cell.trim()))

  if (dataRows.length > 1000) {
    throw new Error('O arquivo pode conter no máximo 1.000 clientes.')
  }

  if (!dataRows.length) {
    throw new Error('O arquivo contém cabeçalhos, mas não há clientes.')
  }

  rawHeaders.value = headers
  rawRows.value = dataRows.map((row) =>
    Object.fromEntries(
      headers.map((header, index) => [header, row[index]?.trim() ?? '']),
    ),
  )

  mapping.fullName = chooseHeader(headers, [
    'nome completo',
    'nome do cliente',
    'cliente',
    'full name',
    'name',
  ])
  mapping.firstName = chooseHeader(headers, [
    'nome',
    'primeiro nome',
    'first name',
  ])
  mapping.lastName = chooseHeader(headers, [
    'sobrenome',
    'ultimo nome',
    'last name',
  ])
  mapping.email = chooseHeader(headers, ['email', 'e-mail', 'correio eletronico'])
  mapping.phone = chooseHeader(headers, [
    'telefone',
    'celular',
    'phone',
    'whatsapp',
  ])
  mapping.cpf = chooseHeader(headers, ['cpf', 'documento'])
}

async function readPdfFile(file: File) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const workerUrl = await import(
    'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'
  )
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.default

  const document = await pdfjs.getDocument({
    data: await file.arrayBuffer(),
  }).promise
  if (document.numPages > 100) {
    throw new Error('O PDF pode conter no máximo 100 páginas.')
  }
  const matrix: string[][] = []

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const content = await page.getTextContent()
    const positionedItems = content.items
      .filter(
        (item): item is typeof item & {
          str: string
          transform: number[]
          width: number
        } => 'str' in item && Boolean(item.str.trim()),
      )
      .map((item) => ({
        text: item.str.trim(),
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
      }))
      .sort((left, right) => right.y - left.y || left.x - right.x)

    const lines: Array<{ y: number; items: typeof positionedItems }> = []

    for (const item of positionedItems) {
      let line = lines.find((candidate) => Math.abs(candidate.y - item.y) < 3)
      if (!line) {
        line = { y: item.y, items: [] }
        lines.push(line)
      }
      line.items.push(item)
    }

    for (const line of lines) {
      const cells: string[] = []
      let previousRight = Number.NEGATIVE_INFINITY

      for (const item of line.items.sort((left, right) => left.x - right.x)) {
        const gap = item.x - previousRight
        if (!cells.length || gap > 18) {
          cells.push(item.text)
        } else {
          cells[cells.length - 1] += ` ${item.text}`
        }
        previousRight = item.x + item.width
      }

      if (cells.some((cell) => cell.trim())) matrix.push(cells)
      if (matrix.length > 1001) {
        throw new Error('O arquivo pode conter no máximo 1.000 clientes.')
      }
    }
  }

  if (!matrix.length) {
    throw new Error(
      'Não foi possível extrair texto deste PDF. Use um PDF digital com texto selecionável.',
    )
  }

  return matrix
}

async function parseImportFile(file: File | null) {
  rawHeaders.value = []
  rawRows.value = []
  Object.assign(mapping, {
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cpf: '',
  })
  if (!file) return

  if (file.size > 10 * 1024 * 1024) {
    importFile.value = null
    notifyError(null, 'O arquivo deve ter no máximo 10 MB.')
    return
  }

  parsingFile.value = true

  try {
    const extension = file.name.split('.').pop()?.toLocaleLowerCase('en-US')
    let matrix: string[][]

    if (extension === 'csv') {
      matrix = parseCsv(await file.text())
    } else if (extension === 'xls' || extension === 'xlsx') {
      const workbook = XLSX.read(await file.arrayBuffer(), {
        type: 'array',
        cellText: true,
        cellDates: false,
      })
      const firstSheetName = workbook.SheetNames[0]
      if (!firstSheetName) {
        throw new Error('A planilha não possui uma aba para importar.')
      }
      const firstSheet = workbook.Sheets[firstSheetName]
      if (!firstSheet) {
        throw new Error('A planilha não possui uma aba para importar.')
      }
      matrix = XLSX.utils
        .sheet_to_json<unknown[]>(firstSheet, {
          header: 1,
          defval: '',
          raw: false,
        })
        .map((row) => row.map((cell) => String(cell ?? '').trim()))
    } else if (extension === 'pdf') {
      matrix = await readPdfFile(file)
    } else {
      throw new Error('Selecione um arquivo CSV, XLS, XLSX ou PDF.')
    }

    setImportData(matrix)
  } catch (error) {
    resetImport()
    notifyError(
      error,
      'Não foi possível ler o arquivo. Confira o formato e tente novamente.',
    )
  } finally {
    parsingFile.value = false
  }
}

function notifyRejectedFile() {
  $q.notify({
    type: 'negative',
    message: 'Selecione um arquivo compatível de até 10 MB.',
  })
}

async function importCustomers() {
  if (!canImport.value) return

  importing.value = true

  try {
    const result = await api<{
      imported: number
      duplicates: number
      total: number
    }>('/customers/import', {
      method: 'POST',
      body: {
        customers: validMappedRows.value.map(
          ({ rowNumber: _rowNumber, ...customer }) => customer,
        ),
      },
    })

    importDialog.value = false
    resetImport()
    $q.notify({
      type: 'positive',
      message: `${result.imported} cliente(s) importado(s). ${result.duplicates} duplicado(s) ignorado(s).`,
    })
    await loadCustomers()
  } catch (error) {
    notifyError(error, 'Não foi possível importar os clientes.')
  } finally {
    importing.value = false
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

<style scoped>
.import-dialog {
  width: 900px;
  max-width: 96vw;
}
</style>