import { quasarOptions } from './quasar-options'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true,
  },

  devServer: {
    port: 3005,
  },

  css: ['~/assets/styles/main.scss', 'leaflet/dist/leaflet.css'],

  runtimeConfig: {
    public: {
      apiBaseUrl: '',
      cloudinaryCloudName: '',
      cloudinaryProfessionalsUploadPreset: '',
      cloudinaryStoresUploadPreset: '',
    },
  },

  vite: {
    optimizeDeps: {
      include: ['leaflet', '@vue/devtools-core', '@vue/devtools-kit'],
    },
  },

  modules: ['nuxt-quasar-ui', '@pinia/nuxt'],

  quasar: quasarOptions,

  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.png',
        },
      ],
    },
  },
})
