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

        <q-space />

        <q-btn
          v-if="isMobile"
          flat
          dense
          round
          icon="mdi-menu"
          aria-label="Menu"
          class="q-ml-sm"
          @click="toggleRightDrawer"
        />

        <q-btn
          v-if="!isMobile"
          flat
          round
          class="q-ml-sm"
          aria-label="Menu do usuário"
        >
          <q-avatar color="primary" text-color="white" size="40px">
            {{ initials }}
          </q-avatar>

          <q-menu>
            <q-list style="min-width: 280px">
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    {{ initials }}
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                    {{ authStore.user?.firstName ?? '' }}
                    {{ authStore.user?.lastName ?? '' }}
                  </q-item-label>

                  <q-item-label caption>
                    {{ authStore.user?.email ?? 'usuario@email.com' }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item
                v-for="item in menuItems"
                :key="item.label"
                clickable
                v-close-popup
                :to="item.to"
              >
                <q-item-section avatar>
                  <q-icon :name="item.icon" />
                </q-item-section>

                <q-item-section>
                  {{ item.label }}
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup to="/admin/account">
                <q-item-section avatar>
                  <q-icon name="mdi-account-cog-outline" />
                </q-item-section>

                <q-item-section> Minha conta </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="mdi-logout" />
                </q-item-section>

                <q-item-section> Sair </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="isMobile" v-model="rightDrawerOpen" side="right" bordered>
      <q-list padding>
        <q-item>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="48px">
              {{ initials }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ authStore.user?.firstName ?? '' }}
              {{ authStore.user?.lastName ?? '' }}
            </q-item-label>

            <q-item-label caption>
              {{ authStore.user?.email ?? 'usuario@email.com' }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-sm" />

        <q-item
          v-for="item in menuItems"
          :key="item.label"
          clickable
          v-ripple
          :to="item.to"
          @click="rightDrawerOpen = false"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>

          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>

        <q-separator class="q-my-sm" />

        <q-item
          clickable
          v-ripple
          to="/admin/account"
          @click="rightDrawerOpen = false"
        >
          <q-item-section avatar>
            <q-icon name="mdi-account-cog-outline" />
          </q-item-section>

          <q-item-section> Minha conta </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="handleLogout">
          <q-item-section avatar>
            <q-icon name="mdi-logout" />
          </q-item-section>

          <q-item-section> Sair </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const { initials } = useUserInitials()
const { isMobile } = useMobile()

const rightDrawerOpen = ref(false)

const menuItems = computed(() => [
  {
    label: 'Dashboard',
    icon: 'mdi-view-dashboard-outline',
    to: '/admin/dashboard',
  },
  ...(authStore.role === 'OWNER' || authStore.role === 'ADMIN'
    ? [
        {
          label: 'Configuração inicial',
          icon: 'mdi-clipboard-check-outline',
          to: '/admin/onboarding',
        },
      ]
    : []),
  {
    label: 'Empresa',
    icon: 'mdi-domain',
    to: '/admin/company',
  },
  {
    label: 'Lojas',
    icon: 'mdi-store-outline',
    to: '/admin/stores',
  },
  {
    label: 'Profissionais',
    icon: 'mdi-account-group-outline',
    to: '/admin/professionals',
  },
  {
    label: 'Serviços',
    icon: 'mdi-content-cut',
    to: '/admin/services',
  },
  {
    label: 'Clientes',
    icon: 'mdi-account-multiple-outline',
    to: '/admin/customers',
  },
  {
    label: 'Agendamentos',
    icon: 'mdi-calendar-clock-outline',
    to: '/admin/appointments',
  },
])

const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value
}

const handleLogout = async () => {
  rightDrawerOpen.value = false

  authStore.logout()

  await router.push('/auth/login')
}
</script>
