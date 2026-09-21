import type { OrganizationRole } from '~/types/api'

declare module 'vue-router' {
  interface RouteMeta {
    roles?: OrganizationRole[]
  }
}

export {}