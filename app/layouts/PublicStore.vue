
<template>
  <q-layout view="lHh Lpr lFf" :style="themeStyles">
    <q-header bordered class="bg-white text-dark">
      <q-toolbar class="q-px-md q-px-lg-xl wrapper" style="min-height: 76px">
        <NuxtLink
          :to="storePath"
          class="row items-center no-wrap text-dark"
          style="text-decoration: none"
          aria-label="Página inicial da loja"
        >
          <q-img
            v-if="storeHeader.logoUrl"
            :src="storeHeader.logoUrl"
            :alt="`Logo ${storeHeader.name}`"
            fit="contain"
            style="width: 48px; height: 48px"
          />

          <q-avatar
            v-else
            rounded
            color="primary"
            text-color="white"
            size="48px"
          >
            <q-icon name="mdi-storefront-outline" size="26px" />
          </q-avatar>

          <span class="text-subtitle2 text-weight-bold q-ml-sm">
            {{ storeHeader.name || 'AgendaAi' }}
          </span>
        </NuxtLink>

        <q-space />

        <div class="row items-center q-gutter-xs gt-sm">
          <q-btn
            v-for="item in navigation"
            :key="item.label"
            flat
            no-caps
            :label="item.label"
            :to="item.to"
            :class="item.disabled ? 'text-grey-5' : 'text-dark'"
            :disable="item.disabled"
          />

          <q-btn
            v-if="auth.accessToken"
            unelevated
            no-caps
            rounded
            color="primary"
            text-color="white"
            icon="mdi-account-circle-outline"
            label="Minha conta"
            :to="accountPath"
            class="q-ml-sm"
          />

          <q-btn
            v-else
            outline
            no-caps
            rounded
            color="primary"
            label="Entrar"
            :to="loginPath"
            class="q-ml-sm"
          />

          <q-btn
            unelevated
            no-caps
            rounded
            color="primary"
            text-color="white"
            label="Agendar"
            :to="bookingLink"
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
          <q-img
            v-if="storeHeader.logoUrl"
            :src="storeHeader.logoUrl"
            :alt="`Logo ${storeHeader.name}`"
            fit="contain"
            style="width: 48px; height: 48px"
          />

          <q-avatar
            v-else
            rounded
            size="48px"
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
          :to="item.to"
          @click="mobileMenuOpen = false"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ item.label }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item
          clickable
          :to="auth.accessToken ? accountPath : loginPath"
          @click="mobileMenuOpen = false"
        >
          <q-item-section avatar>
            <q-icon name="mdi-account-circle-outline" />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              {{ auth.accessToken ? 'Minha conta' : 'Entrar' }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="!auth.accessToken"
          clickable
          :to="registerPath"
          @click="mobileMenuOpen = false"
        >
          <q-item-section avatar>
            <q-icon name="mdi-account-plus-outline" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Criar conta</q-item-label>
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
          :to="bookingLink"
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
import { computed, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';
import { useCustomerAuthStore } from '~/stores/customer-auth';

interface PublicStoreHeader {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

interface PublicStoreResponse {
  name: string;
  theme?: {
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
  } | null;
}

const route = useRoute();
const api = useApi();
const auth = useCustomerAuthStore();

const mobileMenuOpen = ref(false);
const slug = computed(() => String(route.params.slug ?? ''));

const defaultHeader: PublicStoreHeader = {
  name: '',
  logoUrl: null,
  primaryColor: '#642AFB',
  secondaryColor: '#FFC107',
  accentColor: '#FF4081',
};

const storeHeader = useState<PublicStoreHeader>(
  'public-store-header',
  () => ({ ...defaultHeader }),
);

const storePath = computed(() => `/public/stores/${encodeURIComponent(slug.value)}`);
const loginPath = computed(() => `${storePath.value}/login`);
const registerPath = computed(() => `${storePath.value}/register`);
const accountPath = computed(() => `${storePath.value}/account`);

const bookingLink = computed(() => ({
  path: storePath.value,
  hash: '#agendamento',
}));

const navigation = computed(() => [
  {
    label: 'Serviços',
    icon: 'mdi-content-cut',
    to: `${storePath.value}/services`,
    disabled: false,
  },
  {
    label: 'Profissionais',
    icon: 'mdi-account-group-outline',
    to: `${storePath.value}/professionals`,
    disabled: false,
  },
  {
    label: 'Localização',
    icon: 'mdi-map-marker-outline',
    to: {
      path: storePath.value,
      hash: '#informacoes',
    },
    disabled: false,
  },
]);

const { data: layoutStore } = await useAsyncData<PublicStoreResponse>(
  `public-store-layout-${slug.value}`,
  () =>
    api<PublicStoreResponse>(
      `/public/stores/${encodeURIComponent(slug.value)}`,
      { method: 'GET' },
    ),
  {
    watch: [slug],
  },
);

watch(
  layoutStore,
  (currentStore) => {
    if (!currentStore) {
      storeHeader.value = { ...defaultHeader };
      return;
    }

    storeHeader.value = {
      name: currentStore.name,
      logoUrl: currentStore.theme?.logoUrl ?? null,
      primaryColor:
        currentStore.theme?.primaryColor || defaultHeader.primaryColor,
      secondaryColor:
        currentStore.theme?.secondaryColor || defaultHeader.secondaryColor,
      accentColor:
        currentStore.theme?.accentColor || defaultHeader.accentColor,
    };
  },
  { immediate: true },
);

const themeStyles = computed<CSSProperties>(() => ({
  '--q-primary': storeHeader.value.primaryColor,
  '--q-secondary': storeHeader.value.secondaryColor,
  '--q-accent': storeHeader.value.accentColor,
}));
</script>
