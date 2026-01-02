'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { MenuCourseLabels } from '@/types'
import { Plus, Edit2, Trash2, UtensilsCrossed, Users, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MenuItem {
  id: string
  course: string
  name: string
  ingredients: string | null
  portionSize: string | null
  allergens: string | null
  vegetarianAlternative: string | null
  preparationNotes: string | null
  timing: string | null
  servings: number
  notes: string | null
}

const courseOptions = [
  { value: 'APERO', label: 'Apéro' },
  { value: 'STARTER', label: 'Vorspeise' },
  { value: 'MAIN', label: 'Hauptgang' },
  { value: 'DESSERT', label: 'Dessert' },
  { value: 'DRINKS', label: 'Getränke' }
]

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [guestCount, setGuestCount] = useState(50)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    course: 'MAIN',
    name: '',
    ingredients: '',
    portionSize: '',
    allergens: '',
    vegetarianAlternative: '',
    preparationNotes: '',
    timing: '',
    servings: '',
    notes: ''
  })

  useEffect(() => {
    fetchItems()
    fetchGuestCount()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/menu')
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

  const fetchGuestCount = async () => {
    try {
      const response = await fetch('/api/guests')
      if (response.ok) {
        const guests = await response.json()
        const confirmed = guests.filter((g: { rsvpStatus: string }) => g.rsvpStatus === 'CONFIRMED').length
        setGuestCount(confirmed || 50)
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu'
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          servings: parseInt(formData.servings) || guestCount
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

  const handleDelete = async (id: string) => {
    if (!confirm('Gericht wirklich löschen?')) return
    try {
      const response = await fetch(`/api/menu/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchItems()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const openModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        course: item.course,
        name: item.name,
        ingredients: item.ingredients || '',
        portionSize: item.portionSize || '',
        allergens: item.allergens || '',
        vegetarianAlternative: item.vegetarianAlternative || '',
        preparationNotes: item.preparationNotes || '',
        timing: item.timing || '',
        servings: item.servings.toString(),
        notes: item.notes || ''
      })
    } else {
      setEditingItem(null)
      setFormData({
        course: 'MAIN',
        name: '',
        ingredients: '',
        portionSize: '',
        allergens: '',
        vegetarianAlternative: '',
        preparationNotes: '',
        timing: '',
        servings: guestCount.toString(),
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const getCourseColor = (course: string) => {
    switch (course) {
      case 'APERO': return 'bg-amber-100 text-amber-800'
      case 'STARTER': return 'bg-green-100 text-green-800'
      case 'MAIN': return 'bg-rose-100 text-rose-800'
      case 'DESSERT': return 'bg-purple-100 text-purple-800'
      case 'DRINKS': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Group items by course
  const itemsByCourse = items.reduce((acc, item) => {
    if (!acc[item.course]) {
      acc[item.course] = []
    }
    acc[item.course].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  const courseOrder = ['APERO', 'STARTER', 'MAIN', 'DESSERT', 'DRINKS']

  return (
    <div>
      <Header title="Menüplanung" subtitle="Planung aller Gänge" />

      <div className="p-6 space-y-6">
        {/* Guest Count Info */}
        <Card className="bg-rose-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-rose-600" />
                <div>
                  <p className="font-medium text-rose-900">Anzahl Gäste (bestätigt)</p>
                  <p className="text-sm text-rose-600">Basis für die Mengenberechnung</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  className="w-24 text-center"
                />
                <span className="text-rose-900 font-bold">Personen</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action */}
        <div className="flex justify-end">
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Gericht hinzufügen
          </Button>
        </div>

        {/* Menu by Course */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Laden...</div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Noch keine Gerichte geplant</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {courseOrder.map((course) => {
              const courseItems = itemsByCourse[course]
              if (!courseItems || courseItems.length === 0) return null

              return (
                <Card key={course}>
                  <CardHeader className={getCourseColor(course)}>
                    <CardTitle className="flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5" />
                      {MenuCourseLabels[course]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {courseItems.map((item) => (
                        <div key={item.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              {item.portionSize && (
                                <p className="text-sm text-gray-500">Portionsgrösse: {item.portionSize}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="info">{item.servings || guestCount} Portionen</Badge>
                              <button onClick={() => openModal(item)} className="p-1 text-gray-400 hover:text-gray-600">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {item.ingredients && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700">Zutaten:</p>
                              <p className="text-sm text-gray-600">{item.ingredients}</p>
                            </div>
                          )}

                          <div className="mt-3 flex flex-wrap gap-4">
                            {item.allergens && (
                              <div className="flex items-center gap-1 text-sm text-amber-600">
                                <AlertCircle className="w-4 h-4" />
                                <span>Allergene: {item.allergens}</span>
                              </div>
                            )}
                            {item.vegetarianAlternative && (
                              <div className="text-sm text-green-600">
                                Vegetarisch: {item.vegetarianAlternative}
                              </div>
                            )}
                            {item.timing && (
                              <div className="text-sm text-gray-500">
                                Timing: {item.timing}
                              </div>
                            )}
                          </div>

                          {item.preparationNotes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700">Zubereitungshinweise:</p>
                              <p className="text-sm text-gray-600">{item.preparationNotes}</p>
                            </div>
                          )}

                          {item.notes && (
                            <p className="mt-2 text-sm text-gray-400">{item.notes}</p>
                          )}
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
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Gericht bearbeiten' : 'Neues Gericht'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Gang *"
              options={courseOptions}
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            />
            <Input
              label="Gericht *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Portionsgrösse"
              placeholder="z.B. 150g"
              value={formData.portionSize}
              onChange={(e) => setFormData({ ...formData, portionSize: e.target.value })}
            />
            <Input
              label="Anzahl Portionen"
              type="number"
              value={formData.servings}
              onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
              placeholder={guestCount.toString()}
            />
          </div>
          <Textarea
            label="Zutaten"
            value={formData.ingredients}
            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Allergene"
              placeholder="z.B. Gluten, Laktose, Nüsse"
              value={formData.allergens}
              onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
            />
            <Input
              label="Vegetarische Alternative"
              value={formData.vegetarianAlternative}
              onChange={(e) => setFormData({ ...formData, vegetarianAlternative: e.target.value })}
            />
            <Input
              label="Timing"
              placeholder="z.B. 18:30 Uhr servieren"
              value={formData.timing}
              onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
            />
          </div>
          <Textarea
            label="Zubereitungshinweise"
            value={formData.preparationNotes}
            onChange={(e) => setFormData({ ...formData, preparationNotes: e.target.value })}
            rows={3}
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
