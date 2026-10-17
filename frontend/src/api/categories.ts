import { api } from './client'

export interface Category {
  id: number
  name: string
}

export async function getCategories() {
  const { data } = await api.get<Category[]>('/categories')
  return data
}

export async function createCategory(name: string) {
  const { data } = await api.post<Category>('/categories', { name })
  return data
}
