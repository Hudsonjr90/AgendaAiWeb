export interface LoginUser {
  id: string
  name: string
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
  user: LoginUser
  organization: LoginOrganization
  role: OrganizationRole
}