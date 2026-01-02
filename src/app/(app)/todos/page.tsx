'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { TodoStatusLabels, PriorityLabels } from '@/types'
import { formatDate } from '@/lib/utils'
import { Plus, GripVertical, Calendar, User, LayoutGrid, List } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Todo {
  id: string
  category: string
  task: string
  responsible: string | null
  dueDate: string | null
  status: string
  priority: string
  notes: string | null
  sortOrder: number
}

const categoryOptions = [
  { value: 'LOCATION', label: 'Location' },
  { value: 'INVITATION', label: 'Einladung' },
  { value: 'CATERING', label: 'Catering' },
  { value: 'SHOPPING', label: 'Einkauf' },
  { value: 'DECORATION', label: 'Deko' },
  { value: 'PLANNING', label: 'Planung' },
  { value: 'PERSONNEL', label: 'Personal' },
  { value: 'LOGISTICS', label: 'Logistik' },
  { value: 'FOLLOWUP', label: 'Nachbereitung' }
]

const statusOptions = [
  { value: 'OPEN', label: 'Offen' },
  { value: 'IN_PROGRESS', label: 'In Arbeit' },
  { value: 'COMPLETED', label: 'Erledigt' }
]

const priorityOptions = [
  { value: 'HIGH', label: 'Hoch' },
  { value: 'MEDIUM', label: 'Mittel' },
  { value: 'LOW', label: 'Niedrig' }
]

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [formData, setFormData] = useState({
    category: 'PLANNING',
    task: '',
    responsible: '',
    dueDate: '',
    status: 'OPEN',
    priority: 'MEDIUM',
    notes: ''
  })

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
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
      const url = editingTodo ? `/api/todos/${editingTodo.id}` : '/api/todos'
      const method = editingTodo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate || null
        })
      })

      if (response.ok) {
        fetchTodos()
        closeModal()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        fetchTodos()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Aufgabe wirklich löschen?')) return
    try {
      const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchTodos()
      }
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const openModal = (todo?: Todo) => {
    if (todo) {
      setEditingTodo(todo)
      setFormData({
        category: todo.category,
        task: todo.task,
        responsible: todo.responsible || '',
        dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
        status: todo.status,
        priority: todo.priority,
        notes: todo.notes || ''
      })
    } else {
      setEditingTodo(null)
      setFormData({
        category: 'PLANNING',
        task: '',
        responsible: '',
        dueDate: '',
        status: 'OPEN',
        priority: 'MEDIUM',
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTodo(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'border-l-red-500'
      case 'MEDIUM': return 'border-l-yellow-500'
      case 'LOW': return 'border-l-green-500'
      default: return 'border-l-gray-300'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Badge variant="success">Erledigt</Badge>
      case 'IN_PROGRESS': return <Badge variant="info">In Arbeit</Badge>
      default: return <Badge variant="warning">Offen</Badge>
    }
  }

  const openTodos = todos.filter(t => t.status === 'OPEN')
  const inProgressTodos = todos.filter(t => t.status === 'IN_PROGRESS')
  const completedTodos = todos.filter(t => t.status === 'COMPLETED')

  const TodoCard = ({ todo }: { todo: Todo }) => (
    <div
      className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${getPriorityColor(todo.priority)} cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => openModal(todo)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{todo.task}</p>
          <Badge className="mt-2" variant="default">
            {categoryOptions.find(c => c.value === todo.category)?.label}
          </Badge>
        </div>
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
        {todo.responsible && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{todo.responsible}</span>
          </div>
        )}
        {todo.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(todo.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div>
      <Header title="ToDo-Liste" subtitle={`${todos.length} Aufgaben`} />

      <div className="p-6 space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{openTodos.length}</p>
              <p className="text-sm text-gray-500">Offen</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{inProgressTodos.length}</p>
              <p className="text-sm text-gray-500">In Arbeit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-green-600">{completedTodos.length}</p>
              <p className="text-sm text-gray-500">Erledigt</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-1" />
              Liste
            </Button>
          </div>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Aufgabe hinzufügen
          </Button>
        </div>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Open */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <h3 className="font-semibold text-gray-700">Offen ({openTodos.length})</h3>
              </div>
              <div className="space-y-3">
                {openTodos.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} />
                ))}
                {openTodos.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">Keine offenen Aufgaben</p>
                )}
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <h3 className="font-semibold text-gray-700">In Arbeit ({inProgressTodos.length})</h3>
              </div>
              <div className="space-y-3">
                {inProgressTodos.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} />
                ))}
                {inProgressTodos.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">Keine Aufgaben in Arbeit</p>
                )}
              </div>
            </div>

            {/* Completed */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <h3 className="font-semibold text-gray-700">Erledigt ({completedTodos.length})</h3>
              </div>
              <div className="space-y-3">
                {completedTodos.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} />
                ))}
                {completedTodos.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">Noch nichts erledigt</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getPriorityColor(todo.priority)}`}
                    onClick={() => openModal(todo)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{todo.task}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <Badge variant="default">
                          {categoryOptions.find(c => c.value === todo.category)?.label}
                        </Badge>
                        {todo.responsible && <span>{todo.responsible}</span>}
                        {todo.dueDate && <span>{formatDate(todo.dueDate)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(todo.status)}
                      <select
                        value={todo.status}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleStatusChange(todo.id, e.target.value)
                        }}
                        className="text-sm border rounded px-2 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {todos.length === 0 && (
                  <p className="text-center py-8 text-gray-500">Keine Aufgaben vorhanden</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTodo ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Aufgabe *"
            value={formData.task}
            onChange={(e) => setFormData({ ...formData, task: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Kategorie"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
            <Select
              label="Priorität"
              options={priorityOptions}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            />
            <Input
              label="Verantwortlich"
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
            />
            <Input
              label="Fällig am"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <Input
            label="Notizen"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <div className="flex justify-between pt-4">
            {editingTodo && (
              <Button type="button" variant="danger" onClick={() => { handleDelete(editingTodo.id); closeModal() }}>
                Löschen
              </Button>
            )}
            <div className="flex gap-3 ml-auto">
              <Button type="button" variant="secondary" onClick={closeModal}>Abbrechen</Button>
              <Button type="submit">{editingTodo ? 'Speichern' : 'Hinzufügen'}</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
