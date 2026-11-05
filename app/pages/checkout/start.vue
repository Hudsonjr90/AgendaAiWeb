<template>
  <q-page class="row justify-center items-center q-pa-md">
    <q-card flat bordered class="q-pa-lg" style="width: 540px; max-width: 100%">
      <q-card-section class="text-center">
        <q-icon
          name="mdi-credit-card-check-outline"
          color="primary"
          size="42px"
        />
        <div class="text-h5 text-weight-bold q-mt-sm">Contrate seu plano</div>
        <div class="text-body2 text-grey-7 q-mt-sm">
          Primeiro concluiremos o pagamento. Depois, enviaremos um link para
          você criar a conta e configurar sua empresa.
        </div>
      </q-card-section>

      <q-card-section>
        <q-card flat class="bg-blue-1 q-mb-lg">
          <q-card-section class="row items-center justify-between q-px-md q-py-sm">
            <div>
              <div class="text-caption text-grey-9">Plano escolhido</div>
              <div class="text-subtitle1 text-weight-bold">
                {{ selectedPlanName }} ·
                {{ billingCycle === 'MONTHLY' ? 'mensal' : 'anual' }} ·
                {{ selectedPlanPrice }}
              </div>
            </div>
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              label="Trocar plano"
              to="/#planos"
            />
          </q-card-section>
        </q-card>

        <q-form class="q-gutter-sm" @submit.prevent="startCheckout">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">
            Dados para cobrança
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model.trim="firstName"
                outlined
                dense
                label="Nome"
                autocomplete="given-name"
                :disable="loading"
                :rules="[
                  (value) => !!value || 'Informe seu nome.',
                  (value) =>
                    value.length >= 2 || 'Informe ao menos 2 caracteres.',
                ]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.trim="lastName"
                outlined
                dense
                label="Sobrenome"
                autocomplete="family-name"
                :disable="loading"
                :rules="[
                  (value) => !!value || 'Informe seu sobrenome.',
                  (value) =>
                    value.length >= 2 || 'Informe ao menos 2 caracteres.',
                ]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="cpf"
                outlined
                dense
                label="CPF"
                mask="###.###.###-##"
                autocomplete="off"
                :disable="loading"
                :rules="[
                  (value) =>
                    value.replace(/\D/g, '').length === 11 ||
                    'Informe um CPF válido.',
                ]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="phone"
                outlined
                dense
                mask="(##) #####-####"
                label="Telefone com DDD"
                type="tel"
                autocomplete="tel"
                :disable="loading"
                :rules="[
                  (value) =>
                    [10, 11].includes(value.replace(/\D/g, '').length) ||
                    'Informe um telefone com DDD.',
                ]"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="email"
                outlined
                dense
                label="E-mail"
                type="email"
                autocomplete="email"
                class="full-width"
                :disable="loading"
                :rules="[
                  (value) => !!value || 'Informe seu e-mail.',
                  (value) =>
                    /.+@.+\..+/.test(value) || 'Informe um e-mail válido.',
                ]"
              />
              <q-banner rounded class="bg-grey-2 text-grey-8 q-mt-md">
                O checkout recorrente é processado com segurança pelo Asaas e
                aceita cartão de crédito.
              </q-banner>

              <q-btn
                type="submit"
                color="primary"
                unelevated
                no-caps
                icon="mdi-lock-outline"
                label="Continuar para pagamento"
                class="full-width q-mt-md"
                :loading="loading"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import type {
  BillingCycle,
  PlanCode,
  PublicBillingCheckoutResponse,
} from '~/types/api'
import { getErrorMessage } from '~/utils/global'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const api = useApi()
const $q = useQuasar()
const planCodes: PlanCode[] = ['STARTER', 'PRO', 'PREMIUM']
const requestedPlan =
  typeof route.query.plan === 'string'
    ? planCodes.find((code) => code === route.query.plan)
    : undefined
const selectedPlanCode = ref<PlanCode>(requestedPlan ?? 'STARTER')
const billingCycle = ref<BillingCycle>(
  route.query.billingCycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY',
)
const planNames: Record<PlanCode, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  PREMIUM: 'Premium',
}
const selectedPlanName = computed(() => planNames[selectedPlanCode.value])
const selectedPlanPrice = computed(() => {
  const planPrices: Record<PlanCode, Record<BillingCycle, string>> = {
    STARTER: { MONTHLY: 'R$ 39,90', YEARLY: 'R$ 399,00' },
    PRO: { MONTHLY: 'R$ 59,90', YEARLY: 'R$ 599,00' },
    PREMIUM: { MONTHLY: 'R$ 99,90', YEARLY: 'R$ 999,00' },
  }
  return planPrices[selectedPlanCode.value][billingCycle.value]
})
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const cpf = ref('')
const phone = ref('')
const loading = ref(false)

async function startCheckout() {
  if (loading.value) return

  loading.value = true
  try {
    const checkout = await api<PublicBillingCheckoutResponse>(
      '/billing/checkout/public',
      {
        method: 'POST',
        body: {
          planCode: selectedPlanCode.value,
          billingCycle: billingCycle.value,
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          cpf: cpf.value.replace(/\D/g, ''),
          phone: phone.value.replace(/\D/g, ''),
        },
      },
    )
    window.sessionStorage.setItem(
      'agendaai:checkout-reference',
      checkout.purchaseReference,
    )
    window.location.assign(checkout.checkoutUrl)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'Não foi possível iniciar o pagamento.'),
    })
  } finally {
    loading.value = false
  }
}
</script>
