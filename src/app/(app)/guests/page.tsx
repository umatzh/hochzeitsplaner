'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RsvpStatusLabels, PriorityLabels, MenuType } from '@/types'
import { Plus, Search, Download, Edit2, Trash2, Filter } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Guest {
  id: string
  name: string
  companion: string | null
  child1Name: string | null
  child2Name: string | null
  priority: string
  invitationStatus: string
  rsvpStatus: string
  menuType: string
  allergies: string | null
  tableNumber: number | null
  notes: string | null
  email: string | null
  phone: string | null
}

const priorityOptions = [
  { value: 'HIGH', label: 'Hoch' },
  { value: 'MEDIUM', label: 'Mittel' },
  { value: 'LOW', label: 'Niedrig' }
]

const rsvpOptions = [
  { value: 'PENDING', label: 'Offen' },
  { value: 'CONFIRMED', label: 'Zugesagt' },
  { value: 'DECLINED', label: 'Abgesagt' }
]

const menuOptions = [
  { value: 'REGULAR', label: 'Normal' },
  { value: 'VEGETARIAN', label: 'Vegetarisch' },
  { value: 'VEGAN', label: 'Vegan' },
  { value: 'CHILD', label: 'Kindermenü' },
  { value: 'SPECIAL', label: 'Spezial' }
]

const invitationOptions = [
  { value: 'NOT_SENT', label: 'Nicht gesendet' },
  { value: 'SENT', label: 'Gesendet' },
  { value: 'DELIVERED', label: 'Zugestellt' }
]

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRsvp, setFilterRsvp] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    companion: '',
    child1Name: '',
    child2Name: '',
    priority: 'MEDIUM',
    invitationStatus: 'NOT_SENT',
    rsvpStatus: 'PENDING',
    menuType: 'REGULAR',
    allergies: '',
    tableNumber: '',
    notes: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    try {
      const response = await fetch('/api/guests')
      if (response.ok) {
        const data = await response.json()
        setGuests(data)
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
      const url = editingGuest ? `/api/guests/${editingGuest.id}` : '/api/guests'
      const method = editingGuest ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tableNumber: formData.tableNumber ? parseInt(formData.tableNumber) : null
        })
      })

      if (response.ok) {
        fetchGuests()
        closeModal()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Gast wirklich löschen?')) return
    try {
      const response = await fetch(`/api/guests/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchGuests()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const openModal = (guest?: Guest) => {
    if (guest) {
      setEditingGuest(guest)
      setFormData({
        name: guest.name,
        companion: guest.companion || '',
        child1Name: guest.child1Name || '',
        child2Name: guest.child2Name || '',
        priority: guest.priority,
        invitationStatus: guest.invitationStatus,
        rsvpStatus: guest.rsvpStatus,
        menuType: guest.menuType,
        allergies: guest.allergies || '',
        tableNumber: guest.tableNumber?.toString() || '',
        notes: guest.notes || '',
        email: guest.email || '',
        phone: guest.phone || ''
      })
    } else {
      setEditingGuest(null)
      setFormData({
        name: '',
        companion: '',
        child1Name: '',
        child2Name: '',
        priority: 'MEDIUM',
        invitationStatus: 'NOT_SENT',
        rsvpStatus: 'PENDING',
        menuType: 'REGULAR',
        allergies: '',
        tableNumber: '',
        notes: '',
        email: '',
        phone: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingGuest(null)
  }

  const exportToCsv = () => {
    const headers = ['Name', 'Begleitung', 'Kind 1', 'Kind 2', 'RSVP', 'Menü', 'Tisch', 'Allergien']
    const rows = filteredGuests.map(g => [
      g.name,
      g.companion || '',
      g.child1Name || '',
      g.child2Name || '',
      RsvpStatusLabels[g.rsvpStatus],
      g.menuType,
      g.tableNumber?.toString() || '',
      g.allergies || ''
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gaesteliste.csv'
    a.click()
  }

  const getRsvpBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="success">Zugesagt</Badge>
      case 'DECLINED':
        return <Badge variant="danger">Abgesagt</Badge>
      default:
        return <Badge variant="warning">Offen</Badge>
    }
  }

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.companion?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterRsvp || guest.rsvpStatus === filterRsvp
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.rsvpStatus === 'CONFIRMED').length,
    declined: guests.filter(g => g.rsvpStatus === 'DECLINED').length,
    pending: guests.filter(g => g.rsvpStatus === 'PENDING').length
  }

  return (
    <div>
      <Header title="Gästeliste" subtitle={`${stats.total} Gäste insgesamt`} />

      <div className="p-6 space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
              <p className="text-sm text-gray-500">Zusagen</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-red-600">{stats.declined}</p>
              <p className="text-sm text-gray-500">Absagen</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-500">Offen</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Gäste suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={[{ value: '', label: 'Alle' }, ...rsvpOptions]}
              value={filterRsvp}
              onChange={(e) => setFilterRsvp(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCsv}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => openModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Gast hinzufügen
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Begleitung</TableHead>
                  <TableHead>Kinder</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead>Menü</TableHead>
                  <TableHead>Tisch</TableHead>
                  <TableHead>Allergien</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Laden...
                    </TableCell>
                  </TableRow>
                ) : filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Keine Gäste gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">{guest.name}</TableCell>
                      <TableCell>{guest.companion || '-'}</TableCell>
                      <TableCell>
                        {[guest.child1Name, guest.child2Name].filter(Boolean).join(', ') || '-'}
                      </TableCell>
                      <TableCell>{getRsvpBadge(guest.rsvpStatus)}</TableCell>
                      <TableCell>{guest.menuType}</TableCell>
                      <TableCell>{guest.tableNumber || '-'}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{guest.allergies || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal(guest)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(guest.id)}
                            className="p-1 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingGuest ? 'Gast bearbeiten' : 'Neuer Gast'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Begleitung"
              value={formData.companion}
              onChange={(e) => setFormData({ ...formData, companion: e.target.value })}
            />
            <Input
              label="Kind 1"
              value={formData.child1Name}
              onChange={(e) => setFormData({ ...formData, child1Name: e.target.value })}
            />
            <Input
              label="Kind 2"
              value={formData.child2Name}
              onChange={(e) => setFormData({ ...formData, child2Name: e.target.value })}
            />
            <Select
              label="Priorität"
              options={priorityOptions}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            />
            <Select
              label="Einladungsstatus"
              options={invitationOptions}
              value={formData.invitationStatus}
              onChange={(e) => setFormData({ ...formData, invitationStatus: e.target.value })}
            />
            <Select
              label="RSVP-Status"
              options={rsvpOptions}
              value={formData.rsvpStatus}
              onChange={(e) => setFormData({ ...formData, rsvpStatus: e.target.value })}
            />
            <Select
              label="Menü-Typ"
              options={menuOptions}
              value={formData.menuType}
              onChange={(e) => setFormData({ ...formData, menuType: e.target.value })}
            />
            <Input
              label="Tischnummer"
              type="number"
              value={formData.tableNumber}
              onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
            />
            <Input
              label="Allergien"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Telefon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <Input
            label="Notizen"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Abbrechen
            </Button>
            <Button type="submit">
              {editingGuest ? 'Speichern' : 'Hinzufügen'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
