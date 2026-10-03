import type { OrganizationRole } from '~/types/api'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  const allowedRoles = to.meta.roles as OrganizationRole[] | undefined

  if (!allowedRoles?.length) {
    return
  }

  if (!authStore.role || !allowedRoles.includes(authStore.role)) {
    return navigateTo('/admin/dashboard')
  }
})