<script setup lang="ts">
const route = useRoute()
const planCodes = ['STARTER', 'PRO', 'PREMIUM']
const query = {
  ...(typeof route.query.plan === 'string' &&
  planCodes.includes(route.query.plan)
    ? { plan: route.query.plan }
    : {}),
  ...(route.query.billingCycle === 'YEARLY' ||
  route.query.billingCycle === 'MONTHLY'
    ? { billingCycle: route.query.billingCycle }
    : {}),
}

await navigateTo(
  { path: '/checkout/start', query },
  { replace: true },
)
</script>
