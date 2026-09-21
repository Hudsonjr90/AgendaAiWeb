export const useUserInitials = () => {
  const authStore = useAuthStore()

  const initials = computed(() => {
    const firstName = authStore.user?.firstName?.trim()
    const lastName = authStore.user?.lastName?.trim()

    if (!firstName) {
      return ''
    }

    const firstInitial = firstName.charAt(0).toUpperCase()
    const lastInitial = lastName?.charAt(0).toUpperCase() ?? ''

    return `${firstInitial}${lastInitial}`
  })

  return {
    initials,
  }
}