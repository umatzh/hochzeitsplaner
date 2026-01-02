'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { EventTypeLabels, EventItemTypeLabels, EventItemStatusLabels, ModuleLabels, getDefaultModules } from '@/types'
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils'
import {
  Plus, Calendar, MapPin, Users, Wallet, Clock, ChevronRight,
  Heart, Edit2, Trash2, Settings, ArrowLeft, CheckCircle2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

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
  location: string | null
  budget: number
  status: string
  modules: EventModule[]
  _count: {
    guests: number
    budgetItems: number
    todos: number
  }
  budgetStats?: {
    planned: number
    paid: number
    open: number
  }
}

interface Event {
  id: string
  name: string
  eventType: string
  mainDate: string
  location: string | null
  description: string | null
  totalBudget: number
  eventItems: EventItem[]
  totals: {
    budget: { planned: number; paid: number }
    guests: { total: number; confirmed: number; declined: number; pending: number }
  }
}

const itemTypeOptions = [
  { value: 'MAIN_EVENT', label: 'Hauptevent' },
  { value: 'CIVIL_CEREMONY', label: 'Standesamt' },
  { value: 'BACHELOR_PARTY', label: 'Polterabend' },
  { value: 'PARTY', label: 'Party / Feier' },
  { value: 'BRUNCH', label: 'Brunch' },
  { value: 'RECEPTION', label: 'Empfang' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'CONFERENCE', label: 'Konferenz' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'TEAM_BUILDING', label: 'Team-Building' },
  { value: 'REHEARSAL', label: 'Probe' },
  { value: 'CUSTOM', label: 'Sonstiges' }
]

