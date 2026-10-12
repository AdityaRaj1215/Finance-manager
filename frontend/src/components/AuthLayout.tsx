import type { ReactNode } from 'react'
import { Brand } from './Brand'

export function AuthLayout({ children, mode }: { children: ReactNode; mode: 'login' | 'register' }) {
  return (
    <main className="min-h-screen bg-paper lg:grid lg:grid-cols-[1fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-forest p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-32 -top-32 size-[28rem] rounded-full border border-white/10" />
        <div className="absolute -right-16 -top-16 size-[20rem] rounded-full border border-white/10" />
        <Brand light />
        <div className="relative z-10 max-w-xl pb-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/75">
            <span className="size-1.5 rounded-full bg-lime" /> Your money, in good company
          </div>
          <h1 className="text-5xl font-medium leading-[1.12] tracking-tight xl:text-6xl">A little more clarity. A lot more calm.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/65">Make room for the things that matter with a clearer picture of your finances.</p>
          <div className="mt-12 rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm">
            <p className="text-sm leading-6 text-white/80">“It feels good to know where I stand, without having to think about it all the time.”</p>
            <p className="mt-4 text-xs text-white/50">A more peaceful money routine</p>
          </div>
        </div>
        <p className="text-xs text-white/40">Personal finance, made a little simpler.</p>
      </section>
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between lg:invisible"><Brand /></div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="mb-9 lg:hidden"><span className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'A FRESH START'}</span></div>
          {children}
        </div>
        <p className="pb-2 text-center text-xs text-muted">By continuing, you agree to keep your account details private and secure.</p>
      </section>
    </main>
  )
}
