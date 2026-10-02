
<template>
  <q-page padding class="wrapper">
    <div class="row items-center justify-between q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm">
        <div class="text-h5 text-weight-bold">Agendamentos</div>
        <div class="text-body2 text-grey-7">
          Consulte e gerencie os agendamentos da sua organização.
        </div>
      </div>

      <div class="col-12 col-sm-auto">
        <q-btn
          color="primary"
          icon="mdi-calendar-clock"
          label="Novo agendamento"
          no-caps
          unelevated
          class="full-width"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">Total</div>
            <div class="text-h4 text-weight-bold">{{ appointments.length }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">Pendentes</div>
            <div class="text-h4 text-weight-bold text-warning">
              {{ countByStatus('PENDING') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">Confirmados</div>
            <div class="text-h4 text-weight-bold text-positive">
              {{ countByStatus('CONFIRMED') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">Cancelados</div>
            <div class="text-h4 text-weight-bold text-negative">
              {{ countByStatus('CANCELLED') }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section class="row items-center q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-input
            v-model="filter"
            outlined
            dense
            clearable
            placeholder="Buscar cliente ou profissional"
          >
            <template #prepend>
              <q-icon name="mdi-magnify" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="storeFilter"
            outlined
            dense
            clearable
            emit-value
            map-options
            label="Loja"
            :options="storeOptions"
          />
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="statusFilter"
            outlined
            dense
            clearable
            emit-value
            map-options
            label="Status"
            :options="statusOptions"
          />
        </div>

        <div class="col-12 col-md-auto">
          <q-btn
            flat
            color="primary"
            icon="mdi-refresh"
            no-caps
            label="Atualizar"
            :loading="loading"
            @click="loadAll"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-table
        flat
        :rows="filteredAppointments"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10, sortBy: 'startsAt', descending: false }"
        no-data-label="Nenhum agendamento encontrado"
        loading-label="Carregando agendamentos..."
      >
        <template #body-cell-schedule="props">
          <q-td :props="props">
            <div class="text-weight-medium">
              {{ formatDateTime(props.row.startsAt) }}
            </div>
            <div class="text-caption text-grey-7">
              Até {{ formatTime(props.row.endsAt) }}
            </div>
          </q-td>
        </template>

        <template #body-cell-customer="props">
          <q-td :props="props">
            <div class="text-weight-medium">
              {{ customerName(props.row.customerId) }}
            </div>
            <div class="text-caption text-grey-7">
              {{ customerPhone(props.row.customerId) }}
            </div>
          </q-td>
        </template>

        <template #body-cell-professional="props">
          <q-td :props="props">
            {{ professionalName(props.row.professionalId) }}
          </q-td>
        </template>

        <template #body-cell-service="props">
          <q-td :props="props">
            <div>{{ serviceName(props.row.serviceId) }}</div>
            <div class="text-caption text-grey-7">
              {{ formatCurrency(servicePrice(props.row.serviceId)) }}
            </div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="appointmentStatusColor(props.row.status)"
              :label="appointmentStatusLabel(props.row.status)"
            />
          </q-td>
        </template>

        <template #body-cell-paymentStatus="props">
          <q-td :props="props">
            <q-badge
              outline
              :color="paymentStatusColor(props.row.paymentStatus)"
              :label="paymentStatusLabel(props.row.paymentStatus)"
            />
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
              aria-label="Visualizar agendamento"
              @click="openDetailsDialog(props.row)"
            >
              <q-tooltip>Detalhes</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              color="primary"
              icon="mdi-pencil-outline"
              aria-label="Editar agendamento"
              :disable="props.row.status === 'CANCELLED'"
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
              aria-label="Cancelar agendamento"
              :disable="['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(props.row.status)"
              @click="openCancelDialog(props.row)"
            >
              <q-tooltip>Cancelar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="formDialog" persistent>
      <q-card style="width: 650px; max-width: 95vw">
        <q-form @submit.prevent="saveAppointment">
          <q-card-section class="row items-center">
            <div class="text-h6">
              {{ editingAppointment ? 'Editar agendamento' : 'Novo agendamento' }}
            </div>
            <q-space />
            <q-btn v-close-popup flat round dense icon="close" />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-gutter-md">
            <q-select
              v-model="form.storeId"
              outlined
              emit-value
              map-options
              label="Loja"
              :options="storeOptions"
              :rules="[(value) => !!value || 'Selecione uma loja']"
              :disable="!!editingAppointment"
              @update:model-value="onStoreChange"
            />

            <q-select
              v-model="form.customerId"
              outlined
              use-input
              input-debounce="0"
              emit-value
              map-options
              label="Cliente"
              :options="customerOptions"
              option-label="label"
              option-value="value"
              :rules="[(value) => !!value || 'Selecione um cliente']"
              :disable="!!editingAppointment"
              @filter="filterCustomers"
            />

            <q-select
              v-model="form.professionalId"
              outlined
              emit-value
              map-options
              label="Profissional"
              :options="availableProfessionalOptions"
              :rules="[(value) => !!value || 'Selecione um profissional']"
            />

            <q-select
              v-model="form.serviceId"
              outlined
              emit-value
              map-options
              label="Serviço"
              :options="availableServiceOptions"
              :rules="[(value) => !!value || 'Selecione um serviço']"
            />

            <q-input
              v-model="form.startsAt"
              outlined
              type="datetime-local"
              label="Data e horário de início"
              :rules="[(value) => !!value || 'Informe a data e o horário']"
            />

            <q-banner v-if="selectedService" class="bg-grey-2" rounded>
              <div class="text-body2">
                Duração prevista:
                <strong>{{ selectedService.durationMinutes }} minutos</strong>
              </div>
              <div class="text-body2">
                Término estimado:
                <strong>{{ estimatedEndTime || '—' }}</strong>
              </div>
              <div class="text-caption text-grey-7">
                A disponibilidade final será validada pelo servidor.
              </div>
            </q-banner>

            <q-input
              v-model="form.notes"
              outlined
              type="textarea"
              autogrow
              maxlength="500"
              counter
              label="Observações"
            />

            <div v-if="editingAppointment" class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.status"
                  outlined
                  emit-value
                  map-options
                  label="Status"
                  :options="editableStatusOptions"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.paymentStatus"
                  outlined
                  emit-value
                  map-options
                  label="Pagamento"
                  :options="paymentOptions"
                />
              </div>
            </div>
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
              unelevated
              no-caps
              :label="editingAppointment ? 'Salvar alterações' : 'Criar agendamento'"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="detailsDialog">
      <q-card style="width: 550px; max-width: 95vw">
        <q-card-section class="row items-center">
          <div class="text-h6">Detalhes do agendamento</div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="mdi-close" />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="selectedAppointment" class="q-gutter-md">
          <div class="row items-center q-gutter-sm">
            <q-badge
              :color="appointmentStatusColor(selectedAppointment.status)"
              :label="appointmentStatusLabel(selectedAppointment.status)"
            />
            <q-badge
              outline
              :color="paymentStatusColor(selectedAppointment.paymentStatus)"
              :label="paymentStatusLabel(selectedAppointment.paymentStatus)"
            />
          </div>

          <div>
            <div class="text-caption text-grey-7">Data e horário</div>
            <div class="text-weight-medium">
              {{ formatDateTime(selectedAppointment.startsAt) }}
              – {{ formatTime(selectedAppointment.endsAt) }}
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-7">Loja</div>
            <div>{{ storeName(selectedAppointment.storeId) }}</div>
          </div>

          <div>
            <div class="text-caption text-grey-7">Cliente</div>
            <div>{{ customerName(selectedAppointment.customerId) }}</div>
            <div class="text-caption text-grey-7">
              {{ customerEmail(selectedAppointment.customerId) }}
            </div>
            <div class="text-caption text-grey-7">
              {{ customerPhone(selectedAppointment.customerId) }}
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-7">Profissional</div>
            <div>{{ professionalName(selectedAppointment.professionalId) }}</div>
          </div>

          <div>
            <div class="text-caption text-grey-7">Serviço</div>
            <div>{{ serviceName(selectedAppointment.serviceId) }}</div>
            <div class="text-caption text-grey-7">
              {{ formatCurrency(servicePrice(selectedAppointment.serviceId)) }}
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-7">Observações</div>
            <div>{{ selectedAppointment.notes || 'Nenhuma observação.' }}</div>
          </div>

          <div>
            <div class="text-caption text-grey-7">Identificador</div>
            <div class="text-caption">{{ selectedAppointment.id }}</div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn v-close-popup color="primary" label="Fechar" unelevated />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="cancelDialog" persistent>
      <q-card style="width: 420px; max-width: 95vw">
        <q-card-section class="row items-center q-gutter-sm">
          <q-icon name="event_busy" color="negative" size="md" />
          <div class="text-h6">Cancelar agendamento</div>
        </q-card-section>

        <q-card-section>
          Confirma o cancelamento do agendamento de
          <strong>
            {{ selectedAppointment
              ? customerName(selectedAppointment.customerId)
              : '' }}
          </strong>
          em
          <strong>
            {{ selectedAppointment
              ? formatDateTime(selectedAppointment.startsAt)
              : '' }}
          </strong>?
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            v-close-popup
            flat
            label="Voltar"
            color="grey-7"
            :disable="cancelling"
          />
          <q-btn
            color="negative"
            unelevated
            label="Confirmar cancelamento"
            :loading="cancelling"
            @click="cancelAppointment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-banner
      v-if="pageError"
      class="bg-red-1 text-negative q-mt-md"
      rounded
    >
      <template #avatar>
        <q-icon name="error_outline" />
      </template>
      {{ pageError }}
      <template #action>
        <q-btn flat color="negative" label="Fechar" @click="pageError = ''" />
      </template>
    </q-banner>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: ['OWNER', 'ADMIN', 'MANAGER'],
})

type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

type PaymentStatus =
  | 'PENDING'
  | 'PARTIAL'
  | 'PAID'
  | 'REFUNDED'
  | 'FAILED'

interface Store {
  id: string
  name: string
  status?: string
}

interface Customer {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  status: string
}

interface Professional {
  id: string
  storeId: string
  firstName: string | null
  lastName: string | null
  status: string
}

interface Service {
  id: string
  name: string
  durationMinutes: number
  priceCents: number
  status: string
}

interface Appointment {
  id: string
  organizationId: string
  storeId: string
  customerId: string
  professionalId: string
  serviceId: string
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  notes: string | null
  createdAt?: string
  updatedAt?: string
}

const api = useApi()
const $q = useQuasar()

const appointments = ref<Appointment[]>([])
const stores = ref<Store[]>([])
const customers = ref<Customer[]>([])
const professionals = ref<Professional[]>([])
const services = ref<Service[]>([])

const loading = ref(false)
const saving = ref(false)
const cancelling = ref(false)
const pageError = ref('')
const filter = ref('')
const storeFilter = ref<string | null>(null)
const statusFilter = ref<AppointmentStatus | null>(null)

const formDialog = ref(false)
const detailsDialog = ref(false)
const cancelDialog = ref(false)
const editingAppointment = ref<Appointment | null>(null)
const selectedAppointment = ref<Appointment | null>(null)

const customerSearchOptions = ref<{ label: string; value: string }[]>([])

const emptyForm = () => ({
  storeId: '',
  customerId: '',
  professionalId: '',
  serviceId: '',
  startsAt: '',
  notes: '',
  status: 'PENDING' as AppointmentStatus,
  paymentStatus: 'PENDING' as PaymentStatus,
})

const form = reactive(emptyForm())

const columns = [
  {
    name: 'schedule',
    label: 'Data e horário',
    field: 'startsAt',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'customer',
    label: 'Cliente',
    field: 'customerId',
    align: 'left' as const,
  },
  {
    name: 'professional',
    label: 'Profissional',
    field: 'professionalId',
    align: 'left' as const,
  },
  {
    name: 'service',
    label: 'Serviço',
    field: 'serviceId',
    align: 'left' as const,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'left' as const,
  },
  {
    name: 'paymentStatus',
    label: 'Pagamento',
    field: 'paymentStatus',
    align: 'left' as const,
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'right' as const,
  },
]

const statusOptions = [
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Confirmado', value: 'CONFIRMED' },
  { label: 'Concluído', value: 'COMPLETED' },
  { label: 'Cancelado', value: 'CANCELLED' },
  { label: 'Não compareceu', value: 'NO_SHOW' },
]

const editableStatusOptions = [
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Confirmado', value: 'CONFIRMED' },
  { label: 'Concluído', value: 'COMPLETED' },
  { label: 'Não compareceu', value: 'NO_SHOW' },
]

const paymentOptions = [
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Parcial', value: 'PARTIAL' },
  { label: 'Pago', value: 'PAID' },
  { label: 'Reembolsado', value: 'REFUNDED' },
  { label: 'Falhou', value: 'FAILED' },
]

const storeOptions = computed(() =>
  stores.value
    .filter((store) => store.status !== 'INACTIVE')
    .map((store) => ({ label: store.name, value: store.id })),
)

const availableProfessionals = computed(() =>
  professionals.value.filter((professional) =>
    professional.status === 'ACTIVE'
    && (!form.storeId || professional.storeId === form.storeId),
  ),
)

const availableProfessionalOptions = computed(() =>
  availableProfessionals.value.map((professional) => ({
    label: personName(professional.firstName, professional.lastName),
    value: professional.id,
  })),
)

const availableServices = computed(() =>
  services.value.filter((service) => service.status === 'ACTIVE'),
)

const availableServiceOptions = computed(() =>
  availableServices.value.map((service) => ({
    label: `${service.name} • ${service.durationMinutes} min • ${formatCurrency(service.priceCents)}`,
    value: service.id,
  })),
)

const customerOptions = computed(() => {
  const activeCustomers = customers.value.filter(
    (customer) => customer.status === 'ACTIVE',
  )

  const selected = activeCustomers.map((customer) => ({
    label: `${personName(customer.firstName, customer.lastName)}${customer.phone ? ` • ${customer.phone}` : ''}`,
    value: customer.id,
  }))

  const search = customerSearchOptions.value
  if (!search.length) return selected

  const selectedIds = new Set(selected.map((option) => option.value))
  return [
    ...selected,
    ...search.filter((option) => !selectedIds.has(option.value)),
  ]
})

const selectedService = computed(() =>
  services.value.find((service) => service.id === form.serviceId) ?? null,
)

const estimatedEndTime = computed(() => {
  if (!form.startsAt || !selectedService.value) return ''

  const start = new Date(form.startsAt)
  if (Number.isNaN(start.getTime())) return ''

  const end = new Date(
    start.getTime() + selectedService.value.durationMinutes * 60_000,
  )

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(end)
})

const filteredAppointments = computed(() => {
  const term = filter.value.trim().toLocaleLowerCase('pt-BR')

  return appointments.value.filter((appointment) => {
    const matchesStore = !storeFilter.value
      || appointment.storeId === storeFilter.value

    const matchesStatus = !statusFilter.value
      || appointment.status === statusFilter.value

    const searchable = [
      customerName(appointment.customerId),
      professionalName(appointment.professionalId),
      serviceName(appointment.serviceId),
      storeName(appointment.storeId),
    ].join(' ').toLocaleLowerCase('pt-BR')

    return matchesStore
      && matchesStatus
      && (!term || searchable.includes(term))
  })
})

function countByStatus(status: AppointmentStatus) {
  return appointments.value.filter((appointment) => appointment.status === status).length
}

function personName(firstName: string | null, lastName: string | null) {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim() || 'Sem nome'
}

function customerName(customerId: string) {
  const customer = customers.value.find((item) => item.id === customerId)
  return customer ? personName(customer.firstName, customer.lastName) : 'Cliente não localizado'
}

function customerPhone(customerId: string) {
  return customers.value.find((item) => item.id === customerId)?.phone || '—'
}

function customerEmail(customerId: string) {
  return customers.value.find((item) => item.id === customerId)?.email || '—'
}

function professionalName(professionalId: string) {
  const professional = professionals.value.find((item) => item.id === professionalId)
  return professional
    ? personName(professional.firstName, professional.lastName)
    : 'Profissional não localizado'
}

function serviceName(serviceId: string) {
  return services.value.find((item) => item.id === serviceId)?.name
    || 'Serviço não localizado'
}

function servicePrice(serviceId: string) {
  return services.value.find((item) => item.id === serviceId)?.priceCents ?? 0
}

function storeName(storeId: string) {
  return stores.value.find((item) => item.id === storeId)?.name
    || 'Loja não localizada'
}

function appointmentStatusLabel(status: AppointmentStatus) {
  const labels: Record<AppointmentStatus, string> = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'Não compareceu',
  }

  return labels[status]
}

function appointmentStatusColor(status: AppointmentStatus) {
  const colors: Record<AppointmentStatus, string> = {
    PENDING: 'warning',
    CONFIRMED: 'positive',
    COMPLETED: 'primary',
    CANCELLED: 'negative',
    NO_SHOW: 'grey-7',
  }

  return colors[status]
}

function paymentStatusLabel(status: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    PENDING: 'Pendente',
    PARTIAL: 'Parcial',
    PAID: 'Pago',
    REFUNDED: 'Reembolsado',
    FAILED: 'Falhou',
  }

  return labels[status]
}

function paymentStatusColor(status: PaymentStatus) {
  const colors: Record<PaymentStatus, string> = {
    PENDING: 'warning',
    PARTIAL: 'info',
    PAID: 'positive',
    REFUNDED: 'grey-7',
    FAILED: 'negative',
  }

  return colors[status]
}

function formatCurrency(priceCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceCents / 100)
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('pt-BR', {
    timeStyle: 'short',
  }).format(date)
}

