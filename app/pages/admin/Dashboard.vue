<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-weight-bold">
      Dashboard
    </div>

    <div class="text-subtitle1 text-grey-7 q-mt-sm">
      Olá, {{ authStore.user?.name }}!
    </div>

    <q-card flat bordered class="q-mt-lg">
      <q-card-section>
        <div class="text-h6">
          {{ authStore.organization?.name }}
        </div>

        <div class="text-body2 text-grey-7 q-mt-xs">
          Perfil: {{ authStore.role }}
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const authStore = useAuthStore()
</script>