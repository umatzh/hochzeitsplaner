'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PersonnelRoleLabels } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Calculator, Check, Edit2, Download, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Personnel {
  id: string
  personnelId: string
  name: string
  role: string
  hourlyRate: number
}

interface PayrollItem {
  id: string
  personnelId: string
  plannedHours: number
  actualHours: number
  hourlyRate: number
  grossPay: number
  deductions: number
  netPay: number
  isPaid: boolean
  notes: string | null
  personnel: Personnel
}

export default function PayrollPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [payroll, setPayroll] = useState<PayrollItem[]>([])
  const [shifts, setShifts] = useState<{ personnelId: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPayroll, setEditingPayroll] = useState<PayrollItem | null>(null)
  const [formData, setFormData] = useState({
    actualHours: '',
    deductions: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [personnelRes, payrollRes, shiftsRes] = await Promise.all([
        fetch('/api/personnel'),
        fetch('/api/payroll'),
        fetch('/api/shifts')
      ])
      if (personnelRes.ok && payrollRes.ok && shiftsRes.ok) {
        setPersonnel(await personnelRes.json())
        setPayroll(await payrollRes.json())
        setShifts(await shiftsRes.json())
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlannedHours = (personnelId: string) => {
    return shifts.filter(s => s.personnelId === personnelId).length * 0.5
  }

  const createOrUpdatePayroll = async (person: Personnel) => {
    const plannedHours = getPlannedHours(person.id)
    const existingPayroll = payroll.find(p => p.personnelId === person.id)

    try {
      if (existingPayroll) {
        await fetch(`/api/payroll/${existingPayroll.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plannedHours,
            actualHours: existingPayroll.actualHours || plannedHours,
            hourlyRate: person.hourlyRate
          })
        })
      } else {
        await fetch('/api/payroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personnelId: person.id,
            plannedHours,
            actualHours: plannedHours,
            hourlyRate: person.hourlyRate
          })
        })
      }
      fetchData()
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const recalculateAll = async () => {
    for (const person of personnel) {
      await createOrUpdatePayroll(person)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPayroll) return

    try {
      await fetch(`/api/payroll/${editingPayroll.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualHours: parseFloat(formData.actualHours) || 0,
          deductions: parseFloat(formData.deductions) || 0,
          notes: formData.notes || null
        })
      })
      fetchData()
      closeModal()
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const togglePaid = async (item: PayrollItem) => {
    try {
      await fetch(`/api/payroll/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: !item.isPaid })
      })
      fetchData()
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const openModal = (item: PayrollItem) => {
    setEditingPayroll(item)
    setFormData({
      actualHours: item.actualHours.toString(),
      deductions: item.deductions.toString(),
      notes: item.notes || ''
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPayroll(null)
  }

  const handlePrint = () => {
    window.print()
  }

  // Totals
  const totalGross = payroll.reduce((sum, p) => sum + p.grossPay, 0)
  const totalDeductions = payroll.reduce((sum, p) => sum + p.deductions, 0)
  const totalNet = payroll.reduce((sum, p) => sum + p.netPay, 0)
  const totalPaid = payroll.filter(p => p.isPaid).reduce((sum, p) => sum + p.netPay, 0)
  const totalOpen = totalNet - totalPaid

  return (
    <div>
      <Header title="Stundenabrechnung" subtitle="Lohnabrechnung für alle Helfer" />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{formatCurrency(totalGross)}</p>
              <p className="text-sm text-gray-500">Brutto Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDeductions)}</p>
              <p className="text-sm text-gray-500">Abzüge</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalNet)}</p>
              <p className="text-sm text-gray-500">Netto Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              <p className="text-sm text-gray-500">Bezahlt</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-rose-600">{formatCurrency(totalOpen)}</p>
              <p className="text-sm text-gray-500">Offen</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between print:hidden">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Drucken
            </Button>
          </div>
          <Button onClick={recalculateAll}>
            <Calculator className="w-4 h-4 mr-2" />
            Aus Schichtplan berechnen
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
                  <TableHead className="text-right">Stundenlohn</TableHead>
                  <TableHead className="text-right">Geplant</TableHead>
                  <TableHead className="text-right">Effektiv</TableHead>
                  <TableHead className="text-right">Brutto</TableHead>
                  <TableHead className="text-right">Abzüge</TableHead>
                  <TableHead className="text-right">Netto</TableHead>
                  <TableHead className="text-center">Bezahlt</TableHead>
                  <TableHead className="text-right print:hidden">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">Laden...</TableCell>
                  </TableRow>
                ) : payroll.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Noch keine Abrechnungen</p>
                      <p className="text-sm mt-2">Klicke auf "Aus Schichtplan berechnen"</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  payroll.map((item) => {
                    const person = personnel.find(p => p.id === item.personnelId)
                    return (
                      <TableRow key={item.id} className={item.isPaid ? 'bg-green-50' : ''}>
                        <TableCell className="font-mono">{person?.personnelId}</TableCell>
                        <TableCell className="font-medium">{person?.name}</TableCell>
                        <TableCell>
                          <Badge>{PersonnelRoleLabels[person?.role || 'OTHER']}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.hourlyRate)}</TableCell>
                        <TableCell className="text-right">{item.plannedHours.toFixed(1)}h</TableCell>
                        <TableCell className="text-right">{item.actualHours.toFixed(1)}h</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.grossPay)}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(item.deductions)}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(item.netPay)}</TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => togglePaid(item)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto transition-colors ${
                              item.isPaid
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {item.isPaid && <Check className="w-4 h-4" />}
                          </button>
                        </TableCell>
                        <TableCell className="text-right print:hidden">
                          <button onClick={() => openModal(item)} className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
                {/* Totals row */}
                {payroll.length > 0 && (
                  <TableRow className="bg-gray-100 font-bold">
                    <TableCell colSpan={6} className="text-right">TOTAL:</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalGross)}</TableCell>
                    <TableCell className="text-right text-red-600">{formatCurrency(totalDeductions)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalNet)}</TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Abrechnung bearbeiten">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Effektive Stunden"
            type="number"
            step="0.5"
            value={formData.actualHours}
            onChange={(e) => setFormData({ ...formData, actualHours: e.target.value })}
          />
          <Input
            label="Abzüge (CHF)"
            type="number"
            step="0.01"
            placeholder="z.B. Verpflegung, Vorschüsse"
            value={formData.deductions}
            onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
          />
          <Input
            label="Notizen"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>Abbrechen</Button>
            <Button type="submit">Speichern</Button>
          </div>
        </form>
      </Modal>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
