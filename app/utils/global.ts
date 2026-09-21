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

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatDateTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
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