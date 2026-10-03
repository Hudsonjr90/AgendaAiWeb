
import { defineStore } from 'pinia';

export interface CustomerProfile {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  status: string;
}

interface CustomerAuthResponse {
  customer: CustomerProfile;
  accessToken: string;
  tokenType: 'Bearer';
}

export const useCustomerAuthStore = defineStore('customer-auth', () => {
  const api = useApi();

  const accessToken = useCookie<string | null>(
    'agendaai_customer_token',
    {
      sameSite: 'lax',
      secure: import.meta.env.PROD,
      maxAge: 60 * 60,
    },
  );

  const customer = ref<CustomerProfile | null>(null);
  const loading = ref(false);
  const isAuthenticated = computed(
    () => Boolean(accessToken.value && customer.value),
  );

  const getErrorMessage = (
    error: unknown,
    fallback: string,
  ): string => {
    if (typeof error !== 'object' || error === null) {
      return fallback;
    }

    const apiError = error as {
      data?: { message?: string | string[] };
      response?: {
        _data?: { message?: string | string[] };
      };
    };

    const message =
      apiError.data?.message ??
      apiError.response?._data?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return message || fallback;
  };

  const saveSession = (response: CustomerAuthResponse) => {
    accessToken.value = response.accessToken;
    customer.value = response.customer;
  };

  const register = async (
    publicSlug: string,
    data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      cpf?: string;
      phone?: string;
    },
  ) => {
    loading.value = true;

    try {
      const response = await api<CustomerAuthResponse>(
        `/customer-auth/${encodeURIComponent(publicSlug)}/register`,
        {
          method: 'POST',
          body: data,
        },
      );

      saveSession(response);
      return response.customer;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, 'Não foi possível realizar o cadastro.'),
      );
    } finally {
      loading.value = false;
    }
  };

  const login = async (
    publicSlug: string,
    email: string,
    password: string,
  ) => {
    loading.value = true;

    try {
      const response = await api<CustomerAuthResponse>(
        '/customer-auth/login',
        {
          method: 'POST',
          body: {
            publicSlug,
            email,
            password,
          },
        },
      );

      saveSession(response);
      return response.customer;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, 'E-mail ou senha inválidos.'),
      );
    } finally {
      loading.value = false;
    }
  };

  const fetchMe = async (): Promise<boolean> => {
    if (!accessToken.value) {
      customer.value = null;
      return false;
    }

    loading.value = true;

    try {
      customer.value = await api<CustomerProfile>(
        '/customer-auth/me',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
          },
        },
      );

      return true;
    } catch {
      logout();
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    accessToken.value = null;
    customer.value = null;
  };

  return {
    accessToken,
    customer,
    loading,
    isAuthenticated,
    register,
    login,
    fetchMe,
    logout,
  };
});
