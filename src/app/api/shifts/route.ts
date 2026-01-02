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

    const shifts = await prisma.shiftAssignment.findMany({
      where: { eventItemId: eventItem.id },
      orderBy: [{ timeSlot: 'asc' }]
    })

    return NextResponse.json(shifts)
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

    const shift = await prisma.shiftAssignment.create({
      data: {
        eventItemId: eventItem.id,
        personnelId: data.personnelId,
        timeSlot: data.timeSlot,
        role: data.role,
        isAssigned: true
      }
    })

    return NextResponse.json(shift)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
