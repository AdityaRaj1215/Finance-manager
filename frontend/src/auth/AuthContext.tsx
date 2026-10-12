import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { LoginResponse, User } from '../api/auth'
import { login as loginRequest } from '../api/auth'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const TOKEN_KEY = 'finance-manager-token'
const USER_KEY = 'finance-manager-user'
const AuthContext = createContext<AuthContextValue | null>(null)

function readUser(): User | null {
  try {
    const saved = sessionStorage.getItem(USER_KEY)
    return saved ? (JSON.parse(saved) as User) : null
  } catch {
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readUser)

  async function signIn(email: string, password: string) {
    const result: LoginResponse = await loginRequest(email, password)
    sessionStorage.setItem(TOKEN_KEY, result.token)
    const profile = { userId: result.userId, name: result.name, email: result.email }
    sessionStorage.setItem(USER_KEY, JSON.stringify(profile))
    setUser(profile)
  }

  function signOut() {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), signIn, signOut }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
