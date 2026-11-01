<template>
  <q-layout view="lHh Lpr lFf">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar class="wrapper">
        <NuxtLink
          to="/"
          class="row items-center no-wrap text-dark"
          style="text-decoration: none"
          aria-label="AgendaAi - Página inicial"
        >
          <q-img
            src="/header.png"
            alt="AgendaAi"
            width="44px"
            height="44px"
            fit="contain"
          />
          <span class="text-h6 text-weight-bold text-white q-ml-sm">AgendaAi</span>
        </NuxtLink>

        <q-space />

        <div class="row items-center q-gutter-xs gt-md">
          <q-btn
            flat
            no-caps
            icon="mdi-account-outline"
            label="Cliente"
            to="/customer/login"
          />
          <q-btn
            flat
            no-caps
            icon="mdi-domain"
            label="Empresa"
            to="/auth/login"
          />
          <q-btn
            unelevated
            rounded
            no-caps
            aria-label="Encontrar loja ou estabelecimento"
            href="/#buscar"
            class="q-ml-sm bg-white text-primary search-nav-btn"
          >
            <q-icon name="mdi-store-search-outline" />
            <span class="search-nav-label">
              Encontrar loja ou estabelecimento
            </span>
          </q-btn>
        </div>

        <q-btn
          class="lt-md"
          flat
          round
          dense
          icon="mdi-store-search-outline"
          aria-label="Encontrar loja ou estabelecimento"
          href="/#buscar"
        />

        <q-btn
          class="lt-lg"
          flat
          round
          dense
          icon="mdi-menu"
          aria-label="Abrir menu principal"
          @click="mobileMenuOpen = true"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="mobileMenuOpen"
      side="right"
      overlay
      bordered
      :width="280"
      class="bg-white"
    >
      <div class="row items-center justify-between q-pa-md">
        <div class="text-subtitle1 text-weight-bold">Menu</div>
        <q-btn
          flat
          round
          dense
          icon="mdi-close"
          aria-label="Fechar menu"
          @click="mobileMenuOpen = false"
        />
      </div>

      <q-separator />

      <q-list padding>
        <q-item
          clickable
          tag="a"
          href="/#buscar"
          @click="mobileMenuOpen = false"
        >
          <q-item-section avatar>
            <q-icon name="mdi-store-search-outline" />
          </q-item-section>
          <q-item-section>Encontrar Loja</q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item clickable to="/customer/login" @click="mobileMenuOpen = false">
          <q-item-section avatar>
            <q-icon name="mdi-account-outline" />
          </q-item-section>
          <q-item-section>Cliente</q-item-section>
        </q-item>

        <q-item clickable to="/auth/login" @click="mobileMenuOpen = false">
          <q-item-section avatar>
            <q-icon name="mdi-domain" />
          </q-item-section>
          <q-item-section>Empresa</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>

    <q-footer class="text-center q-py-md">
      &copy; {{ new Date().getFullYear() }} AgendaAI. Todos os direitos
      reservados.
    </q-footer>
  </q-layout>
</template>
<script setup lang="ts">
const mobileMenuOpen = ref(false)
</script>

<style scoped>
.search-nav-label {
  max-width: 0;
  margin-left: 0;
  overflow: hidden;
  opacity: 0;
  white-space: nowrap;
  transition:
    max-width 220ms ease,
    margin-left 220ms ease,
    opacity 160ms ease;
}

.search-nav-btn:hover .search-nav-label,
.search-nav-btn:focus-visible .search-nav-label {
  max-width: 240px;
  margin-left: 8px;
  opacity: 1;
}
</style>
