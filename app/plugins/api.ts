import type { $Fetch } from 'ofetch'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,

    onRequest({ options }) {
      const headers = new Headers(options.headers)

      if (headers.has('Authorization')) {
        options.headers = headers
        return
      }

      if (!authStore.accessToken) {
        return
      }

      headers.set(
        'Authorization',
        `${authStore.tokenType ?? 'Bearer'} ${authStore.accessToken}`,
      )

      options.headers = headers
    },

    async onResponseError({ response, options }) {
      if (
        response.status !== 401 ||
        new Headers(options.headers).has('Authorization')
      ) {
        return
      }

      authStore.logout()

      await navigateTo('/auth/login')
    },
  }) as $Fetch

  return {
    provide: {
      api,
    },
  }
})