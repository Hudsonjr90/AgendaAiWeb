import type { ModuleOptions } from 'nuxt-quasar-ui'

export const quasarOptions: ModuleOptions = {
  sassVariables: '@/assets/styles/quasar-variable.scss',

  lang: 'pt-BR',

  plugins: [
    'Dialog',
    'Loading',
    'LoadingBar',
    'Notify',
    'Dark',
  ],

  iconSet: 'mdi-v7',

  extras: {
    fontIcons: [
      'mdi-v7',
    ],
  },

  config: {
    dark: false,
    loading: {
      message: 'Carregando...',
      spinnerColor: 'primary',
    },

    notify: {
      position: 'top',
      timeout: 2500,
    },
  },
}