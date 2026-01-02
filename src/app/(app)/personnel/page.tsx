'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PersonnelRoleLabels } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit2, Trash2, UserCheck, Phone, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Personnel {
  id: string
  personnelId: string
  name: string
  role: string
  phone: string | null
  email: string | null
  hourlyRate: number
  availability: string | null
  notes: string | null
}

const roleOptions = [
  { value: 'SETUP', label: 'Aufbau' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'KITCHEN', label: 'Küche' },
  { value: 'BAR', label: 'Bar' },
  { value: 'TEARDOWN', label: 'Abbau' },
  { value: 'COORDINATION', label: 'Koordination' },
  { value: 'OTHER', label: 'Sonstiges' }
]

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null)
  const [formData, setFormData] = useState({
    personnelId: '',
    name: '',
    role: 'SERVICE',
    phone: '',
    email: '',
    hourlyRate: '',
    availability: '',
    notes: ''
  })

  useEffect(() => {
    fetchPersonnel()
  }, [])

  const fetchPersonnel = async () => {
    try {
      const response = await fetch('/api/personnel')
      if (response.ok) {
        const data = await response.json()
        setPersonnel(data)
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNextId = () => {
    const maxNum = personnel.reduce((max, p) => {
      const num = parseInt(p.personnelId.replace('P', ''))
      return num > max ? num : max
    }, 0)
    return `P${String(maxNum + 1).padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingPerson ? `/api/personnel/${editingPerson.id}` : '/api/personnel'
      const method = editingPerson ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          personnelId: formData.personnelId || generateNextId(),
          hourlyRate: parseFloat(formData.hourlyRate) || 0
        })
      })

      if (response.ok) {
        fetchPersonnel()
        closeModal()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Person wirklich löschen?')) return
    try {
      const response = await fetch(`/api/personnel/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchPersonnel()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const openModal = (person?: Personnel) => {
    if (person) {
      setEditingPerson(person)
      setFormData({
        personnelId: person.personnelId,
        name: person.name,
        role: person.role,
        phone: person.phone || '',
        email: person.email || '',
        hourlyRate: person.hourlyRate.toString(),
        availability: person.availability || '',
        notes: person.notes || ''
      })
    } else {
      setEditingPerson(null)
      setFormData({
        personnelId: generateNextId(),
        name: '',
        role: 'SERVICE',
        phone: '',
        email: '',
        hourlyRate: '25',
        availability: '',
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPerson(null)
  }

  // Group by role
  const byRole = personnel.reduce((acc, p) => {
    if (!acc[p.role]) {
      acc[p.role] = []
    }
    acc[p.role].push(p)
    return acc
  }, {} as Record<string, Personnel[]>)

  const totalCostEstimate = personnel.reduce((sum, p) => sum + p.hourlyRate * 8, 0) // 8h estimate

  return (
    <div>
      <Header title="Personal-Verwaltung" subtitle={`${personnel.length} Helfer`} />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold">{personnel.length}</p>
              <p className="text-sm text-gray-500">Helfer total</p>
            </CardContent>
          </Card>
          {Object.entries(byRole).slice(0, 3).map(([role, persons]) => (
            <Card key={role}>
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold text-rose-600">{persons.length}</p>
                <p className="text-sm text-gray-500">{PersonnelRoleLabels[role]}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cost estimate */}
        <Card className="bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-blue-900">Geschätzte Personalkosten (8h Einsatz)</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalCostEstimate)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Action */}
        <div className="flex justify-end">
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Person hinzufügen
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Stundenlohn</TableHead>
                  <TableHead>Verfügbarkeit</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">Laden...</TableCell>
                  </TableRow>
                ) : personnel.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Noch keine Helfer erfasst</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  personnel.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-mono font-medium">{person.personnelId}</TableCell>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      <TableCell>
                        <Badge>{PersonnelRoleLabels[person.role]}</Badge>
                      </TableCell>
                      <TableCell>
                        {person.phone ? (
                          <a href={`tel:${person.phone}`} className="flex items-center gap-1 text-rose-600 hover:underline">
                            <Phone className="w-3 h-3" />
                            {person.phone}
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {person.email ? (
                          <a href={`mailto:${person.email}`} className="flex items-center gap-1 text-rose-600 hover:underline">
                            <Mail className="w-3 h-3" />
                            {person.email}
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(person.hourlyRate)}/h</TableCell>
                      <TableCell>{person.availability || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openModal(person)} className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(person.id)} className="p-1 text-gray-400 hover:text-red-600">
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
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPerson ? 'Person bearbeiten' : 'Neue Person'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ID"
              value={formData.personnelId}
              onChange={(e) => setFormData({ ...formData, personnelId: e.target.value })}
              placeholder="z.B. P01"
              disabled={!!editingPerson}
            />
            <Input
              label="Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              label="Rolle"
              options={roleOptions}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
            <Input
              label="Stundenlohn (CHF)"
              type="number"
              step="0.5"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
            />
            <Input
              label="Telefon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <Input
            label="Verfügbarkeit"
            placeholder="z.B. Ganzer Tag, Nur Nachmittag"
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
          />
          <Input
            label="Notizen"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>Abbrechen</Button>
            <Button type="submit">{editingPerson ? 'Speichern' : 'Hinzufügen'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
