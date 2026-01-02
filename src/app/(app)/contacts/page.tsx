'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Edit2, Trash2, Phone, Mail, MapPin, Globe, Search, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Contact {
  id: string
  name: string
  company: string | null
  phone: string | null
  email: string | null
  address: string | null
  website: string | null
  role: string | null
  notes: string | null
  isEmergency: boolean
}

const roleOptions = [
  { value: 'Fotograf', label: 'Fotograf' },
  { value: 'DJ', label: 'DJ/Musik' },
  { value: 'Florist', label: 'Florist' },
  { value: 'Catering', label: 'Catering' },
  { value: 'Location', label: 'Location' },
  { value: 'Konditor', label: 'Konditor' },
  { value: 'Friseur', label: 'Friseur/Makeup' },
  { value: 'Videograf', label: 'Videograf' },
  { value: 'Hochzeitsplaner', label: 'Hochzeitsplaner' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Deko', label: 'Dekoration' },
  { value: 'Technik', label: 'Technik' },
  { value: 'Sonstiges', label: 'Sonstiges' }
]

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    role: '',
    notes: '',
    isEmergency: false
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
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
      const url = editingContact ? `/api/contacts/${editingContact.id}` : '/api/contacts'
      const method = editingContact ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchContacts()
        closeModal()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Kontakt wirklich löschen?')) return
    try {
      const response = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchContacts()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const openModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact)
      setFormData({
        name: contact.name,
        company: contact.company || '',
        phone: contact.phone || '',
        email: contact.email || '',
        address: contact.address || '',
        website: contact.website || '',
        role: contact.role || '',
        notes: contact.notes || '',
        isEmergency: contact.isEmergency
      })
    } else {
      setEditingContact(null)
      setFormData({
        name: '',
        company: '',
        phone: '',
        email: '',
        address: '',
        website: '',
        role: '',
        notes: '',
        isEmergency: false
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingContact(null)
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterRole || contact.role === filterRole
    return matchesSearch && matchesFilter
  })

  const emergencyContacts = contacts.filter(c => c.isEmergency)

  return (
    <div>
      <Header title="Kontakte" subtitle={`${contacts.length} Dienstleister`} />

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
                  <a
                    key={contact.id}
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Kontakte suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={[{ value: '', label: 'Alle Kategorien' }, ...roleOptions]}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-48"
            />
          </div>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Kontakt hinzufügen
          </Button>
        </div>

        {/* Contact Cards */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Laden...</div>
        ) : filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Keine Kontakte gefunden</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className={contact.isEmergency ? 'ring-2 ring-red-300' : ''}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{contact.name}</h3>
                      {contact.company && (
                        <p className="text-sm text-gray-500">{contact.company}</p>
                      )}
                    </div>
                    {contact.role && <Badge>{contact.role}</Badge>}
                  </div>

                  <div className="mt-4 space-y-2">
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600"
                      >
                        <Phone className="w-4 h-4" />
                        {contact.phone}
                      </a>
                    )}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600"
                      >
                        <Mail className="w-4 h-4" />
                        {contact.email}
                      </a>
                    )}
                    {contact.address && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600"
                      >
                        <MapPin className="w-4 h-4" />
                        {contact.address}
                      </a>
                    )}
                    {contact.website && (
                      <a
                        href={contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>

                  {contact.notes && (
                    <p className="mt-3 text-sm text-gray-400">{contact.notes}</p>
                  )}

                  <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                    <button onClick={() => openModal(contact)} className="p-2 text-gray-400 hover:text-gray-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(contact.id)} className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingContact ? 'Kontakt bearbeiten' : 'Neuer Kontakt'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Firma"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
            <Select
              label="Rolle"
              options={roleOptions}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
            <Input
              label="Website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
          <Input
            label="Adresse"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            label="Notizen"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <Checkbox
            label="Als Notfall-Kontakt markieren"
            checked={formData.isEmergency}
            onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>Abbrechen</Button>
            <Button type="submit">{editingContact ? 'Speichern' : 'Hinzufügen'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
