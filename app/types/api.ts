export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface LoginOrganization {
  id: string
  name: string
  slug: string
}

export type OrganizationRole =
  | 'OWNER'
  | 'ADMIN'
  | 'MANAGER'
  | 'STAFF'

export interface LoginResponse {
  accessToken: string
  tokenType: string
  user: User
  organization: LoginOrganization
  role: OrganizationRole
}

export interface DashboardSummary {
  appointmentsToday: number
  customers: number
  professionals: number
}

export interface DashboardCustomer {
  id: string
  name: string
}

export interface DashboardProfessional {
  id: string
  name: string
}

export interface DashboardService {
  id: string
  name: string
  durationMinutes: number
  priceCents: number
}

export interface DashboardStore {
  id: string
  name: string
}

export interface DashboardAppointment {
  id: string
  startsAt: string
  endsAt: string
  status: string
  paymentStatus: string
  customer: DashboardCustomer
  professional: DashboardProfessional
  service: DashboardService
  store: DashboardStore
}

export interface DashboardResponse {
  summary: DashboardSummary
  todayAppointments: DashboardAppointment[]
}

export interface Store {
  id: string
  organizationId: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  addressLine1: string | null
  addressLine2: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

export interface RegisterResponse {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  organization: {
    id: string
    name: string
    slug: string
  }
  role: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  updatedAt: string
}