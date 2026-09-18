<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="wrapper">
        <q-btn
          v-if="isMobile"
          flat
          dense
          round
          icon="mdi-menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          AgendaAi
        </q-toolbar-title>

        <q-space />

        <q-btn
          flat
          round
          icon="mdi-bell"
          aria-label="Notificações"
        />

        <q-btn
          flat
          round
          class="q-ml-sm"
        >
          <q-avatar color="primary" text-color="white">
            U
          </q-avatar>

          <q-menu>
            <q-list style="min-width: 220px">
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    U
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                    Usuário
                  </q-item-label>

                  <q-item-label caption>
                    usuario@email.com
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item
                clickable
                v-close-popup
                to="/account"
              >
                <q-item-section avatar>
                  <q-icon name="mdi-account-cog" />
                </q-item-section>

                <q-item-section>
                  Minha conta
                </q-item-section>
              </q-item>

              <q-item
                clickable
                v-close-popup
                to="/organization"
              >
                <q-item-section avatar>
                  <q-icon name="mdi-domain" />
                </q-item-section>

                <q-item-section>
                  Organização
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item
                clickable
                v-close-popup
              >
                <q-item-section avatar>
                  <q-icon name="mdi-logout" />
                </q-item-section>

                <q-item-section>
                  Sair
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="isMobile"
      v-model="leftDrawerOpen"
      bordered
    >
      <q-list padding>
        <q-item
          v-for="item in menuItems"
          :key="item.label"
          clickable
          v-ripple
          :to="item.to"
          @click="leftDrawerOpen = false"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>

          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { isMobile } = useMobile()

const leftDrawerOpen = ref(false)

const menuItems = [
  {
    label: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/dashboard',
  },
  {
    label: 'Organização',
    icon: 'mdi-domain',
    to: '/organization',
  },
  {
    label: 'Lojas',
    icon: 'mdi-store',
    to: '/stores',
  },
  {
    label: 'Profissionais',
    icon: 'mdi-account-group',
    to: '/professionals',
  },
  {
    label: 'Serviços',
    icon: 'mdi-content-cut',
    to: '/services',
  },
  {
    label: 'Clientes',
    icon: 'mdi-account-multiple',
    to: '/customers',
  },
  {
    label: 'Agendamentos',
    icon: 'mdi-calendar-clock',
    to: '/appointments',
  },
]

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>