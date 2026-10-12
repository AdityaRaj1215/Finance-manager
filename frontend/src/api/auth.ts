import { api } from './client'

export interface User {
  userId: number
  name: string
  email: string
}

export interface LoginResponse extends User {
  token: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export async function login(email: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
  return data
}

export async function register(payload: RegisterRequest) {
  const { data } = await api.post<User>('/users', payload)
  return data
}
