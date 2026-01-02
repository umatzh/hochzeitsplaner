'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { EventTypeLabels, EventType } from '@/types'
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils'
import {
  Plus, Calendar, MapPin, Users, Wallet, ChevronRight,
  Heart, Cake, Building2, PartyPopper, GraduationCap,
  Trophy, Music, Sparkles, Edit2, Trash2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  name: string
  eventType: string
  mainDate: string
  location: string | null
  description: string | null
  totalBudget: number
  _count: { eventItems: number }
  totals: {
    budget: number
    paid: number
    guests: number
    confirmedGuests: number
  }
}

const eventTypeOptions = [
  { value: 'WEDDING', label: 'Hochzeit' },
  { value: 'BIRTHDAY', label: 'Geburtstag' },
  { value: 'CORPORATE', label: 'Firmenevent' },
  { value: 'PARTY', label: 'Party / Feier' },
  { value: 'UNIVERSITY', label: 'Hochschul-Event' },
  { value: 'WEDDING_SERIES', label: 'Hochzeits-Serie' },
  { value: 'SPORTS', label: 'Sportevent' },
  { value: 'FESTIVAL', label: 'Festival' },
  { value: 'WEDDING_PLANNER', label: 'Wedding Planner' },
  { value: 'CUSTOM', label: 'Eigenes Event' }
]

const getEventIcon = (type: string) => {
  switch (type) {
    case 'WEDDING':
    case 'WEDDING_SERIES':
    case 'WEDDING_PLANNER':
      return Heart
    case 'BIRTHDAY':
      return Cake
    case 'CORPORATE':
      return Building2
    case 'PARTY':
      return PartyPopper
    case 'UNIVERSITY':
      return GraduationCap
    case 'SPORTS':
      return Trophy
    case 'FESTIVAL':
      return Music
    default:
      return Sparkles
  }
}

const getEventColor = (type: string) => {
  switch (type) {
    case 'WEDDING':
    case 'WEDDING_SERIES':
    case 'WEDDING_PLANNER':
      return 'bg-rose-500'
    case 'BIRTHDAY':
      return 'bg-purple-500'
    case 'CORPORATE':
      return 'bg-blue-500'
    case 'PARTY':
      return 'bg-orange-500'
    case 'UNIVERSITY':
      return 'bg-green-500'
    case 'SPORTS':
      return 'bg-yellow-500'
    case 'FESTIVAL':
      return 'bg-pink-500'
    default:
      return 'bg-gray-500'
  }
}

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    eventType: 'WEDDING',
    mainDate: '',
    location: '',
    description: '',
    totalBudget: ''
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalBudget: parseFloat(formData.totalBudget) || 0
        })
      })

      if (response.ok) {
        const newEvent = await response.json()
        fetchEvents()
        setIsModalOpen(false)
        setFormData({
          name: '',
          eventType: 'WEDDING',
          mainDate: '',
          location: '',
          description: '',
          totalBudget: ''
        })
        // Navigate to the new event
        router.push(`/events/${newEvent.id}`)
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Event wirklich löschen? Alle Sub-Events und Daten werden gelöscht!')) return
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Meine Events" subtitle="Übersicht aller Veranstaltungen" />

      <div className="p-6 space-y-6">
        {/* Create Button */}
        <div className="flex justify-end">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Neues Event erstellen
          </Button>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Noch keine Events vorhanden
              </h3>
              <p className="text-gray-500 mb-6">
                Erstellen Sie Ihr erstes Event, um loszulegen.
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Event erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const Icon = getEventIcon(event.eventType)
              const colorClass = getEventColor(event.eventType)
              const daysUntil = getDaysUntil(event.mainDate)

              return (
                <Card
                  key={event.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  {/* Header with color */}
                  <div className={`${colorClass} p-4 text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{event.name}</h3>
                          <p className="text-white/80 text-sm">
                            {EventTypeLabels[event.eventType] || event.eventType}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(event.id, e)}
                        className="p-1 hover:bg-white/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Countdown */}
                    <div className="mt-4 text-center">
                      <p className="text-3xl font-bold">
                        {daysUntil > 0 ? daysUntil : (daysUntil === 0 ? 'Heute!' : 'Vergangen')}
                      </p>
                      <p className="text-white/80 text-sm">
                        {daysUntil > 0 ? 'Tage bis zum Event' : ''}
                      </p>
                    </div>
                  </div>

                  <CardContent className="pt-4">
                    {/* Date & Location */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.mainDate)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {event.totals.confirmedGuests}/{event.totals.guests}
                          </p>
                          <p className="text-xs text-gray-500">Gäste</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {formatCurrency(event.totals.budget)}
                          </p>
                          <p className="text-xs text-gray-500">Budget</p>
                        </div>
                      </div>
                    </div>

                    {/* Sub-Events count */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <Badge>
                        {event._count.eventItems} Sub-Events
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Neues Event erstellen"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Event-Name *"
            placeholder="z.B. Hochzeit 2025 - Max & Maria"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Event-Typ *"
            options={eventTypeOptions}
            value={formData.eventType}
            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hauptdatum *"
              type="date"
              value={formData.mainDate}
              onChange={(e) => setFormData({ ...formData, mainDate: e.target.value })}
              required
            />

            <Input
              label="Gesamtbudget (CHF)"
              type="number"
              step="100"
              placeholder="30000"
              value={formData.totalBudget}
              onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
            />
          </div>

          <Input
            label="Location"
            placeholder="z.B. Zürich"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          <Input
            label="Beschreibung"
            placeholder="Kurze Beschreibung des Events..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit">
              Event erstellen
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
