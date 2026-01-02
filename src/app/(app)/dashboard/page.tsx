'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getDaysUntil } from '@/lib/utils'
import {
  Users, Wallet, CheckSquare, UserCheck,
  Calendar, TrendingUp, Clock, Heart
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface DashboardData {
  wedding: {
    name: string
    weddingDate: string
  } | null
  guests: {
    total: number
    confirmed: number
    declined: number
    pending: number
  }
  budget: {
    total: number
    planned: number
    paid: number
    open: number
    remaining: number
    byCategory: { name: string; value: number; color: string }[]
  }
  todos: {
    open: number
    inProgress: number
    completed: number
  }
  personnel: {
    planned: number
    paid: number
    open: number
  }
}

const COLORS = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#10b981', '#6366f1', '#8b5cf6']

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error)
    } finally {
      setLoading(false)
    }
  }

  const daysUntil = data?.wedding ? getDaysUntil(data.wedding.weddingDate) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Übersicht aller Hochzeitsdetails" />

      <div className="p-6 space-y-6">
        {/* Countdown Card */}
        <Card className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-lg">Countdown bis zur Hochzeit</p>
                <p className="text-5xl font-bold mt-2">
                  {daysUntil > 0 ? daysUntil : 0} Tage
                </p>
                <p className="text-rose-100 mt-2">
                  {data?.wedding?.weddingDate
                    ? new Date(data.wedding.weddingDate).toLocaleDateString('de-CH', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'Datum nicht festgelegt'}
                </p>
              </div>
              <Heart className="w-24 h-24 text-white/20" />
            </div>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Gäste */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Gäste</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {data?.guests.total || 0}
                  </p>
                </div>
                <div className="p-3 bg-rose-100 rounded-full">
                  <Users className="w-6 h-6 text-rose-600" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Badge variant="success">{data?.guests.confirmed || 0} Zusagen</Badge>
                <Badge variant="danger">{data?.guests.declined || 0} Absagen</Badge>
                <Badge variant="warning">{data?.guests.pending || 0} Offen</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {formatCurrency(data?.budget.total || 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Geplant:</span>
                  <span className="font-medium">{formatCurrency(data?.budget.planned || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bezahlt:</span>
                  <span className="font-medium text-green-600">{formatCurrency(data?.budget.paid || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rest:</span>
                  <span className="font-medium text-rose-600">{formatCurrency(data?.budget.remaining || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ToDos */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Aufgaben</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {(data?.todos.open || 0) + (data?.todos.inProgress || 0) + (data?.todos.completed || 0)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Badge variant="warning">{data?.todos.open || 0} Offen</Badge>
                <Badge variant="info">{data?.todos.inProgress || 0} In Arbeit</Badge>
                <Badge variant="success">{data?.todos.completed || 0} Erledigt</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Personal */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Personalkosten</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {formatCurrency(data?.personnel.planned || 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bezahlt:</span>
                  <span className="font-medium text-green-600">{formatCurrency(data?.personnel.paid || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Offen:</span>
                  <span className="font-medium text-rose-600">{formatCurrency(data?.personnel.open || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Budget-Verteilung</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.budget.byCategory && data.budget.byCategory.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.budget.byCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {data.budget.byCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400">
                  Noch keine Budget-Daten vorhanden
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Schnellzugriff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/guests"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Users className="w-5 h-5 text-rose-500" />
                  <span className="font-medium">Gäste verwalten</span>
                </a>
                <a
                  href="/budget"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Wallet className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Budget bearbeiten</span>
                </a>
                <a
                  href="/todos"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <CheckSquare className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">ToDos ansehen</span>
                </a>
                <a
                  href="/timeline"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Clock className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Zeitplan</span>
                </a>
                <a
                  href="/shifts"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Schichtplan</span>
                </a>
                <a
                  href="/offers"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium">Offerten</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
