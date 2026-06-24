'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/hooks/useToast'

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!name || !email || !password) return
    setLoading(true)
    try {
      await api.post('/auth/register', { name, email, password })
      const data = await api.post<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
        '/auth/login',
        { email, password }
      )
      setAuth(data.token, data.user)
      router.push('/catalog')
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar conta',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">Discshelf</h1>
        <p className="text-text-muted text-sm mb-8">Create your account</p>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 bg-bg-elevated border border-border-subtle text-text-primary placeholder-text-muted text-sm rounded-[4px] focus:outline-none focus:border-accent transition-colors"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 bg-bg-elevated border border-border-subtle text-text-primary placeholder-text-muted text-sm rounded-[4px] focus:outline-none focus:border-accent transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            className="w-full px-3 py-2.5 bg-bg-elevated border border-border-subtle text-text-primary placeholder-text-muted text-sm rounded-[4px] focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-[4px] transition-colors disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </div>

        <p className="text-text-muted text-sm mt-6 text-center">
          Já tem conta?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
