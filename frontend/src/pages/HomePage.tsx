import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getExpenses, type Expense } from '../api/expenses'
import { useAuth } from '../auth/AuthContext'
import { Brand } from '../components/Brand'

const numberFormat = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : dateFormat.format(date)
}

export function HomePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getExpenses()
      .then((items) => { if (active) setExpenses(items) })
      .catch(() => { if (active) setError('We couldn’t load your expenses. Check your connection and try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Brand />
          <button className="text-sm font-medium text-muted transition hover:text-ink" onClick={() => { signOut(); navigate('/login', { replace: true }) }}>Sign out</button>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <span className="eyebrow">YOUR FINANCE SPACE</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Welcome in, {user?.name.split(' ')[0]}.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">A clear view of the expenses you’ve recorded.</p>

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
          <div className="border-b border-line px-5 py-5 sm:px-7">
            <h2 id="expenses-title" className="text-lg font-semibold text-ink">Your expenses</h2>
            <p className="mt-1 text-sm text-muted">Recorded activity from this account.</p>
          </div>
          {loading ? (
            <p className="px-5 py-10 text-center text-sm text-muted" role="status">Loading your expenses…</p>
          ) : error ? (
            <div className="px-5 py-10 text-center" role="alert">
              <p className="text-sm text-ink">{error}</p>
              <button className="mt-4 text-sm font-semibold text-forest underline-offset-4 hover:underline" onClick={() => {
                setLoading(true)
                setError('')
                getExpenses().then(setExpenses).catch(() => setError('We couldn’t load your expenses. Check your connection and try again.')).finally(() => setLoading(false))
              }}>Try again</button>
            </div>
          ) : expenses.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-medium text-ink">No expenses yet</p>
              <p className="mt-2 text-sm text-muted">Once you record an expense, it will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{expense.description?.trim() || expense.category?.name || 'Expense'}</p>
                    <p className="mt-1 text-sm text-muted">{expense.category?.name || 'Uncategorized'} · {formatDate(expense.expenseDate)}</p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums text-ink">{numberFormat.format(Number(expense.amount))}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}
