export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true,
  },

  devServer: {
    port: 3005,
  },

  css: ['~/assets/styles/main.scss'],

  runtimeConfig: {
    public: {
      apiBaseUrl: '',
    },
  },

  modules: [
    'nuxt-quasar-ui',
    '@pinia/nuxt',
  ],

  quasar: {
    lang: 'pt-BR',
    iconSet: 'mdi-v7',

    extras: {
      fontIcons: ['mdi-v7'],
    },
  },
})