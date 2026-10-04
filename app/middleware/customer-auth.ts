
import { useCustomerAuthStore } from '~/stores/customer-auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useCustomerAuthStore();
  const slug = String(to.params.slug ?? '');

  const loginPath = slug
    ? `/public/stores/${encodeURIComponent(slug)}/login`
    : '/customer/login';

  const redirectToLogin = () =>
    navigateTo({
      path: loginPath,
      query: {
        redirect: to.fullPath,
      },
    });

  if (!auth.accessToken) {
    return redirectToLogin();
  }

  if (!auth.customer) {
    try {
      await auth.fetchMe();
    } catch {
      auth.logout();
    }
  }

  if (!auth.isAuthenticated) {
    auth.logout();
    return redirectToLogin();
  }
});
