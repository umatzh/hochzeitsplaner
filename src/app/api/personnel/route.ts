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

    const personnel = await prisma.personnel.findMany({
      where: { eventItemId: eventItem.id },
      orderBy: [{ personnelId: 'asc' }]
    })

    return NextResponse.json(personnel)
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

    const person = await prisma.personnel.create({
      data: {
        eventItemId: eventItem.id,
        personnelId: data.personnelId,
        name: data.name,
        role: data.role || 'OTHER',
        phone: data.phone || null,
        email: data.email || null,
        hourlyRate: data.hourlyRate || 0,
        availability: data.availability || null,
        notes: data.notes || null
      }
    })

    return NextResponse.json(person)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
