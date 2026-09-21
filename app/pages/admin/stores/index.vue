<template>
  <q-page class="q-pa-lg wrapper">
    <div class="row items-center justify-between q-gutter-md">
      <div>
        <div class="text-h4 text-weight-bold">Lojas</div>

        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Gerencie as lojas da sua empresa.
        </div>
      </div>

      <q-btn
        color="primary"
        icon="mdi-plus"
        label="Nova loja"
        no-caps
        @click="openCreateDialog"
      />
    </div>

    <q-card flat bordered class="q-mt-lg">
      <q-card-section>
        <q-table
          flat
          :rows="stores"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="Nenhuma loja encontrada"
        >
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                icon="mdi-pencil-outline"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip> Editar loja </q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <StoreFormDialog
      v-model="showForm"
      :store="selectedStore"
      @saved="handleSaved"
    />
  </q-page>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar'
import type { Store } from '~/types/api'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: ['OWNER', 'ADMIN', 'MANAGER'],
})

const { stores, loading, fetchStores } = useStores()

const columns: QTableColumn[] = [
  {
    name: 'name',
    label: 'Nome',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'address',
    label: 'Endereço',
    field: 'address',
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
const selectedStore = ref<Store | null>(null)

const openCreateDialog = () => {
  selectedStore.value = null
  showForm.value = true
}

const openEditDialog = (store: Store) => {
  selectedStore.value = store
  showForm.value = true
}

const handleSaved = async () => {
  await fetchStores()
}

onMounted(fetchStores)
</script>
