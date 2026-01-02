'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Modal } from '@/components/ui/modal'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit2, Trash2, ShoppingCart, Store, Check } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ShoppingItem {
  id: string
  item: string
  store: string
  quantity: number
  estimatedPrice: number
  purchased: boolean
  actualPrice: number | null
  notes: string | null
}

const storeOptions = [
  { value: 'IKEA', label: 'IKEA' },
  { value: 'Amazon', label: 'Amazon' },
  { value: 'Top CC', label: 'Top CC' },
  { value: 'Metzger', label: 'Metzger' },
  { value: 'Markt', label: 'Markt' },
  { value: 'Getränkehandel', label: 'Getränkehandel' },
  { value: 'Migros', label: 'Migros' },
  { value: 'Coop', label: 'Coop' },
  { value: 'Sonstiges', label: 'Sonstiges' }
]

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)
  const [formData, setFormData] = useState({
    item: '',
    store: 'IKEA',
    quantity: '1',
    estimatedPrice: '',
    actualPrice: '',
    notes: ''
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/shopping')
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
      const url = editingItem ? `/api/shopping/${editingItem.id}` : '/api/shopping'
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity) || 1,
          estimatedPrice: parseFloat(formData.estimatedPrice) || 0,
          actualPrice: formData.actualPrice ? parseFloat(formData.actualPrice) : null
        })
      })

      if (response.ok) {
        fetchItems()
        closeModal()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const togglePurchased = async (item: ShoppingItem) => {
    try {
      const response = await fetch(`/api/shopping/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchased: !item.purchased })
      })
      if (response.ok) {
        fetchItems()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Artikel wirklich löschen?')) return
    try {
      const response = await fetch(`/api/shopping/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchItems()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const openModal = (item?: ShoppingItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        item: item.item,
        store: item.store,
        quantity: item.quantity.toString(),
        estimatedPrice: item.estimatedPrice.toString(),
        actualPrice: item.actualPrice?.toString() || '',
        notes: item.notes || ''
      })
    } else {
      setEditingItem(null)
      setFormData({
        item: '',
        store: 'IKEA',
        quantity: '1',
        estimatedPrice: '',
        actualPrice: '',
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  // Group items by store
  const itemsByStore = items.reduce((acc, item) => {
    if (!acc[item.store]) {
      acc[item.store] = []
    }
    acc[item.store].push(item)
    return acc
  }, {} as Record<string, ShoppingItem[]>)

  // Calculate totals
  const totalEstimated = items.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0)
  const totalActual = items.filter(i => i.purchased).reduce((sum, item) => sum + (item.actualPrice || item.estimatedPrice) * item.quantity, 0)
  const purchasedCount = items.filter(i => i.purchased).length

  return (
    <div>
      <Header title="Einkaufsliste" subtitle={`${items.length} Artikel`} />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold">{items.length}</p>
              <p className="text-sm text-gray-500">Artikel total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-green-600">{purchasedCount}</p>
              <p className="text-sm text-gray-500">Gekauft</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-gray-600">{formatCurrency(totalEstimated)}</p>
              <p className="text-sm text-gray-500">Geschätzt</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-rose-600">{formatCurrency(totalActual)}</p>
              <p className="text-sm text-gray-500">Ausgegeben</p>
            </CardContent>
          </Card>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Artikel hinzufügen
          </Button>
        </div>

        {/* Items grouped by store */}
        {Object.keys(itemsByStore).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Noch keine Artikel auf der Liste</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(itemsByStore).map(([store, storeItems]) => {
              const storeTotal = storeItems.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0)
              const storePurchased = storeItems.filter(i => i.purchased).length

              return (
                <Card key={store}>
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-gray-500" />
                        <CardTitle>{store}</CardTitle>
                        <span className="text-sm text-gray-500">
                          ({storePurchased}/{storeItems.length} gekauft)
                        </span>
                      </div>
                      <span className="font-semibold text-gray-700">{formatCurrency(storeTotal)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {storeItems.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-4 p-4 ${item.purchased ? 'bg-green-50' : ''}`}
                        >
                          <button
                            onClick={() => togglePurchased(item)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              item.purchased
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {item.purchased && <Check className="w-4 h-4" />}
                          </button>
                          <div className="flex-1">
                            <p className={`font-medium ${item.purchased ? 'line-through text-gray-400' : ''}`}>
                              {item.item}
                            </p>
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>Menge: {item.quantity}</span>
                              <span>Geschätzt: {formatCurrency(item.estimatedPrice)}</span>
                              {item.actualPrice && (
                                <span className="text-green-600">Bezahlt: {formatCurrency(item.actualPrice)}</span>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-sm text-gray-400 mt-1">{item.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(item.estimatedPrice * item.quantity)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => openModal(item)} className="p-1 text-gray-400 hover:text-gray-600">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Artikel bearbeiten' : 'Neuer Artikel'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Artikel *"
            value={formData.item}
            onChange={(e) => setFormData({ ...formData, item: e.target.value })}
            required
          />
          <Select
            label="Geschäft"
            options={storeOptions}
            value={formData.store}
            onChange={(e) => setFormData({ ...formData, store: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Menge"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
            <Input
              label="Geschätzter Preis (CHF)"
              type="number"
              step="0.01"
              value={formData.estimatedPrice}
              onChange={(e) => setFormData({ ...formData, estimatedPrice: e.target.value })}
            />
          </div>
          <Input
            label="Tatsächlicher Preis (CHF)"
            type="number"
            step="0.01"
            value={formData.actualPrice}
            onChange={(e) => setFormData({ ...formData, actualPrice: e.target.value })}
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
    </div>
  )
}
