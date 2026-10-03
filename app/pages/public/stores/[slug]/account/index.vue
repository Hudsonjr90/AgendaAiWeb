
<template>
  <q-page class="account-page q-pa-md q-pa-lg-xl">
    <div class="account-container">
      <div class="row items-center justify-between q-col-gutter-md q-mb-lg">
        <div class="col">
          <div class="text-overline text-primary text-weight-bold">
            Minha conta
          </div>
          <h1 class="text-h4 text-weight-bold q-my-sm">
            Olá, {{ auth.customer?.firstName || 'cliente' }}!
          </h1>
          <p class="text-body2 text-grey-7 q-mb-none">
            Acompanhe seus dados e seus agendamentos.
          </p>
        </div>

        <div class="col-auto">
          <q-btn
            outline
            rounded
            no-caps
            color="grey-8"
            icon="mdi-logout"
            label="Sair"
            @click="logout"
          />
        </div>
      </div>

      <q-card flat bordered class="account-card q-mb-md">
        <q-card-section class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar size="64px" color="primary" text-color="white">
              <span class="text-h5 text-weight-bold">
                {{ initials }}
              </span>
            </q-avatar>
          </div>

          <div class="col">
            <div class="text-h6 text-weight-bold">
              {{ fullName }}
            </div>
            <div class="text-body2 text-grey-7">
              {{ auth.customer?.email }}
            </div>
            <div
              v-if="auth.customer?.phone"
              class="text-body2 text-grey-7"
            >
              {{ auth.customer.phone }}
            </div>
          </div>

          <div class="col-12 col-sm-auto">
            <q-badge
              color="positive"
              label="Conta ativa"
              rounded
              class="q-px-md q-py-sm"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="account-card">
        <q-card-section>
          <div class="row items-center q-col-gutter-md">
            <div class="col">
              <div class="text-h6 text-weight-bold">
                Meus agendamentos
              </div>
              <div class="text-body2 text-grey-7 q-mt-xs">
                Em breve, você poderá consultar seus horários por aqui.
              </div>
            </div>
            <div class="col-auto">
              <q-icon
                name="mdi-calendar-clock-outline"
                color="primary"
                size="36px"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="q-mt-lg">
        <q-btn
          color="primary"
          unelevated
          rounded
          no-caps
          icon="mdi-storefront-outline"
          label="Voltar para a loja"
          :to="`/public/stores/${slug}`"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCustomerAuthStore } from '~/stores/customer-auth';

definePageMeta({
  layout: 'public-store',
  middleware: ['customer-auth'],
});

const route = useRoute();
const auth = useCustomerAuthStore();

const slug = computed(() => String(route.params.slug ?? ''));

const fullName = computed(() => {
  const customer = auth.customer;

  return customer
    ? `${customer.firstName} ${customer.lastName}`.trim()
    : 'Cliente';
});

const initials = computed(() => {
  const names = fullName.value.split(/\s+/).filter(Boolean);

  return names
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join('');
});

const logout = async () => {
  auth.logout();

  await navigateTo(`/public/stores/${slug.value}/login`);
};

useHead({
  title: 'Minha conta | AgendaAi',
});
</script>

<style scoped>
.account-page {
  min-height: 70vh;
  background: #f7f7fb;
}

.account-container {
  width: min(100%, 1000px);
  margin: 0 auto;
}

.account-card {
  border-radius: 18px;
}
</style>