function toDateTimeLocal(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (part: number) => String(part).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toIsoDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Data e horário inválidos.')
  }

  return date.toISOString()
}

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as {
    data?: { message?: string | string[] }
    response?: { _data?: { message?: string | string[] } }
    message?: string
  }

  const message = err?.data?.message
    ?? err?.response?._data?.message
    ?? err?.message

  return Array.isArray(message) ? message.join(', ') : message || fallback
}

async function loadAll() {
  loading.value = true
  pageError.value = ''

  try {
    const [appointmentData, storeData, customerData, professionalData, serviceData] =
      await Promise.all([
        api<Appointment[]>('/appointments', { method: 'GET' }),
        api<Store[]>('/stores', { method: 'GET' }),
        api<Customer[]>('/customers', { method: 'GET' }),
        api<Professional[]>('/professionals', { method: 'GET' }),
        api<Service[]>('/services', { method: 'GET' }),
      ])

    appointments.value = appointmentData
    stores.value = storeData
    customers.value = customerData
    professionals.value = professionalData
    services.value = serviceData
  } catch (error) {
    pageError.value = getErrorMessage(
      error,
      'Não foi possível carregar os dados dos agendamentos.',
    )
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, emptyForm())
  editingAppointment.value = null
  customerSearchOptions.value = []
}

