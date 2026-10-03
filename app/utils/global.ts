import type { OrganizationRole } from '~/types/api'

export function roleLabel(role: OrganizationRole | null): string {
  switch (role) {
    case 'OWNER':
      return 'Proprietário'

    case 'ADMIN':
      return 'Administrador'

    case 'MANAGER':
      return 'Gerente'

    case 'STAFF':
      return 'Funcionário'

    default:
      return 'Desconhecido'
  }
}

function parseDate(value: Date | string): Date | null {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value: Date | string): string {
  const date = parseDate(value)
  if (!date) return '—'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(date)
}

export function formatDateTime(value: Date | string): string {
  const date = parseDate(value)
  if (!date) return '—'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function formatTime(value: Date | string): string {
  const date = parseDate(value)
  if (!date) return '—'

  return new Intl.DateTimeFormat('pt-BR', {
    timeStyle: 'short',
  }).format(date)
}

export function getErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    data?: { message?: string | string[] }
    response?: { _data?: { message?: string | string[] } }
    message?: string
  }

  const message =
    err?.data?.message ?? err?.response?._data?.message ?? err?.message

  return Array.isArray(message) ? message.join(', ') : message || fallback
}

export function appointmentStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pendente'
    case 'CONFIRMED':
      return 'Confirmado'
    case 'COMPLETED':
      return 'Concluído'
    case 'CANCELLED':
      return 'Cancelado'
    case 'NO_SHOW':
      return 'Não compareceu'
    default:
      return status
  }
}

export function paymentStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pendente'
    case 'PARTIAL':
      return 'Parcial'
    case 'PAID':
      return 'Pago'
    case 'REFUNDED':
      return 'Reembolsado'
    case 'FAILED':
      return 'Falhou'
    default:
      return status
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Ativo'
    case 'INACTIVE':
      return 'Inativo'
    case 'SUSPENDED':
      return 'Suspenso'
    default:
      return status
  }
}

export function phoneFormat(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

export function cpfFormat(cpf: string): string {
  if (!cpf) return ''
  const cleaned = cpf.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/)
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`
  }
  return cpf
}

export function isValidCpf(value?: string) {
  if (!value) return true

  const cpf = value.replace(/\D/g, '')

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  const calculateDigit = (length: number) => {
    let sum = 0

    for (let index = 0; index < length; index++) {
      sum += Number(cpf[index]) * (length + 1 - index)
    }

    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  return (
    calculateDigit(9) === Number(cpf[9]) &&
    calculateDigit(10) === Number(cpf[10])
  )
}
