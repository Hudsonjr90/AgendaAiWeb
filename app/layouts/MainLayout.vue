<template>
  <q-layout view="lHh Lpr lFf">
    <q-header bordered class="bg-white text-dark">
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
          <span class="text-h6 text-weight-bold q-ml-sm">AgendaAi</span>
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
            color="primary"
            unelevated
            rounded
            no-caps
            icon="mdi-store-search-outline"
            label="Encontrar estabelecimento"
            href="/#buscar"
            class="q-ml-sm"
          />
        </div>

        <q-btn
          class="lt-lg"
          flat
          round
          dense
          icon="mdi-menu"
          aria-label="Abrir menu principal"
        >
          <q-menu>
            <q-list style="min-width: 220px">
              <q-item clickable v-close-popup tag="a" href="/#como-funciona">
                <q-item-section avatar>
                  <q-icon name="mdi-list-box-outline" />
                </q-item-section>
                <q-item-section>Como funciona</q-item-section>
              </q-item>
              <q-item clickable v-close-popup tag="a" href="/#beneficios">
                <q-item-section avatar>
                  <q-icon name="mdi-star-outline" />
                </q-item-section>
                <q-item-section>Benefícios</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup tag="a" href="/#buscar">
                <q-item-section avatar>
                  <q-icon name="mdi-store-search-outline" />
                </q-item-section>
                <q-item-section>Encontrar Loja</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup to="/customer/login">
                <q-item-section avatar>
                  <q-icon name="mdi-account-outline" />
                </q-item-section>
                <q-item-section>Cliente</q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/auth/login">
                <q-item-section avatar>
                  <q-icon name="mdi-domain" />
                </q-item-section>
                <q-item-section>Empresa</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

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
</script>

<style scoped>
.global-footer {
  border-top: 1px solid #eee8df;
  background: #fff;
  color: #272321;
}

@media (max-width: 599px) {
  .global-footer nav {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
