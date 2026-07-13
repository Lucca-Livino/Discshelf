'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { BookOpen, Search, List, User, LogOut, Clock, PanelLeftClose, PanelLeft } from 'lucide-react'

const navItems = [
  { href: '/catalog', label: 'Shelf', icon: BookOpen },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/lists', label: 'Lists', icon: List },
  { href: '/waitlist', label: 'Queue', icon: Clock },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { token, _hasHydrated, clearAuth } = useAuthStore()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  useEffect(() => {
    const saved = localStorage.getItem('discshelf-sidebar')
    if (saved !== null) setSidebarOpen(saved === '1')
  }, [])
  function toggleSidebar() {
    setSidebarOpen((v) => {
      localStorage.setItem('discshelf-sidebar', v ? '0' : '1')
      return !v
    })
  }

  useEffect(() => {
    if (_hasHydrated && !token) {
      router.replace('/login')
    }
  }, [token, _hasHydrated, router])

  if (!_hasHydrated) return null
  if (!token) return null

  function handleLogout() {
    clearAuth()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen min-h-dvh">
      {/* Sidebar — desktop only */}
      <aside className={`${sidebarOpen ? 'md:flex' : 'md:hidden'} hidden w-56 shrink-0 bg-bg-secondary border-r border-border-subtle flex-col`}>
        <div className="px-6 py-6 border-b border-border-subtle flex items-center justify-between">
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Discshelf</h1>
          <button
            onClick={toggleSidebar}
            className="text-text-muted hover:text-text-primary transition-colors"
            title="Esconder sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-[4px] transition-colors ${
                  active
                    ? 'bg-bg-elevated text-text-primary'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border-subtle">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-[4px] transition-colors w-full"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-bg-primary pb-20 md:pb-0 relative">
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center fixed top-4 left-4 z-40 w-9 h-9 bg-bg-secondary border border-border-subtle rounded-[4px] text-text-muted hover:text-text-primary hover:border-accent transition-colors"
            title="Mostrar sidebar"
          >
            <PanelLeft size={18} />
          </button>
        )}
        {children}
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-bg-secondary border-t border-border-subtle flex items-stretch z-40">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs transition-colors ${
                active ? 'text-accent' : 'text-text-muted'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
