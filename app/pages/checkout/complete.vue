<template>
  <q-page class="row justify-center items-center q-pa-md">
    <q-card
      flat
      bordered
      class="q-pa-lg text-center"
      style="width: 520px; max-width: 100%"
    >
      <q-icon :name="statusIcon" :color="statusColor" size="52px" />
      <div class="text-h5 text-weight-bold q-mt-md">{{ title }}</div>
      <div class="text-body1 text-grey-7 q-mt-sm">{{ description }}</div>

      <q-form
        v-if="status === 'PAID' && reference"
        class="q-mt-lg"
        @submit.prevent="resendRegistrationLink"
      >
        <q-input
          v-model="email"
          outlined
          dense
          type="email"
          label="E-mail usado na compra"
          autocomplete="email"
          :disable="resendLoading"
          :rules="[
            (value) => /.+@.+\..+/.test(value) || 'Informe um e-mail válido.',
          ]"
        />
        <q-btn
          type="submit"
          outline
          color="primary"
          no-caps
          label="Reenviar link de cadastro"
          :loading="resendLoading"
        />
      </q-form>

      <q-spinner v-if="loading" color="primary" size="32px" class="q-mt-lg" />
      <q-btn
        v-else-if="status === 'PENDING_PAYMENT'"
        outline
        color="primary"
        no-caps
        label="Verificar novamente"
        class="q-mt-lg"
        :loading="refreshing"
        @click="loadStatus"
      />
      <q-btn
        v-else-if="status === 'REGISTERED'"
        color="primary"
        unelevated
        no-caps
        label="Acessar minha conta"
        to="/auth/login"
        class="q-mt-lg"
      />
      <q-btn
        v-else-if="
          status === 'CANCELED' || status === 'EXPIRED' || status === 'FAILED'
        "
        color="primary"
        unelevated
        no-caps
        label="Escolher outro plano"
        to="/#planos"
        class="q-mt-lg"
      />

      <div class="q-mt-md">
        <q-btn flat no-caps color="grey-7" label="Voltar ao AgendaAi" to="/" />
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import type { PublicPurchaseStatus } from '~/types/api'
import { getErrorMessage } from '~/utils/global'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const api = useApi()
const $q = useQuasar()
const reference = ref(
  typeof route.query.purchaseReference === 'string'
    ? route.query.purchaseReference
    : '',
)
const status = ref<PublicPurchaseStatus['status'] | null>(null)
const registrationEmailSent = ref(false)
const email = ref('')
const loading = ref(true)
const refreshing = ref(false)
const resendLoading = ref(false)
let pollTimer: ReturnType<typeof setInterval> | undefined

const title = computed(() => {
  if (status.value === 'REGISTERED') return 'Cadastro concluído'
  if (status.value === 'PAID') return 'Pagamento confirmado'
  if (status.value === 'CANCELED') return 'Checkout cancelado'
  if (status.value === 'EXPIRED') return 'Checkout expirado'
  if (status.value === 'FAILED') return 'Não foi possível iniciar o checkout'
  return 'Aguardando confirmação do pagamento'
})

const description = computed(() => {
  if (status.value === 'REGISTERED') {
    return 'Sua conta e assinatura estão prontas. Entre para continuar a configuração da empresa.'
  }
  if (status.value === 'PAID' && registrationEmailSent.value) {
    return 'Enviamos ao e-mail informado um link seguro para criar sua senha e concluir o cadastro. Confira também a caixa de spam.'
  }
  if (status.value === 'PAID') {
    return 'Estamos preparando o link para concluir seu cadastro. Ele será enviado ao e-mail informado na compra.'
  }
  if (status.value === 'CANCELED') {
    return 'Nenhuma conta foi criada. Você pode escolher um plano e iniciar novamente quando quiser.'
  }
  if (status.value === 'EXPIRED') {
    return 'O checkout expirou e nenhuma conta foi criada. Escolha um plano para tentar novamente.'
  }
  if (status.value === 'FAILED') {
    return 'Não foi possível criar o checkout. Tente escolher o plano novamente.'
  }
  return 'A confirmação é feita pelo Asaas. Assim que recebermos o pagamento, enviaremos o link para concluir seu cadastro.'
})

const statusIcon = computed(() => {
  if (status.value === 'REGISTERED' || status.value === 'PAID') {
    return 'mdi-check-circle-outline'
  }
  if (
    status.value === 'CANCELED' ||
    status.value === 'EXPIRED' ||
    status.value === 'FAILED'
  ) {
    return 'mdi-alert-circle-outline'
  }
  return 'mdi-clock-outline'
})

const statusColor = computed(() => {
  if (status.value === 'REGISTERED' || status.value === 'PAID')
    return 'positive'
  if (
    status.value === 'CANCELED' ||
    status.value === 'EXPIRED' ||
    status.value === 'FAILED'
  ) {
    return 'warning'
  }
  return 'primary'
})

async function loadStatus() {
  if (!reference.value) {
    loading.value = false
    status.value = 'FAILED'
    return
  }

  refreshing.value = true
  try {
    const result = await api<PublicPurchaseStatus>(
      `/billing/purchases/${encodeURIComponent(reference.value)}`,
    )
    status.value = result.status
    registrationEmailSent.value = result.registrationEmailSent
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível consultar o pagamento.',
      ),
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function resendRegistrationLink() {
  if (!reference.value || resendLoading.value) return

  resendLoading.value = true
  try {
    const result = await api<{ message: string }>(
      `/billing/purchases/${encodeURIComponent(reference.value)}/registration-link`,
      {
        method: 'POST',
        body: { email: email.value },
      },
    )
    $q.notify({ type: 'positive', message: result.message })
    await loadStatus()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'Não foi possível solicitar outro link.'),
    })
  } finally {
    resendLoading.value = false
  }
}

onMounted(() => {
  if (!reference.value) {
    reference.value =
      window.sessionStorage.getItem('agendaai:checkout-reference') ?? ''
  }
  void loadStatus()
  pollTimer = setInterval(() => {
    if (status.value === 'PENDING_PAYMENT' || status.value === 'PAID') {
      void loadStatus()
    }
  }, 5000)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>