function openCreateDialog() {
  resetForm()
  formDialog.value = true
}

function openEditDialog(appointment: Appointment) {
  editingAppointment.value = appointment

  Object.assign(form, {
    storeId: appointment.storeId,
    customerId: appointment.customerId,
    professionalId: appointment.professionalId,
    serviceId: appointment.serviceId,
    startsAt: toDateTimeLocal(appointment.startsAt),
    notes: appointment.notes ?? '',
    status: appointment.status,
    paymentStatus: appointment.paymentStatus,
  })

  formDialog.value = true
}

function openDetailsDialog(appointment: Appointment) {
  selectedAppointment.value = appointment
  detailsDialog.value = true
}

function openCancelDialog(appointment: Appointment) {
  selectedAppointment.value = appointment
  cancelDialog.value = true
}

function onStoreChange() {
  if (
    form.professionalId
    && !availableProfessionals.value.some(
      (professional) => professional.id === form.professionalId,
    )
  ) {
    form.professionalId = ''
  }
}

function filterCustomers(
  value: string,
  update: (callback: () => void) => void,
) {
  const term = value.trim().toLocaleLowerCase('pt-BR')

  update(() => {
    if (!term) {
      customerSearchOptions.value = []
      return
    }

    customerSearchOptions.value = customers.value
      .filter((customer) => {
        const name = personName(customer.firstName, customer.lastName)
          .toLocaleLowerCase('pt-BR')
        const email = (customer.email ?? '').toLocaleLowerCase('pt-BR')
        const phone = customer.phone ?? ''

        return customer.status === 'ACTIVE'
          && `${name} ${email} ${phone}`.includes(term)
      })
      .map((customer) => ({
        label: `${personName(customer.firstName, customer.lastName)}${customer.phone ? ` • ${customer.phone}` : ''}`,
        value: customer.id,
      }))
  })
}

