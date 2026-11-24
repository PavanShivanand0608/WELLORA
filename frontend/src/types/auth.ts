export interface AuthenticatedUser {
  id: string
  fullName: string
  email: string
  createdAt: string
  profile: {
    age?: number
    gender?: string
    heightCm?: number
    weightKg?: number
    activityLevel?: 'LOW' | 'MODERATE' | 'HIGH'
  }
}

export interface RegisterCredentials {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginCredentials {
  email: string
  password: string
}