const allModules = [
  'dashboard', 'guests', 'budget', 'offers', 'todos', 'shopping',
  'timeline', 'contacts', 'menu', 'personnel', 'shifts', 'payroll', 'tasks'
]

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<Event | null>(null)
  const [items, setItems] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    itemType: 'MAIN_EVENT',
    date: '',
    time: '',
    location: '',
    budget: '',
    notes: ''
  })

  useEffect(() => {
    if (eventId) {
      fetchEvent()
      fetchItems()
    }
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data)
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/items`)
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleItemTypeChange = (itemType: string) => {
    setFormData({ ...formData, itemType })
    // Auto-select suggested modules based on event type and item type
    if (event) {
      const suggested = getDefaultModules(event.eventType, itemType)
      setSelectedModules(suggested)
    }
  }

  const toggleModule = (moduleName: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleName)
        ? prev.filter(m => m !== moduleName)
        : [...prev, moduleName]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/events/${eventId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget) || 0,
          activeModules: selectedModules
        })
      })

      if (response.ok) {
        const newItem = await response.json()
        fetchItems()
        fetchEvent()
        setIsModalOpen(false)
        resetForm()
        // Navigate to the new sub-event
        router.push(`/events/${eventId}/items/${newItem.id}`)
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleDelete = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Sub-Event wirklich löschen? Alle Daten werden gelöscht!')) return
    try {
      const response = await fetch(`/api/events/${eventId}/items/${itemId}`, { method: 'DELETE' })
      if (response.ok) {
        fetchItems()
        fetchEvent()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      itemType: 'MAIN_EVENT',
      date: '',
      time: '',
      location: '',
      budget: '',
      notes: ''
    })
    setSelectedModules([])
  }

  const openModal = () => {
    resetForm()
    if (event) {
      const suggested = getDefaultModules(event.eventType, 'MAIN_EVENT')
      setSelectedModules(suggested)
    }
    setIsModalOpen(true)
  }

  if (loading || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  const daysUntil = getDaysUntil(event.mainDate)

  return (
    <div>
      <Header
        title={event.name}
        subtitle={EventTypeLabels[event.eventType] || event.eventType}
      />

      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Button variant="secondary" onClick={() => router.push('/events')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zu Events
        </Button>

        {/* Event Summary */}
        <Card className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-rose-100">Countdown</p>
                <p className="text-4xl font-bold mt-1">
                  {daysUntil > 0 ? daysUntil : (daysUntil === 0 ? 'Heute!' : 'Vergangen')}
                </p>
                <p className="text-rose-100 text-sm">
                  {daysUntil > 0 ? 'Tage' : ''}
                </p>
              </div>
              <div className="text-center">
                <p className="text-rose-100">Gäste</p>
                <p className="text-4xl font-bold mt-1">
                  {event.totals.guests.confirmed}/{event.totals.guests.total}
                </p>
                <p className="text-rose-100 text-sm">Bestätigt</p>
              </div>
              <div className="text-center">
                <p className="text-rose-100">Budget</p>
                <p className="text-4xl font-bold mt-1">
                  {formatCurrency(event.totals.budget.planned)}
                </p>
                <p className="text-rose-100 text-sm">Geplant</p>
              </div>
              <div className="text-center">
                <p className="text-rose-100">Sub-Events</p>
                <p className="text-4xl font-bold mt-1">{items.length}</p>
                <p className="text-rose-100 text-sm">Termine</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sub-Events Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Sub-Events</h2>
          <Button onClick={openModal}>
            <Plus className="w-4 h-4 mr-2" />
            Sub-Event hinzufügen
          </Button>
        </div>

        {/* Sub-Events Timeline */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Noch keine Sub-Events
              </h3>
              <p className="text-gray-500 mb-6">
                Fügen Sie Sub-Events wie Polterabend, Standesamt, Feier etc. hinzu.
              </p>
              <Button onClick={openModal}>
                <Plus className="w-4 h-4 mr-2" />
                Erstes Sub-Event erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => {
              const activeModules = item.modules.filter(m => m.isActive)

              return (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/events/${eventId}/items/${item.id}`)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                          {index + 1}
                        </div>
                        {index < items.length - 1 && (
                          <div className="w-0.5 h-full bg-rose-200 mt-2 min-h-[40px]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(item.date)}
                              </span>
                              {item.time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {item.time}
                                </span>
                              )}
                              {item.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {item.location}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge>{EventItemTypeLabels[item.itemType] || item.itemType}</Badge>
                            <Badge variant={item.status === 'CONFIRMED' ? 'success' : 'warning'}>
                              {EventItemStatusLabels[item.status] || item.status}
                            </Badge>
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-6 mt-3 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            {item._count.guests} Gäste
                          </span>
                          <span className="flex items-center gap-1">
                            <Wallet className="w-4 h-4 text-gray-400" />
                            {formatCurrency(item.budgetStats?.planned || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-gray-400" />
                            {item._count.todos} ToDos
                          </span>
                        </div>

                        {/* Active Modules */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {activeModules.slice(0, 6).map(m => (
                            <span
                              key={m.id}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {ModuleLabels[m.moduleName] || m.moduleName}
                            </span>
                          ))}
                          {activeModules.length > 6 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              +{activeModules.length - 6}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Sub-Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Neues Sub-Event erstellen"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name *"
            placeholder="z.B. Hochzeitsfeier, Standesamt, Polterabend..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Typ *"
            options={itemTypeOptions}
            value={formData.itemType}
            onChange={(e) => handleItemTypeChange(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Datum *"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label="Uhrzeit"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Location"
              placeholder="z.B. Restaurant, Hotel..."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Input
              label="Budget (CHF)"
              type="number"
              step="100"
              placeholder="5000"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>

          {/* Module Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module aktivieren
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Basierend auf dem Typ werden passende Module vorgeschlagen. Sie können diese anpassen.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {allModules.map(moduleName => (
                <button
                  key={moduleName}
                  type="button"
                  onClick={() => toggleModule(moduleName)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    selectedModules.includes(moduleName)
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {ModuleLabels[moduleName]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit">
              Sub-Event erstellen
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
