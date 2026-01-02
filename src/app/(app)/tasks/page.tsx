'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { TaskAreaLabels } from '@/types'
import { Plus, Check, Edit2, Trash2, ClipboardList } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TaskAssignment {
  id: string
  area: string
  task: string
  mainResponsible: string | null
  supportPersonnel: string | null
  timing: string | null
  status: string
  notes: string | null
}

interface Personnel {
  id: string
  personnelId: string
  name: string
}

const areaOptions = [
  { value: 'PREPARATION', label: 'Vorbereitung' },
  { value: 'SETUP', label: 'Aufbau' },
  { value: 'KITCHEN', label: 'Küche' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'BAR', label: 'Bar' },
  { value: 'COORDINATION', label: 'Koordination' },
  { value: 'TEARDOWN', label: 'Abbau' }
]

const defaultTasks = [
  { area: 'PREPARATION', task: 'Einkaufslisten vorbereiten' },
  { area: 'PREPARATION', task: 'Tischkarten vorbereiten' },
  { area: 'PREPARATION', task: 'Deko-Material sortieren' },
  { area: 'PREPARATION', task: 'Menükarten drucken' },
  { area: 'PREPARATION', task: 'Zeitplan finalisieren' },
  { area: 'SETUP', task: 'Tische und Stühle aufstellen' },
  { area: 'SETUP', task: 'Tischdecken und Deko platzieren' },
  { area: 'SETUP', task: 'Bar einrichten' },
  { area: 'SETUP', task: 'Technik aufbauen (Musik/Licht)' },
  { area: 'SETUP', task: 'Blumen arrangieren' },
  { area: 'SETUP', task: 'Geschenketisch aufbauen' },
  { area: 'SETUP', task: 'Photobox aufbauen' },
  { area: 'KITCHEN', task: 'Mise en place vorbereiten' },
  { area: 'KITCHEN', task: 'Vorspeisen anrichten' },
  { area: 'KITCHEN', task: 'Hauptgang vorbereiten' },
  { area: 'KITCHEN', task: 'Dessert anrichten' },
  { area: 'KITCHEN', task: 'Küche sauber halten' },
  { area: 'SERVICE', task: 'Apéro servieren' },
  { area: 'SERVICE', task: 'Gäste zu Tischen führen' },
  { area: 'SERVICE', task: 'Wasser und Brot einschenken' },
  { area: 'SERVICE', task: 'Gänge servieren' },
  { area: 'SERVICE', task: 'Geschirr abräumen' },
  { area: 'SERVICE', task: 'Kaffee und Kuchen servieren' },
  { area: 'BAR', task: 'Bar Eröffnung vorbereiten' },
  { area: 'BAR', task: 'Cocktails mixen' },
  { area: 'BAR', task: 'Getränke nachfüllen' },
  { area: 'BAR', task: 'Gläser spülen' },
  { area: 'COORDINATION', task: 'Gäste begrüssen' },
  { area: 'COORDINATION', task: 'Zeitplan überwachen' },
  { area: 'COORDINATION', task: 'Reden ankündigen' },
  { area: 'COORDINATION', task: 'Musik-Wünsche koordinieren' },
  { area: 'COORDINATION', task: 'Notfälle managen' },
  { area: 'TEARDOWN', task: 'Geschenke einsammeln' },
  { area: 'TEARDOWN', task: 'Deko abräumen' },
  { area: 'TEARDOWN', task: 'Tische und Stühle zusammenstellen' },
  { area: 'TEARDOWN', task: 'Location reinigen' }
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskAssignment[]>([])
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskAssignment | null>(null)
  const [formData, setFormData] = useState({
    area: 'PREPARATION',
    task: '',
    mainResponsible: '',
    supportPersonnel: '',
    timing: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tasksRes, personnelRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/personnel')
      ])
      if (tasksRes.ok && personnelRes.ok) {
        setTasks(await tasksRes.json())
        setPersonnel(await personnelRes.json())
      }
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultTasks = async () => {
    if (!confirm('36 Standard-Aufgaben erstellen?')) return
    try {
      for (const task of defaultTasks) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        })
      }
      fetchData()
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks'
      const method = editingTask ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      fetchData()
      closeModal()
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const toggleStatus = async (task: TaskAssignment) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: task.status === 'COMPLETED' ? 'OPEN' : 'COMPLETED' })
      })
      fetchData()
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Aufgabe wirklich löschen?')) return
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const openModal = (task?: TaskAssignment) => {
    if (task) {
      setEditingTask(task)
      setFormData({
        area: task.area,
        task: task.task,
        mainResponsible: task.mainResponsible || '',
        supportPersonnel: task.supportPersonnel || '',
        timing: task.timing || '',
        notes: task.notes || ''
      })
    } else {
      setEditingTask(null)
      setFormData({
        area: 'PREPARATION',
        task: '',
        mainResponsible: '',
        supportPersonnel: '',
        timing: '',
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  // Group by area
  const tasksByArea = tasks.reduce((acc, task) => {
    if (!acc[task.area]) {
      acc[task.area] = []
    }
    acc[task.area].push(task)
    return acc
  }, {} as Record<string, TaskAssignment[]>)

  const getAreaColor = (area: string) => {
    const colors: Record<string, string> = {
      PREPARATION: 'bg-purple-50 border-purple-200',
      SETUP: 'bg-blue-50 border-blue-200',
      KITCHEN: 'bg-orange-50 border-orange-200',
      SERVICE: 'bg-green-50 border-green-200',
      BAR: 'bg-amber-50 border-amber-200',
      COORDINATION: 'bg-rose-50 border-rose-200',
      TEARDOWN: 'bg-gray-50 border-gray-200'
    }
    return colors[area] || 'bg-white'
  }

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length
  const personnelOptions = personnel.map(p => ({ value: p.id, label: `${p.personnelId} - ${p.name}` }))

  return (
    <div>
      <Header title="Aufgabenverteilung" subtitle={`${tasks.length} Aufgaben`} />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold">{tasks.length}</p>
              <p className="text-sm text-gray-500">Aufgaben Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              <p className="text-sm text-gray-500">Erledigt</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{tasks.length - completedCount}</p>
              <p className="text-sm text-gray-500">Offen</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          {tasks.length === 0 && (
            <Button variant="outline" onClick={createDefaultTasks}>
              <ClipboardList className="w-4 h-4 mr-2" />
              36 Standard-Aufgaben erstellen
            </Button>
          )}
          <div className="ml-auto">
            <Button onClick={() => openModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Aufgabe hinzufügen
            </Button>
          </div>
        </div>

        {/* Tasks by Area */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Laden...</div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Noch keine Aufgaben erstellt</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {areaOptions.map(({ value: area, label }) => {
              const areaTasks = tasksByArea[area]
              if (!areaTasks || areaTasks.length === 0) return null

              const areaCompleted = areaTasks.filter(t => t.status === 'COMPLETED').length

              return (
                <Card key={area} className={getAreaColor(area)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{label}</CardTitle>
                      <Badge variant={areaCompleted === areaTasks.length ? 'success' : 'default'}>
                        {areaCompleted}/{areaTasks.length} erledigt
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {areaTasks.map((task) => {
                        const mainPerson = personnel.find(p => p.id === task.mainResponsible)
                        return (
                          <div
                            key={task.id}
                            className={`flex items-center gap-4 p-4 ${
                              task.status === 'COMPLETED' ? 'bg-white/50' : 'bg-white'
                            }`}
                          >
                            <button
                              onClick={() => toggleStatus(task)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                task.status === 'COMPLETED'
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-green-500'
                              }`}
                            >
                              {task.status === 'COMPLETED' && <Check className="w-4 h-4" />}
                            </button>
                            <div className="flex-1">
                              <p className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>
                                {task.task}
                              </p>
                              <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                {mainPerson && (
                                  <span>Verantwortlich: {mainPerson.name}</span>
                                )}
                                {task.timing && (
                                  <span>Zeit: {task.timing}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => openModal(task)} className="p-1 text-gray-400 hover:text-gray-600">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Bereich"
            options={areaOptions}
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
          />
          <Input
            label="Aufgabe *"
            value={formData.task}
            onChange={(e) => setFormData({ ...formData, task: e.target.value })}
            required
          />
          <Select
            label="Hauptverantwortlich"
            options={personnelOptions}
            value={formData.mainResponsible}
            onChange={(e) => setFormData({ ...formData, mainResponsible: e.target.value })}
          />
          <Input
            label="Unterstützung (Namen)"
            value={formData.supportPersonnel}
            onChange={(e) => setFormData({ ...formData, supportPersonnel: e.target.value })}
          />
          <Input
            label="Zeitpunkt"
            placeholder="z.B. 10:00 Uhr oder Vor dem Essen"
            value={formData.timing}
            onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
          />
          <Input
            label="Notizen"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>Abbrechen</Button>
            <Button type="submit">{editingTask ? 'Speichern' : 'Hinzufügen'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
