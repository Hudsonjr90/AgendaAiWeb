<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="wrapper">
        <q-toolbar-title>
          <q-img
            v-if="!isMobile"
            src="/header.png"
            alt="AgendaAi"
            width="45px"
            fit="contain"
          />
          <span class="text-h6 q-ml-sm">AgendaAi</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="text-center q-py-md">
      &copy; {{ new Date().getFullYear() }} AgendaAI. Todos os direitos
      reservados.
    </q-footer>
  </q-layout>
</template>
<script setup lang="ts">

const { isMobile } = useMobile()

</script>
