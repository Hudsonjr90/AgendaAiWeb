import type { $Fetch } from 'ofetch'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,

    onRequest({ options }) {
      if (!authStore.accessToken) {
        return
      }

      const headers = new Headers(options.headers)

      headers.set(
        'Authorization',
        `${authStore.tokenType ?? 'Bearer'} ${authStore.accessToken}`,
      )

      options.headers = headers
    },

    async onResponseError({ response }) {
      if (response.status !== 401) {
        return
      }

      authStore.clearSession()

      await navigateTo('/auth/login')
    },
  }) as $Fetch

  return {
    provide: {
      api,
    },
  }
})