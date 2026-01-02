'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PersonnelRoleLabels } from '@/types'
import { generateTimeSlots } from '@/lib/utils'
import { Check, Printer, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Personnel {
  id: string
  personnelId: string
  name: string
  role: string
  hourlyRate: number
}

interface ShiftAssignment {
  id: string
  personnelId: string
  timeSlot: string
  role: string
  isAssigned: boolean
}

const timeSlots = generateTimeSlots(7, 23, 30)
const roles = ['SETUP', 'SERVICE', 'KITCHEN', 'BAR', 'COORDINATION', 'TEARDOWN']

export default function ShiftsPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [shifts, setShifts] = useState<ShiftAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [personnelRes, shiftsRes] = await Promise.all([
        fetch('/api/personnel'),
        fetch('/api/shifts')
      ])
      if (personnelRes.ok && shiftsRes.ok) {
        const personnelData = await personnelRes.json()
        const shiftsData = await shiftsRes.json()
        setPersonnel(personnelData)
        setShifts(shiftsData)
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleShift = async (personnelId: string, timeSlot: string, role: string) => {
    const existing = shifts.find(
      s => s.personnelId === personnelId && s.timeSlot === timeSlot && s.role === role
    )

    try {
      if (existing) {
        await fetch(`/api/shifts/${existing.id}`, { method: 'DELETE' })
      } else {
        await fetch('/api/shifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personnelId, timeSlot, role })
        })
      }
      fetchData()
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const isAssigned = (personnelId: string, timeSlot: string, role: string) => {
    return shifts.some(
      s => s.personnelId === personnelId && s.timeSlot === timeSlot && s.role === role
    )
  }

  const getPersonnelHours = (personnelId: string) => {
    const personShifts = shifts.filter(s => s.personnelId === personnelId)
    return personShifts.length * 0.5 // 30-minute slots
  }

  const getSlotCount = (timeSlot: string) => {
    return shifts.filter(s => s.timeSlot === timeSlot).length
  }

  const handlePrint = () => {
    window.print()
  }

  // Group personnel by role
  const personnelByRole = roles.reduce((acc, role) => {
    acc[role] = personnel.filter(p => p.role === role)
    return acc
  }, {} as Record<string, Personnel[]>)

  return (
    <div>
      <Header title="Einsatzplanung" subtitle="Visueller Schichtplan" />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold">{personnel.length}</p>
              <p className="text-sm text-gray-500">Helfer</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-rose-600">{shifts.length}</p>
              <p className="text-sm text-gray-500">Zuweisungen</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{(shifts.length * 0.5).toFixed(1)}</p>
              <p className="text-sm text-gray-500">Total Stunden</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Drucken
                </Button>
                <Button variant="outline" onClick={fetchData}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Laden...</div>
        ) : personnel.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <p>Zuerst Personal im Modul "Personal" erfassen</p>
              <Button className="mt-4" onClick={() => window.location.href = '/personnel'}>
                Zum Personal-Modul
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Heatmap Legend */}
            <div className="flex items-center gap-4 print:hidden">
              <span className="text-sm text-gray-500">Auslastung:</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-100 rounded" />
                <span className="text-xs">0-2</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-yellow-100 rounded" />
                <span className="text-xs">3-4</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-rose-100 rounded" />
                <span className="text-xs">5+</span>
              </div>
            </div>

            {/* Shift Grid per Role */}
            {roles.map(role => {
              const rolePersonnel = personnelByRole[role]
              if (!rolePersonnel || rolePersonnel.length === 0) return null

              return (
                <Card key={role} className="overflow-x-auto">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="flex items-center gap-2">
                      <Badge>{PersonnelRoleLabels[role]}</Badge>
                      <span className="text-sm font-normal text-gray-500">
                        ({rolePersonnel.length} Personen)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="sticky left-0 bg-white p-2 text-left font-medium min-w-[120px]">
                              Name
                            </th>
                            {timeSlots.map(slot => {
                              const count = getSlotCount(slot)
                              const bgColor = count === 0 ? 'bg-white' :
                                count <= 2 ? 'bg-green-50' :
                                count <= 4 ? 'bg-yellow-50' : 'bg-rose-50'
                              return (
                                <th key={slot} className={`p-1 text-center text-xs font-normal ${bgColor}`}>
                                  {slot}
                                </th>
                              )
                            })}
                            <th className="p-2 text-center font-medium">Std.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rolePersonnel.map(person => (
                            <tr key={person.id} className="border-b hover:bg-gray-50">
                              <td className="sticky left-0 bg-white p-2 font-medium">
                                <div>{person.name}</div>
                                <div className="text-xs text-gray-400">{person.personnelId}</div>
                              </td>
                              {timeSlots.map(slot => {
                                const assigned = isAssigned(person.id, slot, role)
                                return (
                                  <td key={slot} className="p-0.5 text-center">
                                    <button
                                      onClick={() => toggleShift(person.id, slot, role)}
                                      className={`w-6 h-6 rounded transition-colors ${
                                        assigned
                                          ? 'bg-green-500 text-white'
                                          : 'bg-gray-100 hover:bg-gray-200'
                                      }`}
                                    >
                                      {assigned && <Check className="w-4 h-4 mx-auto" />}
                                    </button>
                                  </td>
                                )
                              })}
                              <td className="p-2 text-center font-medium">
                                {getPersonnelHours(person.id).toFixed(1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Personnel without role */}
            {personnel.filter(p => !roles.includes(p.role)).length > 0 && (
              <Card>
                <CardHeader className="bg-gray-50">
                  <CardTitle>Sonstige</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {personnel.filter(p => !roles.includes(p.role)).map(p => (
                      <Badge key={p.id}>{p.name}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

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
