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

    const tasks = await prisma.taskAssignment.findMany({
      where: { eventItemId: eventItem.id },
      orderBy: [{ area: 'asc' }, { sortOrder: 'asc' }, { task: 'asc' }]
    })

    return NextResponse.json(tasks)
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

    const task = await prisma.taskAssignment.create({
      data: {
        eventItemId: eventItem.id,
        area: data.area,
        task: data.task,
        mainResponsible: data.mainResponsible || null,
        supportPersonnel: data.supportPersonnel || null,
        timing: data.timing || null,
        status: 'OPEN',
        notes: data.notes || null
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
