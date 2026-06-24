'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { useAuthStore } from '@/stores/authStore'
import { useLists } from '@/hooks/useLists'
import { useStats } from '@/hooks/useStats'
import { api } from '@/lib/api'
import { toast } from '@/hooks/useToast'

const ACCENT = '#e63946'
const CHART_COLORS = [
  '#e63946', // accent red
  '#ee9b00', // amber
  '#94d2bd', // sage
  '#4cc9f0', // sky
  '#c77dff', // lavender
  '#f72585', // magenta
  '#06d6a0', // mint
  '#ff9f1c', // orange
  '#a4133c', // crimson
  '#3a86ff', // blue
  '#8338ec', // violet
  '#ffbe0b', // yellow
]

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-bg-secondary border border-border-subtle p-4">
      <p className="text-3xl font-bold font-mono text-text-primary">{value}</p>
      <p className="text-text-muted text-xs mt-1">{label}</p>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">{children}</h2>
}

function ChartSkeleton({ height = 160 }: { height?: number }) {
  return <div className="bg-bg-elevated animate-pulse w-full rounded-none" style={{ height }} />
}

function formatMonth(m: string) {
  const [year, month] = m.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-secondary border border-border-subtle px-3 py-2 text-xs text-text-primary">
      <p className="text-text-muted mb-0.5">{label}</p>
      <p className="font-mono font-semibold">{payload[0].value} álbum{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-secondary border border-border-subtle px-3 py-2 text-xs text-text-primary">
      <p className="font-semibold">{payload[0].name}</p>
      <p className="font-mono text-text-muted">{payload[0].value} álbum{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, setAuth, clearAuth } = useAuthStore()
  const { data: listsData } = useLists()
  const { data: stats, isLoading: statsLoading } = useStats()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const totalLists = listsData?.data?.length ?? 0

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  async function saveName() {
    if (!name.trim() || name === user?.name) return
    setSavingName(true)
    try {
      const data = await api.patch<{ user: { id: string; name: string; email: string; role: string } }>(
        '/users/me', { name }
      )
      setAuth(useAuthStore.getState().token!, data.user)
      toast({ title: 'Nome atualizado!' })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao salvar' })
    } finally {
      setSavingName(false)
    }
  }

  async function saveEmail() {
    if (!email.trim() || email === user?.email) return
    setSavingEmail(true)
    try {
      const data = await api.patch<{ user: { id: string; name: string; email: string; role: string } }>(
        '/users/me', { email }
      )
      setAuth(useAuthStore.getState().token!, data.user)
      toast({ title: 'Email atualizado!' })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao salvar' })
    } finally {
      setSavingEmail(false)
    }
  }

  async function savePassword() {
    if (!password) return
    setSavingPassword(true)
    try {
      await api.patch('/users/me', { password })
      setPassword('')
      toast({ title: 'Senha atualizada!' })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao salvar' })
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleDeleteAccount() {
    if (!confirm('Deletar sua conta permanentemente? Esta ação não pode ser desfeita.')) return
    try {
      await api.delete('/users/me')
      clearAuth()
      router.push('/login')
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao deletar conta' })
    }
  }

  const hasMonthData = (stats?.byMonth?.length ?? 0) > 0
  const hasGenreData = (stats?.byGenre?.length ?? 0) > 0
  const hasArtistData = (stats?.byArtist?.length ?? 0) > 0
  const hasRecommenderData = (stats?.byRecommender?.length ?? 0) > 0

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-8">

      {/* Header do perfil */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
          <span className="text-text-primary font-semibold text-xl">{initials}</span>
        </div>
        <div>
          <p className="text-xl font-bold text-text-primary">{user?.name}</p>
          <p className="text-text-muted text-sm font-mono">{user?.email}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Albums" value={stats?.totalAlbums ?? '—'} />
        <StatCard label="Reviews" value={stats?.totalReviews ?? '—'} />
        <StatCard label="Lists" value={totalLists} />
      </div>

      {/* Álbuns por mês */}
      <div>
        <SectionTitle>Álbuns por mês</SectionTitle>
        {statsLoading ? (
          <ChartSkeleton height={180} />
        ) : !hasMonthData ? (
          <div className="h-[180px] flex items-center justify-center bg-bg-secondary border border-border-subtle">
            <p className="text-text-muted text-sm">Nenhum dado ainda</p>
          </div>
        ) : (
          <div className="bg-bg-secondary border border-border-subtle p-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats!.byMonth.map(d => ({ ...d, month: formatMonth(d.month) }))}
                margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <XAxis dataKey="month" tick={{ fill: '#6b6b6b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b6b6b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
                <Bar dataKey="count" fill={ACCENT} radius={[2, 2, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Gêneros + Quem recomendou */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Gêneros */}
        <div>
          <SectionTitle>Gêneros mais escutados</SectionTitle>
          {statsLoading ? (
            <ChartSkeleton height={200} />
          ) : !hasGenreData ? (
            <div className="h-[200px] flex items-center justify-center bg-bg-secondary border border-border-subtle">
              <p className="text-text-muted text-sm">Nenhum dado ainda</p>
            </div>
          ) : (
            <div className="bg-bg-secondary border border-border-subtle p-4 flex flex-col gap-4">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={stats!.byGenre}
                    dataKey="count"
                    nameKey="genre"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                  >
                    {stats!.byGenre.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {stats!.byGenre.slice(0, 5).map((d, i) => (
                  <div key={d.genre} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-text-primary text-xs flex-1 truncate">{d.genre}</span>
                    <span className="text-text-muted text-xs font-mono">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quem recomendou */}
        <div>
          <SectionTitle>Quem mais recomendou</SectionTitle>
          {statsLoading ? (
            <ChartSkeleton height={200} />
          ) : !hasRecommenderData ? (
            <div className="h-[200px] flex items-center justify-center bg-bg-secondary border border-border-subtle">
              <p className="text-text-muted text-sm">Nenhum dado ainda</p>
            </div>
          ) : (
            <div className="bg-bg-secondary border border-border-subtle p-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={stats!.byRecommender}
                  layout="vertical"
                  margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
                >
                  <XAxis type="number" tick={{ fill: '#6b6b6b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#f0f0f0', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
                  <Bar dataKey="count" radius={[0, 2, 2, 0]} maxBarSize={20}>
                    {stats!.byRecommender.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Artistas mais escutados */}
      <div>
        <SectionTitle>Artistas mais escutados</SectionTitle>
        {statsLoading ? (
          <ChartSkeleton height={200} />
        ) : !hasArtistData ? (
          <div className="h-[200px] flex items-center justify-center bg-bg-secondary border border-border-subtle">
            <p className="text-text-muted text-sm">Nenhum dado ainda</p>
          </div>
        ) : (
          <div className="bg-bg-secondary border border-border-subtle p-4">
            <ResponsiveContainer width="100%" height={Math.max(120, stats!.byArtist.length * 32)}>
              <BarChart
                data={stats!.byArtist}
                layout="vertical"
                margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
              >
                <XAxis type="number" tick={{ fill: '#6b6b6b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="artist" tick={{ fill: '#f0f0f0', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
                <Bar dataKey="count" radius={[0, 2, 2, 0]} maxBarSize={20}>
                  {stats!.byArtist.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Configurações da conta */}
      <div className="border-t border-border-subtle pt-6 space-y-4">
        <SectionTitle>Conta</SectionTitle>

        <div className="space-y-3 max-w-md">
          <div>
            <label className="block text-text-muted text-xs mb-1">Nome</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3 py-2 bg-bg-elevated border border-border-subtle text-text-primary text-sm rounded-[4px] focus:outline-none focus:border-accent"
              />
              <button
                onClick={saveName}
                disabled={savingName || name === user?.name}
                className="px-3 py-2 bg-bg-elevated hover:bg-white/10 text-text-primary text-sm rounded-[4px] transition-colors disabled:opacity-40"
              >
                {savingName ? '...' : 'Salvar'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-text-muted text-xs mb-1">Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 bg-bg-elevated border border-border-subtle text-text-primary text-sm rounded-[4px] focus:outline-none focus:border-accent"
              />
              <button
                onClick={saveEmail}
                disabled={savingEmail || email === user?.email}
                className="px-3 py-2 bg-bg-elevated hover:bg-white/10 text-text-primary text-sm rounded-[4px] transition-colors disabled:opacity-40"
              >
                {savingEmail ? '...' : 'Salvar'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-text-muted text-xs mb-1">Nova senha</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nova senha"
                className="flex-1 px-3 py-2 bg-bg-elevated border border-border-subtle text-text-primary placeholder-text-muted text-sm rounded-[4px] focus:outline-none focus:border-accent"
              />
              <button
                onClick={savePassword}
                disabled={savingPassword || !password}
                className="px-3 py-2 bg-bg-elevated hover:bg-white/10 text-text-primary text-sm rounded-[4px] transition-colors disabled:opacity-40"
              >
                {savingPassword ? '...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 text-sm text-accent hover:text-white hover:bg-accent border border-accent/30 hover:border-accent rounded-[4px] transition-colors"
          >
            Deletar conta
          </button>
        </div>
      </div>
    </div>
  )
}
