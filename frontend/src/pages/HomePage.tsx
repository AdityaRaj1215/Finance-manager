import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCategory, getCategories, type Category } from '../api/categories'
import { createExpense, deleteExpense, getExpenses, updateExpense, type Expense, type ExpensePayload } from '../api/expenses'
import { useAuth } from '../auth/AuthContext'
import { Brand } from '../components/Brand'

const numberFormat = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function localDateValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : dateFormat.format(date)
}

interface ExpenseFormProps {
  categories: Category[]
  initial?: Expense
  onCancel: () => void
  onSave: (payload: ExpensePayload) => Promise<void>
}

function ExpenseForm({ categories, initial, onCancel, onSave }: ExpenseFormProps) {
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [categoryId, setCategoryId] = useState(initial ? String(initial.category.id) : '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [expenseDate, setExpenseDate] = useState(initial?.expenseDate ?? localDateValue(new Date()))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({ amount: Number(amount), categoryId: Number(categoryId), description: description.trim(), expenseDate })
    } catch {
      setError('We couldn’t save this expense. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="border-b border-line bg-paper/60 px-5 py-6 sm:px-7" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink">Amount
          <input className="field-input mt-2" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" required />
        </label>
        <label className="text-sm font-medium text-ink">Category
          <select className="field-input mt-2" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
            <option value="" disabled>Select a category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-ink">Date
          <input className="field-input mt-2" type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} required />
        </label>
        <label className="text-sm font-medium text-ink">Description <span className="font-normal text-muted">(optional)</span>
          <input className="field-input mt-2" type="text" maxLength={255} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What was this expense for?" />
        </label>
      </div>
      {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="primary-button min-h-0 px-5 py-2.5" type="submit" disabled={saving || categories.length === 0}>{saving ? 'Saving…' : initial ? 'Save changes' : 'Add expense'}</button>
      </div>
    </form>
  )
}

interface CategoryFormProps {
  onCancel: () => void
  onSave: (name: string) => Promise<void>
}

function CategoryForm({ onCancel, onSave }: CategoryFormProps) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(name.trim())
    } catch {
      setError('We couldn’t save this category. It may already exist; please check and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="border-b border-line bg-paper/60 px-5 py-5 sm:px-7" onSubmit={submit}>
      <label className="block text-sm font-medium text-ink">Category name
        <input className="field-input mt-2" type="text" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Groceries" required />
      </label>
      {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
      <div className="mt-4 flex justify-end gap-3">
        <button className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="primary-button min-h-0 px-5 py-2.5" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save category'}</button>
      </div>
    </form>
  )
}

export function HomePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [categoryNotice, setCategoryNotice] = useState('')
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [actionError, setActionError] = useState('')

  async function refreshExpenses() {
    const items = await getExpenses()
    setExpenses(items)
  }

  useEffect(() => {
    let active = true
    getExpenses()
      .then((items) => { if (active) setExpenses(items) })
      .catch(() => { if (active) setError('We couldn’t load your expenses. Check your connection and try again.') })
      .finally(() => { if (active) setLoading(false) })
    getCategories()
      .then((items) => { if (active) setCategories(items) })
      .catch(() => { if (active) setCategoryError('Categories could not be loaded. Please try again later.') })
    return () => { active = false }
  }, [])

  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

  async function saveExpense(payload: ExpensePayload) {
    if (editingExpense) {
      const updated = await updateExpense(editingExpense.id, payload)
      setExpenses((current) => current.map((expense) => expense.id === updated.id ? updated : expense))
    } else {
      const created = await createExpense(payload)
      setExpenses((current) => [created, ...current])
    }
    setEditingExpense(null)
    setShowForm(false)
    setActionError('')
  }

  async function saveCategory(name: string) {
    const created = await createCategory(name)
    setCategories((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)))
    setShowCategoryForm(false)
    setCategoryError('')
    setCategoryNotice(`“${created.name}” is ready to use.`)
  }

  async function removeExpense(expense: Expense) {
    const label = expense.description?.trim() || expense.category?.name || 'this expense'
    if (!window.confirm(`Delete ${label}? This can’t be undone.`)) return
    setActionError('')
    try {
      await deleteExpense(expense.id)
      setExpenses((current) => current.filter((item) => item.id !== expense.id))
    } catch {
      setActionError('We couldn’t delete this expense. Please try again.')
    }
  }

  function cancelForm() {
    setEditingExpense(null)
    setShowForm(false)
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Brand />
          <button className="text-sm font-medium text-muted transition hover:text-ink" onClick={() => { signOut(); navigate('/login', { replace: true }) }}>Sign out</button>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="eyebrow">YOUR FINANCE SPACE</span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Welcome in, {user?.name.split(' ')[0]}.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">A clear view of the expenses you’ve recorded.</p>
          </div>
          <button className="primary-button px-5" onClick={() => { setEditingExpense(null); setShowForm(true); setActionError('') }}>Add expense</button>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.03]">
            <p className="text-sm text-muted">Expenses recorded</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{loading ? '—' : expenses.length}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.03]">
            <p className="text-sm text-muted">Total recorded</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{loading ? '—' : numberFormat.format(total)}</p>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-sm shadow-ink/[0.03]" aria-labelledby="expenses-title">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-5 sm:px-7">
            <div>
              <h2 id="expenses-title" className="text-lg font-semibold text-ink">Your expenses</h2>
              <p className="mt-1 text-sm text-muted">Recorded activity from this account.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm font-semibold text-forest hover:underline" onClick={() => { setShowCategoryForm((show) => !show); setCategoryNotice('') }}>{showCategoryForm ? 'Cancel category' : 'Add category'}</button>
              {categoryError && <p className="text-sm text-red-700" role="alert">{categoryError}</p>}
            </div>
          </div>
          {categoryNotice && <p className="border-b border-line px-5 py-3 text-sm text-forest sm:px-7" role="status">{categoryNotice}</p>}
          {showCategoryForm && <CategoryForm onCancel={() => setShowCategoryForm(false)} onSave={saveCategory} />}
          {(showForm || editingExpense) && <ExpenseForm key={editingExpense?.id ?? 'new'} categories={categories} initial={editingExpense ?? undefined} onCancel={cancelForm} onSave={saveExpense} />}
          {actionError && <p className="px-5 pt-4 text-sm text-red-700 sm:px-7" role="alert">{actionError}</p>}
          {loading ? (
            <p className="px-5 py-10 text-center text-sm text-muted" role="status">Loading your expenses…</p>
          ) : error ? (
            <div className="px-5 py-10 text-center" role="alert">
              <p className="text-sm text-ink">{error}</p>
              <button className="mt-4 text-sm font-semibold text-forest underline-offset-4 hover:underline" onClick={() => {
                setLoading(true)
                setError('')
                refreshExpenses().catch(() => setError('We couldn’t load your expenses. Check your connection and try again.')).finally(() => setLoading(false))
              }}>Try again</button>
            </div>
          ) : expenses.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-medium text-ink">No expenses yet</p>
              <p className="mt-2 text-sm text-muted">Add your first expense to start tracking your spending.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{expense.description?.trim() || expense.category?.name || 'Expense'}</p>
                    <p className="mt-1 text-sm text-muted">{expense.category?.name || 'Uncategorized'} · {formatDate(expense.expenseDate)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <p className="shrink-0 font-semibold tabular-nums text-ink">{numberFormat.format(Number(expense.amount))}</p>
                    <div className="flex gap-3 text-sm">
                      <button className="font-medium text-forest hover:underline" onClick={() => { setEditingExpense(expense); setShowForm(false); setActionError('') }}>Edit</button>
                      <button className="font-medium text-red-700 hover:underline" onClick={() => removeExpense(expense)}>Delete</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}
