<template>
  <q-page class="q-pa-lg wrapper">
    <div class="row items-center justify-between q-gutter-md">
      <div>
        <div class="text-h4 text-weight-bold">Assinatura do AgendaAi</div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Gerencie seu plano e acompanhe os pagamentos.
        </div>
      </div>
      <q-btn
        v-if="subscription?.status === 'ACTIVE'"
        color="primary"
        unelevated
        no-caps
        label="Continuar configuração"
        to="/admin/onboarding"
      />
    </div>

    <q-card v-if="subscription" flat bordered class="q-mt-lg">
      <q-card-section class="row items-center justify-between q-gutter-md">
        <div>
          <div class="text-overline text-grey-7">Plano atual</div>
          <div class="text-h5 text-weight-bold">
            {{ subscription.plan.name }}
          </div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            Cobrança {{ subscription.billingCycle === 'MONTHLY' ? 'mensal' : 'anual' }}
            · {{ subscriptionStatusLabel }}
          </div>
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            v-if="subscription.checkoutUrl && subscription.status !== 'ACTIVE'"
            outline
            color="primary"
            no-caps
            label="Continuar pagamento"
            :href="subscription.checkoutUrl"
            target="_blank"
            rel="noopener noreferrer"
          />
          <q-btn
            flat
            round
            icon="mdi-refresh"
            aria-label="Atualizar status da assinatura"
            :loading="subscriptionLoading"
            @click="loadSubscription"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="subscription.status === 'PENDING_PAYMENT'">
        <div class="text-body1">
          O acesso será liberado após a confirmação do pagamento pelo Asaas.
        </div>
        <div class="text-caption text-grey-7 q-mt-sm">
          O redirecionamento de retorno não confirma o pagamento. Atualize o
          status após concluir o checkout.
        </div>
      </q-card-section>
      <q-card-section v-if="subscription.status === 'PAST_DUE'">
        <div class="text-body1">
          Há pagamentos em atraso. Quite uma cobrança no histórico abaixo para
          regularizar a assinatura.
        </div>
      </q-card-section>

      <q-card-section v-if="subscription.payments.length">
        <div class="text-subtitle1 text-weight-medium q-mb-sm">
          Histórico de pagamentos
        </div>
        <q-list separator>
          <q-item v-for="payment in subscription.payments" :key="payment.createdAt">
            <q-item-section>
              <q-item-label>
                {{ formatMoney(payment.amountCents, payment.currency) }}
              </q-item-label>
              <q-item-label caption>
                {{ formatDate(payment.createdAt) }} · {{ paymentStatusLabel(payment.status) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side v-if="payment.invoiceUrl">
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                label="Ver cobrança"
                :href="payment.invoiceUrl"
                target="_blank"
                rel="noopener noreferrer"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <template
      v-if="
        !subscription ||
        ['PENDING_PAYMENT', 'CANCELED', 'EXPIRED'].includes(subscription.status)
      "
    >
      <div class="row items-center justify-between q-mt-xl q-gutter-md">
        <div>
          <div class="text-h5 text-weight-bold">
            {{ subscription ? 'Escolher outro plano' : 'Escolha seu plano' }}
          </div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            O pagamento recorrente é processado em uma página segura do Asaas.
          </div>
        </div>
        <q-btn-toggle
          v-model="billingCycle"
          rounded
          unelevated
          toggle-color="primary"
          :options="[
            { label: 'Mensal', value: 'MONTHLY' },
            { label: 'Anual', value: 'YEARLY' },
          ]"
          aria-label="Ciclo de cobrança"
        />
      </div>

      <div v-if="plansLoading" class="row q-col-gutter-md q-mt-md">
        <div v-for="item in 3" :key="item" class="col-12 col-md-4">
          <q-card flat bordered><q-card-section><q-skeleton type="rect" height="220px" /></q-card-section></q-card>
        </div>
      </div>

      <div v-else class="row q-col-gutter-md q-mt-md">
        <div
          v-for="plan in plans"
          :key="plan.code"
          class="col-12 col-md-4"
        >
          <q-card
            flat
            bordered
            class="full-height"
            :class="{ 'plan-selected': selectedPlanCode === plan.code }"
          >
            <q-card-section>
              <div class="row items-center justify-between">
                <div class="text-h5 text-weight-bold">{{ plan.name }}</div>
                <q-icon
                  v-if="selectedPlanCode === plan.code"
                  name="mdi-check-circle"
                  color="primary"
                  size="24px"
                />
              </div>
              <div class="text-body2 text-grey-7 q-mt-sm">
                {{ plan.description }}
              </div>
              <div class="text-h5 text-primary text-weight-bold q-mt-md">
                {{ planPrice(plan) }}
                <span class="text-body2 text-grey-7 text-weight-regular">
                  / {{ billingCycle === 'MONTHLY' ? 'mês' : 'ano' }}
                </span>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-list dense>
                <q-item v-for="limit in plan.limits" :key="limit.resource">
                  <q-item-section avatar>
                    <q-icon name="mdi-check" color="positive" />
                  </q-item-section>
                  <q-item-section>
                    {{ resourceLabel(limit.resource, limit.maxQuantity) }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <q-card-actions class="q-pa-md">
              <q-btn
                :outline="selectedPlanCode !== plan.code"
                :color="selectedPlanCode === plan.code ? 'primary' : 'grey-8'"
                no-caps
                class="full-width"
                :label="selectedPlanCode === plan.code ? 'Plano selecionado' : 'Selecionar plano'"
                @click="selectedPlanCode = plan.code"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <div class="row justify-center q-mt-xl">
        <q-btn
          color="primary"
          unelevated
          rounded
          no-caps
          size="lg"
          icon="mdi-lock-outline"
          label="Ir para pagamento seguro"
          :loading="checkoutLoading"
          :disable="!selectedPlan"
          @click="startCheckout"
        />
      </div>
      <div class="text-caption text-grey-7 text-center q-mt-sm">
        Meios disponíveis para assinatura: Pix e cartão de crédito.
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import type {
  BillingCheckoutResponse,
  BillingCycle,
  BillingPlan,
  BillingSubscription,
  PlanCode,
  PlanLimitResource,
} from '~/types/api'
import { formatDate, getErrorMessage, paymentStatusLabel } from '~/utils/global'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const api = useApi()
const $q = useQuasar()
const planCodes: PlanCode[] = ['STARTER', 'PRO', 'PREMIUM']
const initialPlan =
  typeof route.query.plan === 'string'
    ? planCodes.find((code) => code === route.query.plan) ?? 'STARTER'
    : 'STARTER'
const selectedPlanCode = ref<PlanCode>(initialPlan)
const billingCycle = ref<BillingCycle>(
  route.query.billingCycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY',
)
const plans = ref<BillingPlan[]>([])
const subscription = ref<BillingSubscription | null>(null)
const plansLoading = ref(true)
const subscriptionLoading = ref(false)
const checkoutLoading = ref(false)
const selectedPlan = computed(() =>
  plans.value.find((plan) => plan.code === selectedPlanCode.value),
)
const subscriptionStatusLabel = computed(() => {
  switch (subscription.value?.status) {
    case 'ACTIVE':
      return 'Ativa'
    case 'PENDING_PAYMENT':
      return 'Aguardando pagamento'
    case 'PAST_DUE':
      return 'Pagamento em atraso'
    case 'CANCELED':
      return 'Cancelada'
    case 'EXPIRED':
      return 'Expirada'
    default:
      return ''
  }
})

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amountCents / 100)
}

