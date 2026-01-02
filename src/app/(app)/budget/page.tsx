'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BudgetCategoryLabels } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface BudgetItem {
  id: string
  category: string
  item: string
  vendor: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  offerLink: string | null
  paid: number
  dueDate: string | null
  notes: string | null
}

const categoryOptions = [
  { value: 'CATERING', label: 'Catering' },
  { value: 'DRINKS', label: 'Getränke' },
  { value: 'DECORATION', label: 'Deko' },
  { value: 'EQUIPMENT', label: 'Ausstattung' },
  { value: 'LOCATION', label: 'Location' },
  { value: 'PERSONNEL', label: 'Personal' },
  { value: 'OTHER', label: 'Sonstiges' }
]

const COLORS = ['#f43f5e', '#fb7185', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6', '#06b6d4']

export default function BudgetPage() {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [totalBudget, setTotalBudget] = useState(30000)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [formData, setFormData] = useState({
    category: 'CATERING',
    item: '',
    vendor: '',
    quantity: '1',
    unitPrice: '',
    offerLink: '',
    paid: '',
    dueDate: '',
    notes: ''
  })

  useEffect(() => {
    fetchBudget()
  }, [])

  const fetchBudget = async () => {
    try {
      const response = await fetch('/api/budget')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
        setTotalBudget(data.totalBudget || 30000)
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
      const url = editingItem ? `/api/budget/${editingItem.id}` : '/api/budget'
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity) || 1,
          unitPrice: parseFloat(formData.unitPrice) || 0,
          paid: parseFloat(formData.paid) || 0,
          dueDate: formData.dueDate || null
        })
      })

      if (response.ok) {
        fetchBudget()
        closeModal()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Posten wirklich löschen?')) return
    try {
      const response = await fetch(`/api/budget/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchBudget()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const openModal = (item?: BudgetItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        category: item.category,
        item: item.item,
        vendor: item.vendor || '',
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        offerLink: item.offerLink || '',
        paid: item.paid.toString(),
        dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
        notes: item.notes || ''
      })
    } else {
      setEditingItem(null)
      setFormData({
        category: 'CATERING',
        item: '',
        vendor: '',
        quantity: '1',
        unitPrice: '',
        offerLink: '',
        paid: '',
        dueDate: '',
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  // Calculate statistics
  const planned = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const paid = items.reduce((sum, item) => sum + item.paid, 0)
  const open = planned - paid
  const remaining = totalBudget - planned

  // Data for pie chart
  const categoryData = Object.entries(
    items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.totalPrice
      return acc
    }, {} as Record<string, number>)
  ).map(([category, value]) => ({
    name: BudgetCategoryLabels[category] || category,
    value
  }))

  // Data for comparison chart
  const comparisonData = [
    { name: 'Budget', value: totalBudget, fill: '#e5e7eb' },
    { name: 'Geplant', value: planned, fill: '#f43f5e' },
    { name: 'Bezahlt', value: paid, fill: '#10b981' }
  ]

  return (
    <div>
      <Header title="Budget-Verwaltung" subtitle="Alle Ausgaben im Überblick" />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Gesamtbudget</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                </div>
                <Wallet className="w-8 h-8 text-gray-300" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Geplant</p>
                  <p className="text-2xl font-bold text-rose-600">{formatCurrency(planned)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-rose-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Bezahlt</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(paid)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div>
                <p className="text-sm text-gray-500">Offen</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(open)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div>
                <p className="text-sm text-gray-500">Restbudget</p>
                <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(remaining)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Verteilung nach Kategorien</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
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
                  Keine Daten vorhanden
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget vs. Ist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end">
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Posten hinzufügen
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Posten</TableHead>
                  <TableHead>Anbieter</TableHead>
                  <TableHead className="text-right">Anzahl</TableHead>
                  <TableHead className="text-right">Einzelpreis</TableHead>
                  <TableHead className="text-right">Gesamt</TableHead>
                  <TableHead className="text-right">Bezahlt</TableHead>
                  <TableHead>Fällig</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">Laden...</TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Keine Posten vorhanden
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge>{BudgetCategoryLabels[item.category]}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.item}</TableCell>
                      <TableCell>{item.vendor || '-'}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.paid >= item.totalPrice ? 'text-green-600' : 'text-yellow-600'}>
                          {formatCurrency(item.paid)}
                        </span>
                      </TableCell>
                      <TableCell>{item.dueDate ? formatDate(item.dueDate) : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openModal(item)} className="p-1 text-gray-500 hover:text-gray-700">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-500 hover:text-red-600">
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
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Posten bearbeiten' : 'Neuer Posten'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Kategorie *"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="Posten *"
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              required
            />
            <Input
              label="Anbieter"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            />
            <Input
              label="Anzahl"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
            <Input
              label="Einzelpreis (CHF)"
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            />
            <Input
              label="Bezahlt (CHF)"
              type="number"
              step="0.01"
              value={formData.paid}
              onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
            />
            <Input
              label="Fällig am"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <Input
              label="Offerte-Link"
              value={formData.offerLink}
              onChange={(e) => setFormData({ ...formData, offerLink: e.target.value })}
            />
          </div>
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
