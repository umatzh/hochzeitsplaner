'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EventItemTypeLabels, EventItemStatusLabels, ModuleLabels } from '@/types'
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils'
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, Wallet,
  CheckSquare, TrendingUp, LayoutDashboard, UserCheck,
  ShoppingCart, ClipboardList, Phone, UtensilsCrossed,
  Users2, CalendarClock, CreditCard, ListTodo, Settings, Heart
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface EventModule {
  id: string
  moduleName: string
  isActive: boolean
}

interface EventItem {
  id: string
  name: string
  itemType: string
  date: string
  time: string | null
  endTime: string | null
  location: string | null
  budget: number
  status: string
  notes: string | null
  modules: EventModule[]
  event: {
    id: string
    name: string
    eventType: string
  }
  stats: {
    guests: { total: number; confirmed: number; declined: number; pending: number }
    budget: { planned: number; paid: number }
    todos: { open: number; inProgress: number; completed: number }
  }
}

const moduleIcons: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  guests: Users,
  budget: Wallet,
  offers: TrendingUp,
  todos: CheckSquare,
  shopping: ShoppingCart,
  timeline: ClipboardList,
  contacts: Phone,
  menu: UtensilsCrossed,
  personnel: Users2,
  shifts: CalendarClock,
  payroll: CreditCard,
  tasks: ListTodo
}

const moduleColors: Record<string, string> = {
  dashboard: 'bg-rose-500',
  guests: 'bg-blue-500',
  budget: 'bg-green-500',
  offers: 'bg-purple-500',
  todos: 'bg-yellow-500',
  shopping: 'bg-orange-500',
  timeline: 'bg-indigo-500',
  contacts: 'bg-pink-500',
  menu: 'bg-red-500',
  personnel: 'bg-teal-500',
  shifts: 'bg-cyan-500',
  payroll: 'bg-emerald-500',
  tasks: 'bg-violet-500'
}

const COLORS = ['#f43f5e', '#10b981', '#f59e0b', '#6366f1']

export default function EventItemPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.eventId as string
  const itemId = params.itemId as string

  const [item, setItem] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState<string | null>(null)

  useEffect(() => {
    if (eventId && itemId) {
      fetchItem()
    }
  }, [eventId, itemId])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/items/${itemId}`)
      if (response.ok) {
        const data = await response.json()
        setItem(data)
        // Set dashboard as default active module if available
        const dashboardModule = data.modules.find((m: EventModule) => m.moduleName === 'dashboard' && m.isActive)
        if (dashboardModule) {
          setActiveModule('dashboard')
        } else {
          const firstActive = data.modules.find((m: EventModule) => m.isActive)
          if (firstActive) {
            setActiveModule(firstActive.moduleName)
          }
        }
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  const activeModules = item.modules.filter(m => m.isActive)
  const daysUntil = getDaysUntil(item.date)

  // Prepare chart data
  const guestChartData = [
    { name: 'Zugesagt', value: item.stats.guests.confirmed, color: '#10b981' },
    { name: 'Abgesagt', value: item.stats.guests.declined, color: '#ef4444' },
    { name: 'Offen', value: item.stats.guests.pending, color: '#f59e0b' }
  ].filter(d => d.value > 0)

  const todoChartData = [
    { name: 'Offen', value: item.stats.todos.open, color: '#f59e0b' },
    { name: 'In Arbeit', value: item.stats.todos.inProgress, color: '#6366f1' },
    { name: 'Erledigt', value: item.stats.todos.completed, color: '#10b981' }
  ].filter(d => d.value > 0)

  // Dashboard content
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Countdown</p>
                <p className="text-2xl font-bold">
                  {daysUntil > 0 ? `${daysUntil} Tage` : (daysUntil === 0 ? 'Heute!' : 'Vergangen')}
                </p>
              </div>
              <Heart className="w-8 h-8 text-rose-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gäste</p>
                <p className="text-2xl font-bold">{item.stats.guests.total}</p>
                <p className="text-xs text-green-600">{item.stats.guests.confirmed} bestätigt</p>
              </div>
              <Users className="w-8 h-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(item.stats.budget.planned)}</p>
                <p className="text-xs text-green-600">{formatCurrency(item.stats.budget.paid)} bezahlt</p>
              </div>
              <Wallet className="w-8 h-8 text-green-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ToDos</p>
                <p className="text-2xl font-bold">
                  {item.stats.todos.open + item.stats.todos.inProgress + item.stats.todos.completed}
                </p>
                <p className="text-xs text-green-600">{item.stats.todos.completed} erledigt</p>
              </div>
              <CheckSquare className="w-8 h-8 text-yellow-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gäste-Status</CardTitle>
          </CardHeader>
          <CardContent>
            {guestChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={guestChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {guestChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Noch keine Gäste vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ToDo-Status</CardTitle>
          </CardHeader>
          <CardContent>
            {todoChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={todoChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {todoChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Noch keine ToDos vorhanden
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellzugriff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {activeModules.filter(m => m.moduleName !== 'dashboard').slice(0, 8).map(module => {
              const Icon = moduleIcons[module.moduleName] || LayoutDashboard
              const colorClass = moduleColors[module.moduleName] || 'bg-gray-500'

              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.moduleName)}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <div className={`p-2 ${colorClass} rounded-lg text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm">
                    {ModuleLabels[module.moduleName]}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Placeholder for other modules (will show coming soon message)
  const renderModulePlaceholder = (moduleName: string) => (
    <Card>
      <CardContent className="py-12 text-center">
        <div className={`w-16 h-16 ${moduleColors[moduleName] || 'bg-gray-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {(() => {
            const Icon = moduleIcons[moduleName] || LayoutDashboard
            return <Icon className="w-8 h-8 text-white" />
          })()}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {ModuleLabels[moduleName] || moduleName}
        </h3>
        <p className="text-gray-500 mb-4">
          Dieses Modul ist für dieses Sub-Event aktiviert.
        </p>
        <p className="text-sm text-gray-400">
          Die Daten werden pro Sub-Event gespeichert.
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div>
      <Header
        title={item.name}
        subtitle={`${item.event.name} • ${EventItemTypeLabels[item.itemType] || item.itemType}`}
      />

      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Button variant="secondary" onClick={() => router.push(`/events/${eventId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zu {item.event.name}
        </Button>

        {/* Event Info Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{formatDate(item.date)}</span>
              </div>
              {item.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{item.time}{item.endTime ? ` - ${item.endTime}` : ''}</span>
                </div>
              )}
              {item.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{item.location}</span>
                </div>
              )}
              <Badge variant={item.status === 'CONFIRMED' ? 'success' : 'warning'}>
                {EventItemStatusLabels[item.status] || item.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Module Navigation */}
        <div className="flex flex-wrap gap-2 border-b pb-4">
          {activeModules.map(module => {
            const Icon = moduleIcons[module.moduleName] || LayoutDashboard
            const isActive = activeModule === module.moduleName
            const colorClass = moduleColors[module.moduleName] || 'bg-gray-500'

            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.moduleName)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? `${colorClass} text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">
                  {ModuleLabels[module.moduleName]}
                </span>
              </button>
            )
          })}
          <button
            onClick={() => router.push(`/events/${eventId}/items/${itemId}/settings`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium text-sm">Einstellungen</span>
          </button>
        </div>

        {/* Module Content */}
        <div>
          {activeModule === 'dashboard' && renderDashboard()}
          {activeModule && activeModule !== 'dashboard' && renderModulePlaceholder(activeModule)}
        </div>
      </div>
    </div>
  )
}
