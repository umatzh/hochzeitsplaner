import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper to get default eventItem for legacy routes
async function getDefaultEventItem() {
  const event = await prisma.event.findFirst({
    include: { eventItems: { take: 1 } }
  })
  if (!event || event.eventItems.length === 0) return null
  return event.eventItems[0]
}

export async function GET() {
  try {
    const eventItem = await getDefaultEventItem()
    if (!eventItem) {
      return NextResponse.json([])
    }

    const todos = await prisma.todo.findMany({
      where: { eventItemId: eventItem.id },
      orderBy: [{ status: 'asc' }, { priority: 'asc' }, { dueDate: 'asc' }]
    })

    return NextResponse.json(todos)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    let eventItem = await getDefaultEventItem()
    if (!eventItem) {
      return NextResponse.json({ error: 'No event found' }, { status: 400 })
    }

    const todo = await prisma.todo.create({
      data: {
        eventItemId: eventItem.id,
        category: data.category,
        task: data.task,
        responsible: data.responsible || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status || 'OPEN',
        priority: data.priority || 'MEDIUM',
        notes: data.notes || null
      }
    })

    return NextResponse.json(todo)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
