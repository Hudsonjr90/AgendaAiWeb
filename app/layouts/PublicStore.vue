
<template>
  <q-layout view="lHh Lpr lFf" :style="themeStyles">
    <q-header bordered class="bg-white text-dark">
      <q-toolbar class="q-px-md q-px-lg-xl wrapper" style="min-height: 76px;">
        <a
          href="#inicio"
          class="row items-center no-wrap q-gutter-sm text-dark"
          style="text-decoration: none;"
          aria-label="Página inicial da loja"
        >
          <q-avatar
            v-if="storeHeader.logoUrl"
            rounded
            size="88px"
          >
            <q-img
              :src="storeHeader.logoUrl"
              :alt="`Logo ${storeHeader.name}`"
              fit="contain"
            />
          </q-avatar>

          <q-avatar
            v-else
            rounded
            color="primary"
            text-color="white"
            size="48px"
          >
            <q-icon name="mdi-storefront-outline" size="26px" />
          </q-avatar>

          <span class="text-subtitle1 text-weight-bold ellipsis">
            {{ storeHeader.name || 'AgendaAi' }}
          </span>
        </a>

        <q-space />

        <div class="row items-center q-gutter-xs gt-sm">
          <q-btn
            v-for="item in navigation"
            :key="item.label"
            flat
            no-caps
            :label="item.label"
            :href="item.href"
            :disable="item.disabled"
            :class="item.disabled ? 'text-grey-5' : 'text-dark'"
          />

          <q-btn
            unelevated
            no-caps
            rounded
            color="primary"
            text-color="white"
            label="Agendar"
            href="#agendamento"
            class="q-ml-sm"
          />
        </div>

        <q-btn
          class="lt-md"
          flat
          round
          dense
          color="dark"
          icon="mdi-menu"
          aria-label="Abrir menu"
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
        <div class="row items-center no-wrap q-gutter-sm">
          <q-avatar
            v-if="storeHeader.logoUrl"
            rounded
            size="40px"
          >
            <q-img
              :src="storeHeader.logoUrl"
              :alt="`Logo ${storeHeader.name}`"
              fit="contain"
            />
          </q-avatar>

          <q-avatar
            v-else
            rounded
            size="40px"
            color="primary"
            text-color="white"
          >
            <q-icon name="mdi-storefront-outline" />
          </q-avatar>

          <div class="text-subtitle2 text-weight-bold ellipsis">
            {{ storeHeader.name || 'AgendaAi' }}
          </div>
        </div>

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
          v-for="item in navigation"
          :key="item.label"
          clickable
          :disable="item.disabled"
          :href="item.href"
          @click="mobileMenuOpen = false"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ item.label }}</q-item-label>
            <q-item-label
              v-if="item.disabled"
              caption
            >
              Em breve
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="q-pa-md">
        <q-btn
          unelevated
          no-caps
          rounded
          color="primary"
          text-color="white"
          icon="mdi-calendar-clock-outline"
          label="Agendar horário"
          href="#agendamento"
          class="full-width"
          @click="mobileMenuOpen = false"
        />
      </div>
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CSSProperties } from 'vue'

interface PublicStoreHeader {
  name: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

const defaultHeader: PublicStoreHeader = {
  name: '',
  logoUrl: null,
  primaryColor: '#642AFB',
  secondaryColor: '#FFC107',
  accentColor: '#FF4081',
}

const storeHeader = useState<PublicStoreHeader>(
  'public-store-header',
  () => ({ ...defaultHeader }),
)

const mobileMenuOpen = ref(false)

const navigation = [
  {
    label: 'Início',
    href: '#inicio',
    icon: 'mdi-home-outline',
    disabled: false,
  },
  {
    label: 'Serviços',
    href: '#servicos',
    icon: 'mdi-content-cut',
    disabled: true,
  },
  {
    label: 'Profissionais',
    href: '#profissionais',
    icon: 'mdi-account-group-outline',
    disabled: true,
  },
  {
    label: 'Agendamentos',
    href: '#agendamento',
    icon: 'mdi-calendar-clock-outline',
    disabled: false,
  },
  {
    label: 'Localização',
    href: '#informacoes',
    icon: 'mdi-map-marker-outline',
    disabled: false,
  },
]

const themeStyles = computed<CSSProperties>(() => ({
  '--q-primary': storeHeader.value.primaryColor,
  '--q-secondary': storeHeader.value.secondaryColor,
  '--q-accent': storeHeader.value.accentColor,
}))
</script>
