export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string 
  cpf: string 
}

export interface LoginOrganization {
  id: string
  name: string
  slug: string
}

export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF'

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
  street: string | null
  number: string | null
  complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
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

export interface Professional {
  id: string
  organizationId: string
  storeId: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  description: string | null
  avatarUrl: string | null
  status: 'ACTIVE' | 'INACTIVE'
  services?: ProfessionalServiceLink[]
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  organizationId: string
  name: string
  description: string | null
  durationMinutes: number
  priceCents: number
  status: 'ACTIVE' | 'INACTIVE'
  stores?: ServiceStoreLink[]
  createdAt?: string
  updatedAt?: string
}

export interface ServiceStoreLink {
  id: string
  serviceId: string
  storeId: string
  store?: Store
}

export interface StoreServiceOption {
  serviceId: string
  service: Service
}

export interface ProfessionalServiceLink {
  id: string
  professionalId: string
  serviceId: string
  service: Service
}

export type DayOfWeek =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'

export interface BusinessHour {
  id: string
  storeId: string
  day: DayOfWeek
  isOpen: boolean
  opensAt: string | null
  closesAt: string | null
}