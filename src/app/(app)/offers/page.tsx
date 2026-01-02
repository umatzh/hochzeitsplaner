'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { OfferStatusLabels, BudgetCategoryLabels } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Edit2, Trash2, Star, StarOff, ExternalLink, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Offer {
  id: string
  category: string
  vendorName: string
  contactName: string | null
  phone: string | null
  email: string | null
  amount: number
  status: string
  requestedAt: string | null
  validUntil: string | null
  isFavorite: boolean
  notes: string | null
  documentUrl: string | null
}

const categoryOptions = [
  { value: 'CATERING', label: 'Catering' },
  { value: 'DRINKS', label: 'Getränke' },
  { value: 'DECORATION', label: 'Deko' },
  { value: 'EQUIPMENT', label: 'Ausstattung' },
  { value: 'LOCATION', label: 'Location' },
  { value: 'PERSONNEL', label: 'Personal' },
  { value: 'PHOTOGRAPHER', label: 'Fotograf' },
  { value: 'MUSIC', label: 'Musik/DJ' },
  { value: 'FLORIST', label: 'Florist' },
  { value: 'OTHER', label: 'Sonstiges' }
]

const statusOptions = [
  { value: 'OPEN', label: 'Offen' },
  { value: 'REQUESTED', label: 'Angefragt' },
  { value: 'RECEIVED', label: 'Erhalten' },
  { value: 'ACCEPTED', label: 'Akzeptiert' },
  { value: 'REJECTED', label: 'Abgelehnt' }
]

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [compareCategory, setCompareCategory] = useState('')
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [formData, setFormData] = useState({
    category: 'CATERING',
    vendorName: '',
    contactName: '',
    phone: '',
    email: '',
    amount: '',
    status: 'OPEN',
    requestedAt: '',
    validUntil: '',
    notes: '',
    documentUrl: ''
  })

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers')
      if (response.ok) {
        const data = await response.json()
        setOffers(data)
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
      const url = editingOffer ? `/api/offers/${editingOffer.id}` : '/api/offers'
      const method = editingOffer ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount) || 0,
          requestedAt: formData.requestedAt || null,
          validUntil: formData.validUntil || null
        })
      })

      if (response.ok) {
        fetchOffers()
        closeModal()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const toggleFavorite = async (offer: Offer) => {
    try {
      const response = await fetch(`/api/offers/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !offer.isFavorite })
      })
      if (response.ok) {
        fetchOffers()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Offerte wirklich löschen?')) return
    try {
      const response = await fetch(`/api/offers/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchOffers()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const openModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer)
      setFormData({
        category: offer.category,
        vendorName: offer.vendorName,
        contactName: offer.contactName || '',
        phone: offer.phone || '',
        email: offer.email || '',
        amount: offer.amount.toString(),
        status: offer.status,
        requestedAt: offer.requestedAt ? offer.requestedAt.split('T')[0] : '',
        validUntil: offer.validUntil ? offer.validUntil.split('T')[0] : '',
        notes: offer.notes || '',
        documentUrl: offer.documentUrl || ''
      })
    } else {
      setEditingOffer(null)
      setFormData({
        category: 'CATERING',
        vendorName: '',
        contactName: '',
        phone: '',
        email: '',
        amount: '',
        status: 'OPEN',
        requestedAt: '',
        validUntil: '',
        notes: '',
        documentUrl: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingOffer(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return <Badge variant="success">Akzeptiert</Badge>
      case 'REJECTED': return <Badge variant="danger">Abgelehnt</Badge>
      case 'RECEIVED': return <Badge variant="info">Erhalten</Badge>
      case 'REQUESTED': return <Badge variant="warning">Angefragt</Badge>
      default: return <Badge>Offen</Badge>
    }
  }

  const filteredOffers = filterCategory
    ? offers.filter(o => o.category === filterCategory)
    : offers

  const compareOffers = compareCategory
    ? offers.filter(o => o.category === compareCategory)
    : []

  const uniqueCategories = [...new Set(offers.map(o => o.category))]

  return (
    <div>
      <Header title="Offerten-Management" subtitle={`${offers.length} Offerten`} />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold">{offers.length}</p>
              <p className="text-sm text-gray-500">Gesamt</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {offers.filter(o => o.status === 'OPEN' || o.status === 'REQUESTED').length}
              </p>
              <p className="text-sm text-gray-500">Ausstehend</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {offers.filter(o => o.status === 'ACCEPTED').length}
              </p>
              <p className="text-sm text-gray-500">Akzeptiert</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-rose-600">
                {offers.filter(o => o.isFavorite).length}
              </p>
              <p className="text-sm text-gray-500">Favoriten</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <Select
              options={[{ value: '', label: 'Alle Kategorien' }, ...categoryOptions]}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-48"
            />
            {uniqueCategories.length > 1 && (
              <Button
                variant="outline"
                onClick={() => setIsCompareOpen(true)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Vergleichen
              </Button>
            )}
          </div>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Offerte hinzufügen
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Anbieter</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Gültig bis</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">Laden...</TableCell>
                  </TableRow>
                ) : filteredOffers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Keine Offerten vorhanden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOffers.map((offer) => (
                    <TableRow key={offer.id} className={offer.isFavorite ? 'bg-yellow-50' : ''}>
                      <TableCell>
                        <button onClick={() => toggleFavorite(offer)} className="p-1">
                          {offer.isFavorite ? (
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="w-5 h-5 text-gray-300" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge>{BudgetCategoryLabels[offer.category] || offer.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{offer.vendorName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {offer.contactName && <p>{offer.contactName}</p>}
                          {offer.email && <p className="text-gray-500">{offer.email}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(offer.amount)}</TableCell>
                      <TableCell>{getStatusBadge(offer.status)}</TableCell>
                      <TableCell>
                        {offer.validUntil ? (
                          <span className={new Date(offer.validUntil) < new Date() ? 'text-red-600' : ''}>
                            {formatDate(offer.validUntil)}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {offer.documentUrl && (
                            <a href={offer.documentUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-500 hover:text-blue-600">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button onClick={() => openModal(offer)} className="p-1 text-gray-500 hover:text-gray-700">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(offer.id)} className="p-1 text-gray-500 hover:text-red-600">
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

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingOffer ? 'Offerte bearbeiten' : 'Neue Offerte'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Kategorie *"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="Anbieter *"
              value={formData.vendorName}
              onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
              required
            />
            <Input
              label="Kontaktperson"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
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
            <Input
              label="Betrag (CHF)"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
            <Input
              label="Angefragt am"
              type="date"
              value={formData.requestedAt}
              onChange={(e) => setFormData({ ...formData, requestedAt: e.target.value })}
            />
            <Input
              label="Gültig bis"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
            <Input
              label="Dokument-URL"
              value={formData.documentUrl}
              onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
            />
          </div>
          <Input
            label="Notizen"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>Abbrechen</Button>
            <Button type="submit">{editingOffer ? 'Speichern' : 'Hinzufügen'}</Button>
          </div>
        </form>
      </Modal>

      {/* Compare Modal */}
      <Modal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} title="Offerten vergleichen" size="xl">
        <div className="space-y-4">
          <Select
            label="Kategorie wählen"
            options={uniqueCategories.map(c => ({ value: c, label: BudgetCategoryLabels[c] || c }))}
            value={compareCategory}
            onChange={(e) => setCompareCategory(e.target.value)}
          />
          {compareOffers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {compareOffers.map((offer) => (
                <Card key={offer.id} className={offer.isFavorite ? 'ring-2 ring-yellow-400' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{offer.vendorName}</CardTitle>
                      {offer.isFavorite && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-rose-600">{formatCurrency(offer.amount)}</p>
                    <div className="mt-3 space-y-1 text-sm">
                      {offer.contactName && <p><strong>Kontakt:</strong> {offer.contactName}</p>}
                      {offer.email && <p><strong>Email:</strong> {offer.email}</p>}
                      {offer.phone && <p><strong>Tel:</strong> {offer.phone}</p>}
                      {offer.validUntil && <p><strong>Gültig bis:</strong> {formatDate(offer.validUntil)}</p>}
                      {offer.notes && <p className="text-gray-500 mt-2">{offer.notes}</p>}
                    </div>
                    <div className="mt-4">{getStatusBadge(offer.status)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {compareCategory && compareOffers.length === 0 && (
            <p className="text-center py-8 text-gray-500">Keine Offerten in dieser Kategorie</p>
          )}
        </div>
      </Modal>
    </div>
  )
}
