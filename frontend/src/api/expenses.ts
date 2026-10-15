import { api } from './client'

export interface Expense {
  id: number
  amount: number
  category: { id: number; name: string }
  description: string | null
  expenseDate: string
}

export async function getExpenses() {
  const { data } = await api.get<Expense[]>('/expenses')
  return data
}
