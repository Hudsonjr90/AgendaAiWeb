<template>
  <q-page class="q-pa-lg wrapper">
    <div class="row items-center justify-between q-gutter-md">
      <div>
        <div class="text-h4 text-weight-bold">
          Profissionais
        </div>

        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Gerencie os profissionais da sua empresa.
        </div>
      </div>

      <q-btn
        color="primary"
        icon="mdi-plus"
        label="Novo profissional"
        no-caps
        @click="openCreateDialog"
      />
    </div>

    <q-card flat bordered class="q-mt-lg">
      <q-card-section>
        <q-table
          flat
          :rows="professionals"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="Nenhum profissional encontrado"
        >
          <template #body-cell-name="props">
            <q-td :props="props">
              {{ getProfessionalName(props.row) }}
            </q-td>
          </template>

          <template #body-cell-store="props">
            <q-td :props="props">
              {{ getStoreName(props.row.storeId) }}
            </q-td>
          </template>

          <template #body-cell-phone="props">
            <q-td :props="props">
              {{ phoneFormat(props.row.phone) }}
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="
                  props.row.status === 'ACTIVE'
                    ? 'positive'
                    : 'grey'
                "
                :label="statusLabel(props.row.status)"
              />
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                icon="mdi-pencil-outline"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>
                  Editar profissional
                </q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <ProfessionalFormDialog
      v-model="showForm"
      :professional="selectedProfessional"
      @saved="handleSaved"
    />
  </q-page>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar'
import ProfessionalFormDialog from '~/components/admin/professionals/ProfessionalFormDialog.vue'
import { phoneFormat, statusLabel } from '~/utils/global'
import type { Professional, Store } from '~/types/api'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: ['OWNER', 'ADMIN', 'MANAGER'],
})

const {
  professionals,
  loading,
  fetchProfessionals,
} = useProfessionals()

const {
  stores,
  fetchStores,
} = useStores()

const columns: QTableColumn[] = [
  {
    name: 'name',
    label: 'Nome',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'store',
    label: 'Loja',
    field: 'store',
    align: 'left',
    sortable: true,
  },
  {
    name: 'email',
    label: 'E-mail',
    field: 'email',
    align: 'left',
  },
  {
    name: 'phone',
    label: 'Telefone',
    field: 'phone',
    align: 'left',
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'id',
    align: 'right',
  },
]

const showForm = ref(false)

const selectedProfessional =
  ref<Professional | null>(null)

const getProfessionalName = (
  professional: Professional,
) => {
  return [
    professional.firstName,
    professional.lastName,
  ]
    .filter(Boolean)
    .join(' ')
}

const getStoreName = (storeId: string) => {
  return (
    stores.value.find(
      (store: Store) => store.id === storeId,
    )?.name ?? '-'
  )
}

const openCreateDialog = () => {
  selectedProfessional.value = null
  showForm.value = true
}

const openEditDialog = (
  professional: Professional,
) => {
  selectedProfessional.value = professional
  showForm.value = true
}

const handleSaved = async () => {
  await fetchProfessionals()
}

onMounted(async () => {
  await Promise.all([
    fetchProfessionals(),
    fetchStores(),
  ])
})
</script>