function planPrice(plan: BillingPlan) {
  const price = plan.prices.find(
    (item) => item.billingCycle === billingCycle.value,
  )
  return price
    ? formatMoney(price.amountCents, price.currency)
    : 'Preço indisponível'
}

function resourceLabel(
  resource: PlanLimitResource,
  quantity: number | null,
) {
  const labels: Record<PlanLimitResource, { plural: string; unlimited: string }> = {
    STORES: { plural: 'lojas', unlimited: 'Lojas ilimitadas' },
    PROFESSIONALS: {
      plural: 'profissionais',
      unlimited: 'Profissionais ilimitados',
    },
    SERVICES: { plural: 'serviços', unlimited: 'Serviços ilimitados' },
  }
  return quantity === null
    ? labels[resource].unlimited
    : `Até ${quantity} ${labels[resource].plural}`
}

async function loadPlans() {
  plansLoading.value = true
  try {
    plans.value = await api<BillingPlan[]>('/billing/plans')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'Não foi possível carregar os planos.'),
    })
  } finally {
    plansLoading.value = false
  }
}

async function loadSubscription() {
  subscriptionLoading.value = true
  try {
    subscription.value = await api<BillingSubscription | null>(
      '/billing/subscription',
    )
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível consultar a assinatura.',
      ),
    })
  } finally {
    subscriptionLoading.value = false
  }
}

async function startCheckout() {
  if (!selectedPlan.value || checkoutLoading.value) return

  checkoutLoading.value = true
  try {
    const checkout = await api<BillingCheckoutResponse>(
      '/billing/checkout',
      {
        method: 'POST',
        body: {
          planCode: selectedPlanCode.value,
          billingCycle: billingCycle.value,
        },
      },
    )
    window.location.assign(checkout.checkoutUrl)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(
        error,
        'Não foi possível iniciar o checkout. Tente novamente.',
      ),
    })
  } finally {
    checkoutLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadPlans(), loadSubscription()])

  if (subscription.value && subscription.value.status !== 'ACTIVE') {
    selectedPlanCode.value = subscription.value.plan.code
    billingCycle.value = subscription.value.billingCycle
  }

  if (route.query.result === 'success') {
    if (subscription.value?.status === 'ACTIVE') {
      $q.notify({
        type: 'positive',
        message: 'Pagamento confirmado e assinatura ativa.',
      })
    } else {
      $q.notify({
        type: 'info',
        message:
          'Checkout concluído. A confirmação do pagamento está sendo processada.',
      })
    }
  } else if (route.query.result === 'cancelled') {
    $q.notify({
      type: 'warning',
      message: 'O checkout foi cancelado. Você pode tentar novamente.',
    })
  } else if (route.query.result === 'expired') {
    $q.notify({
      type: 'warning',
      message: 'O checkout expirou. Inicie um novo checkout para continuar.',
    })
  }
})
</script>

<style scoped>
.plan-selected {
  border: 2px solid var(--q-primary);
}
</style>
