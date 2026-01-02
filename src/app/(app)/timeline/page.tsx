'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Checkbox } from '@/components/ui/checkbox'
import { generateTimeSlots } from '@/lib/utils'
import { Plus, Edit2, Trash2, Clock, AlertTriangle, Printer, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TimelineItem {
  id: string
  time: string
  activity: string
  responsible: string | null
  status: string
  isEmergency: boolean
  notes: string | null
}

const statusOptions = [
  { value: 'PENDING', label: 'Ausstehend' },
  { value: 'IN_PROGRESS', label: 'Läuft' },
  { value: 'COMPLETED', label: 'Erledigt' },
  { value: 'SKIPPED', label: 'Übersprungen' }
]

const timeSlots = generateTimeSlots(7, 23, 15)

export default function TimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null)
  const [formData, setFormData] = useState({
    time: '12:00',
    activity: '',
    responsible: '',
    status: 'PENDING',
    isEmergency: false,
    notes: ''
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/timeline')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingItem ? `/api/timeline/${editingItem.id}` : '/api/timeline'
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchItems()
        closeModal()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/timeline/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        fetchItems()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eintrag wirklich löschen?')) return
    try {
      const response = await fetch(`/api/timeline/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchItems()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const openModal = (item?: TimelineItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        time: item.time,
        activity: item.activity,
        responsible: item.responsible || '',
        status: item.status,
        isEmergency: item.isEmergency,
        notes: item.notes || ''
      })
    } else {
      setEditingItem(null)
      setFormData({
        time: '12:00',
        activity: '',
        responsible: '',
        status: 'PENDING',
        isEmergency: false,
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Badge variant="success">Erledigt</Badge>
      case 'IN_PROGRESS': return <Badge variant="info">Läuft</Badge>
      case 'SKIPPED': return <Badge variant="danger">Übersprungen</Badge>
      default: return <Badge variant="warning">Ausstehend</Badge>
    }
  }

  const emergencyContacts = items.filter(i => i.isEmergency)

  return (
    <div>
      <Header title="Zeitplan Hochzeitstag" subtitle="Detaillierter Ablaufplan" />

      <div className="p-6 space-y-6">
        {/* Emergency Contacts */}
        {emergencyContacts.length > 0 && (
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <CardTitle>Notfall-Kontakte</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                    <Phone className="w-4 h-4 text-red-600" />
                    <span className="font-medium">{contact.activity}</span>
                    {contact.responsible && (
                      <span className="text-gray-500">({contact.responsible})</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-between print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Drucken
          </Button>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Eintrag hinzufügen
          </Button>
        </div>

        {/* Timeline */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Laden...</div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Noch kein Zeitplan erstellt</p>
                </div>
              ) : (
                items.filter(i => !i.isEmergency).map((item, index) => {
                  const isCurrentTime = false // Could add logic to highlight current time
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-4 ${
                        item.status === 'COMPLETED' ? 'bg-green-50' : ''
                      } ${isCurrentTime ? 'ring-2 ring-rose-500' : ''}`}
                    >
                      {/* Time */}
                      <div className="w-20 flex-shrink-0">
                        <span className="text-2xl font-bold text-gray-900">{item.time}</span>
                      </div>

                      {/* Timeline dot */}
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${
                          item.status === 'COMPLETED' ? 'bg-green-500' :
                          item.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`} />
                        {index < items.filter(i => !i.isEmergency).length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 min-h-[40px]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <p className={`font-medium text-lg ${
                          item.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-900'
                        }`}>
                          {item.activity}
                        </p>
                        {item.responsible && (
                          <p className="text-sm text-gray-500">Verantwortlich: {item.responsible}</p>
                        )}
                        {item.notes && (
                          <p className="text-sm text-gray-400 mt-1">{item.notes}</p>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-4 print:hidden">
                        {getStatusBadge(item.status)}
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <button onClick={() => openModal(item)} className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Zeit *"
            options={timeSlots.map(t => ({ value: t, label: t }))}
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
          <Input
            label="Aktivität *"
            value={formData.activity}
            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
            required
          />
          <Input
            label="Verantwortlich"
            value={formData.responsible}
            onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          />
          <Checkbox
            label="Notfall-Kontakt (wird oben angezeigt)"
            checked={formData.isEmergency}
            onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
          />
          <Input
            label="Notizen"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>Abbrechen</Button>
            <Button type="submit">{editingItem ? 'Speichern' : 'Hinzufügen'}</Button>
          </div>
        </form>
      </Modal>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
