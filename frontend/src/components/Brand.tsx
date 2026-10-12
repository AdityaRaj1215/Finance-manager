import { Link } from 'react-router-dom'

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 font-semibold tracking-tight ${light ? 'text-white' : 'text-ink'}`} aria-label="Finch home">
      <span className="grid size-9 place-items-center rounded-xl bg-forest text-white">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
          <path d="M6 17.5c5.5.3 10.3-3.2 11.7-10.8C10 6.5 5.8 9.8 6 17.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M5 20c2.8-4.5 6.1-7 10.5-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-lg">finch<span className={light ? 'text-white/60' : 'text-muted'}>.</span></span>
    </Link>
  )
}
