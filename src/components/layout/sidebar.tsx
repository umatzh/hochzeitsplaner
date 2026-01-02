'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  CheckSquare,
  ShoppingCart,
  Clock,
  Phone,
  UtensilsCrossed,
  UserCheck,
  Calendar,
  Calculator,
  ClipboardList,
  Heart,
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const mainNavItems: NavItem[] = [
  { href: '/events', label: 'Meine Events', icon: <Sparkles className="w-5 h-5" /> },
]

const legacyNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/guests', label: 'Gästeliste', icon: <Users className="w-5 h-5" /> },
  { href: '/budget', label: 'Budget', icon: <Wallet className="w-5 h-5" /> },
  { href: '/offers', label: 'Offerten', icon: <FileText className="w-5 h-5" /> },
  { href: '/todos', label: 'ToDos', icon: <CheckSquare className="w-5 h-5" /> },
  { href: '/shopping', label: 'Einkaufsliste', icon: <ShoppingCart className="w-5 h-5" /> },
  { href: '/timeline', label: 'Zeitplan', icon: <Clock className="w-5 h-5" /> },
  { href: '/contacts', label: 'Kontakte', icon: <Phone className="w-5 h-5" /> },
  { href: '/menu', label: 'Menüplanung', icon: <UtensilsCrossed className="w-5 h-5" /> },
  { href: '/personnel', label: 'Personal', icon: <UserCheck className="w-5 h-5" /> },
  { href: '/shifts', label: 'Schichtplan', icon: <Calendar className="w-5 h-5" /> },
  { href: '/payroll', label: 'Abrechnung', icon: <Calculator className="w-5 h-5" /> },
  { href: '/tasks', label: 'Aufgaben', icon: <ClipboardList className="w-5 h-5" /> },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-5 border-b">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            <span className="text-xl font-bold text-gray-900">Event Planner</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {/* Main Nav - Events */}
            <div className="mb-6">
              <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Haupt-Navigation
              </p>
              <ul className="space-y-1">
                {mainNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                          isActive
                            ? 'bg-rose-50 text-rose-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        )}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Legacy Nav - Direct Module Access */}
            <div>
              <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Schnellzugriff (Legacy)
              </p>
              <ul className="space-y-1">
                {legacyNavItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
                          isActive
                            ? 'bg-rose-50 text-rose-700'
                            : 'text-gray-500 hover:bg-gray-100'
                        )}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-3 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Abmelden</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
