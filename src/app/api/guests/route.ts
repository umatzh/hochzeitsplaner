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

    const guests = await prisma.guest.findMany({
      where: { eventItemId: eventItem.id },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(guests)
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

    const guest = await prisma.guest.create({
      data: {
        eventItemId: eventItem.id,
        name: data.name,
        companion: data.companion || null,
        child1Name: data.child1Name || null,
        child2Name: data.child2Name || null,
        priority: data.priority || 'MEDIUM',
        invitationStatus: data.invitationStatus || 'NOT_SENT',
        rsvpStatus: data.rsvpStatus || 'PENDING',
        menuType: data.menuType || 'REGULAR',
        allergies: data.allergies || null,
        tableNumber: data.tableNumber || null,
        notes: data.notes || null,
        email: data.email || null,
        phone: data.phone || null
      }
    })

    return NextResponse.json(guest)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
