import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCategory, getCategories, type Category } from '../api/categories'
import { createExpense, deleteExpense, getExpenses, updateExpense, type Expense, type ExpensePayload } from '../api/expenses'
import { useAuth } from '../auth/AuthContext'
import { Brand } from '../components/Brand'

const numberFormat = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const monthFormat = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })

function currentMonthValue() {
  return localDateValue(new Date()).slice(0, 7)
}

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
  const [monthFilter, setMonthFilter] = useState(currentMonthValue)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')

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

  const monthExpenses = expenses.filter((expense) => expense.expenseDate.startsWith(monthFilter))
  const total = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const categoryTotals = monthExpenses.reduce<Record<string, { name: string; total: number }>>((result, expense) => {
    const key = String(expense.category?.id ?? 'uncategorized')
    const name = expense.category?.name || 'Uncategorized'
    result[key] = { name, total: (result[key]?.total ?? 0) + Number(expense.amount) }
    return result
  }, {})
  const topCategories = Object.values(categoryTotals).sort((a, b) => b.total - a.total).slice(0, 4)
  const normalizedSearch = search.trim().toLocaleLowerCase()
  const visibleExpenses = expenses.filter((expense) => {
    const matchesCategory = categoryFilter === 'all' || String(expense.category?.id ?? '') === categoryFilter
    const matchesSearch = !normalizedSearch || `${expense.description ?? ''} ${expense.category?.name ?? ''}`.toLocaleLowerCase().includes(normalizedSearch)
    return matchesCategory && matchesSearch
  })

  function exportExpenses() {
    const columns = ['Date', 'Category', 'Description', 'Amount']
    const rows = visibleExpenses.map((expense) => [
      expense.expenseDate,
      expense.category?.name || 'Uncategorized',
      expense.description?.trim() ?? '',
      Number(expense.amount).toFixed(2),
    ])
    const csv = [columns, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\r\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `finance-manager-expenses-${localDateValue(new Date())}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }
  const monthLabel = (() => {
    const date = new Date(`${monthFilter}-01T00:00:00Z`)
    return Number.isNaN(date.getTime()) ? monthFilter : monthFormat.format(date)
  })()

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
            <label className="block text-sm text-muted" htmlFor="month-filter">Spending in</label>
            <input id="month-filter" className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-xl font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-forest/30" type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} />
            <p className="mt-2 text-xs text-muted">{monthLabel}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.03]">
            <p className="text-sm text-muted">{monthLabel} total</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{loading ? '—' : numberFormat.format(total)}</p>
            <p className="mt-2 text-xs text-muted">{monthExpenses.length} {monthExpenses.length === 1 ? 'expense' : 'expenses'} recorded</p>
          </div>
        </div>

        <section className="mt-5 rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.03] sm:p-6" aria-labelledby="category-summary-title">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="category-summary-title" className="text-lg font-semibold text-ink">Where it went</h2>
            <p className="text-sm text-muted">{monthLabel}</p>
          </div>
          {loading ? <p className="mt-5 text-sm text-muted" role="status">Updating your summary…</p> : topCategories.length === 0 ? (
            <p className="mt-5 text-sm text-muted">No expenses recorded for this month yet.</p>
          ) : (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topCategories.map((category) => {
                const share = total > 0 ? Math.round(category.total / total * 100) : 0
                return <li key={category.name} className="min-w-0">
                  <div className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium text-ink">{category.name}</span><span className="shrink-0 tabular-nums text-muted">{numberFormat.format(category.total)}</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-mint" role="meter" aria-label={`${category.name} share of monthly spending`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={share}><div className="h-full rounded-full bg-forest" style={{ width: `${share}%` }} /></div>
                  <p className="mt-1 text-xs text-muted">{share}% of monthly spending</p>
                </li>
              })}
            </ul>
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-sm shadow-ink/[0.03]" aria-labelledby="expenses-title">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-5 sm:px-7">
            <div>
              <h2 id="expenses-title" className="text-lg font-semibold text-ink">Your expenses</h2>
              <p className="mt-1 text-sm text-muted">Recorded activity from this account.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm font-semibold text-forest hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline" onClick={exportExpenses} disabled={visibleExpenses.length === 0}>
                Export CSV
              </button>
              <button className="text-sm font-semibold text-forest hover:underline" onClick={() => { setShowCategoryForm((show) => !show); setCategoryNotice('') }}>{showCategoryForm ? 'Cancel category' : 'Add category'}</button>
              {categoryError && <p className="text-sm text-red-700" role="alert">{categoryError}</p>}
            </div>
          </div>
          {categoryNotice && <p className="border-b border-line px-5 py-3 text-sm text-forest sm:px-7" role="status">{categoryNotice}</p>}
          {showCategoryForm && <CategoryForm onCancel={() => setShowCategoryForm(false)} onSave={saveCategory} />}
          {(showForm || editingExpense) && <ExpenseForm key={editingExpense?.id ?? 'new'} categories={categories} initial={editingExpense ?? undefined} onCancel={cancelForm} onSave={saveExpense} />}
          {actionError && <p className="px-5 pt-4 text-sm text-red-700 sm:px-7" role="alert">{actionError}</p>}
          <div className="grid gap-3 border-b border-line bg-paper/40 px-5 py-4 sm:grid-cols-[1fr_220px] sm:px-7">
            <label className="sr-only" htmlFor="expense-search">Search expenses</label>
            <input id="expense-search" className="field-input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search descriptions or categories" />
            <label className="sr-only" htmlFor="category-filter">Filter by category</label>
            <select id="category-filter" className="field-input" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
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
          ) : visibleExpenses.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-medium text-ink">No matching expenses</p>
              <p className="mt-2 text-sm text-muted">Try another search or category.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {visibleExpenses.map((expense) => (
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
