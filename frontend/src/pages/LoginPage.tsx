import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { useAuth } from '../auth/AuthContext'
import { AuthLayout } from '../components/AuthLayout'
import { Field } from '../components/Field'
import { Notice } from '../components/Notice'

export function LoginPage() {
  const { signIn, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registrationNotice = (location.state as { notice?: string } | null)?.notice
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)
  const emailError = touched && email && !/^\S+@\S+\.\S+$/.test(email) ? 'Enter a valid email address.' : ''
  const passwordError = touched && !password ? 'Enter your password.' : ''

  if (isAuthenticated) return <Navigate to="/app" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (!/^\S+@\S+\.\S+$/.test(email) || !password) return
    setError('')
    setLoading(true)
    try {
      await signIn(email.trim(), password)
      navigate((location.state as { from?: string } | null)?.from ?? '/app', { replace: true })
    } catch (cause) {
      if (isAxiosError(cause)) {
        const status = cause.response?.status
        const serverMessage = cause.response?.data?.message
        setError(status === 401 ? 'That email and password don’t match. Try again.' : serverMessage || 'We couldn’t reach your account. Please try again.')
      } else setError('Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout mode="login">
      <span className="eyebrow hidden lg:block">WELCOME BACK</span>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Good to see you.</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Sign in to pick up where you left off.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        {registrationNotice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{registrationNotice}</div>}
        {error && <Notice>{error}</Notice>}
        <Field label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)} error={emailError} required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setTouched(true)} error={passwordError} required />
        <button className="primary-button w-full" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" /> Signing in…</> : <>Sign in <span aria-hidden="true">→</span></>}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-muted">New to Finch? <Link className="font-semibold text-forest hover:underline" to="/register">Create an account</Link></p>
    </AuthLayout>
  )
}
