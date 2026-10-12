export function Notice({ children }: { children: string }) {
  return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">{children}</div>
}
