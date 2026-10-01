export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export const useViaCep = () => {
  const loading = ref(false)

  const findByCep = async (
    cep: string,
  ): Promise<ViaCepResponse | null> => {
    const cleanCep = cep.replace(/\D/g, '')

    if (cleanCep.length !== 8) {
      return null
    }

    loading.value = true

    try {
      const response = await $fetch<ViaCepResponse>(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      )

      if (response.erro) {
        return null
      }

      return response
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    findByCep,
  }
}