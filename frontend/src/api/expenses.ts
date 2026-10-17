import { api } from './client'

export interface Expense {
  id: number
  amount: number
  category: { id: number; name: string }
  description: string | null
  expenseDate: string
}

export interface ExpensePayload {
  amount: number
  categoryId: number
  description: string
  expenseDate: string
}

export async function getExpenses() {
  const { data } = await api.get<Expense[]>('/expenses')
  return data
}

export async function createExpense(payload: ExpensePayload) {
  const { data } = await api.post<Expense>('/expenses', payload)
  return data
}

export async function updateExpense(id: number, payload: ExpensePayload) {
  const { data } = await api.put<Expense>(`/expenses/${id}`, payload)
  return data
}

export async function deleteExpense(id: number) {
  await api.delete(`/expenses/${id}`)
}