async function saveAppointment() {
  if (saving.value) return

  saving.value = true
  pageError.value = ''

  try {
    const startsAt = toIsoDate(form.startsAt)

    if (editingAppointment.value) {
      await api(`/appointments/${editingAppointment.value.id}`, {
        method: 'PATCH',
        body: {
          startsAt,
          professionalId: form.professionalId,
          serviceId: form.serviceId,
          notes: form.notes.trim() || undefined,
          status: form.status,
          paymentStatus: form.paymentStatus,
        },
      })

      $q.notify({
        type: 'positive',
        message: 'Agendamento atualizado com sucesso.',
      })
    } else {
      await api('/appointments', {
        method: 'POST',
        body: {
          storeId: form.storeId,
          customerId: form.customerId,
          professionalId: form.professionalId,
          serviceId: form.serviceId,
          startsAt,
          notes: form.notes.trim() || undefined,
        },
      })

      $q.notify({
        type: 'positive',
        message: 'Agendamento criado com sucesso.',
      })
    }

    formDialog.value = false
    await loadAll()
  } catch (error) {
    pageError.value = getErrorMessage(
      error,
      'Não foi possível salvar o agendamento.',
    )
  } finally {
    saving.value = false
  }
}

async function cancelAppointment() {
  if (!selectedAppointment.value || cancelling.value) return

  cancelling.value = true
  pageError.value = ''

  try {
    await api(`/appointments/${selectedAppointment.value.id}/cancel`, {
      method: 'PATCH',
    })

    cancelDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Agendamento cancelado com sucesso.',
    })
    await loadAll()
  } catch (error) {
    pageError.value = getErrorMessage(
      error,
      'Não foi possível cancelar o agendamento.',
    )
  } finally {
    cancelling.value = false
  }
}

onMounted(loadAll)
</script>
