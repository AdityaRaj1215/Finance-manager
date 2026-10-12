import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Brand } from '../components/Brand'

export function HomePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Brand />
          <button className="text-sm font-medium text-muted transition hover:text-ink" onClick={() => { signOut(); navigate('/login', { replace: true }) }}>Sign out</button>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <span className="eyebrow">YOUR FINANCE SPACE</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Welcome in, {user?.name.split(' ')[0]}.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">You’re signed in and your account is ready. This is your starting point for a calmer view of your money.</p>
        <div className="mt-10 max-w-xl rounded-2xl border border-line bg-white p-6 shadow-sm shadow-ink/[0.03] sm:p-8">
          <div className="flex size-11 items-center justify-center rounded-xl bg-mint text-forest">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true"><path d="M5 12.5 9.2 17 19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h2 className="mt-5 text-lg font-semibold text-ink">Your sign-in is working</h2>
          <p className="mt-2 text-sm leading-6 text-muted">You’re authenticated with your account. Your finance overview will grow here as the next phase connects expense tracking.</p>
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Signed in as</p>
            <p className="mt-1 text-sm text-ink">{user?.email}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
