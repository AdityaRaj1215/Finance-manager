import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { AuthLayout } from '../components/AuthLayout'
import { Field } from '../components/Field'
import { Notice } from '../components/Notice'

export function RegisterPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const emailValid = /^\S+@\S+\.\S+$/.test(email)
  const nameError = submitted && !name.trim() ? 'Enter your name.' : ''
  const emailError = submitted && !emailValid ? 'Enter a valid email address.' : ''
  const passwordError = submitted && password.length < 8 ? 'Use at least 8 characters.' : ''

  if (isAuthenticated) return <Navigate to="/app" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (!name.trim() || !emailValid || password.length < 8 || password.length > 72) return
    setError('')
    setLoading(true)
    try {
      await register({ name: name.trim(), email: email.trim(), password })
      navigate('/login', { replace: true, state: { notice: 'Your account is ready. Sign in to continue.' } })
    } catch (cause) {
      if (isAxiosError(cause)) {
        const status = cause.response?.status
        const message = cause.response?.data?.message
        setError(status === 409 ? 'An account with this email already exists.' : message || 'We couldn’t create your account. Please try again.')
      } else setError('Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout mode="register">
      <span className="eyebrow hidden lg:block">A FRESH START</span>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Make yourself at home.</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Create an account. It only takes a moment.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        {error && <Notice>{error}</Notice>}
        <Field label="Your name" name="name" type="text" autoComplete="name" placeholder="Alex Morgan" value={name} onChange={(e) => setName(e.target.value)} error={nameError} required />
        <Field label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} required />
        <Field label="Password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} error={passwordError} required minLength={8} maxLength={72} />
        <p className="-mt-2 text-xs text-muted">Use 8–72 characters. Choose a password you don’t use elsewhere.</p>
        <button className="primary-button w-full" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" /> Creating account…</> : <>Create account <span aria-hidden="true">→</span></>}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-muted">Already have an account? <Link className="font-semibold text-forest hover:underline" to="/login">Sign in</Link></p>
    </AuthLayout>
  )
}
