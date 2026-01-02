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

    const items = await prisma.shoppingItem.findMany({
      where: { eventItemId: eventItem.id },
      orderBy: [{ store: 'asc' }, { purchased: 'asc' }, { item: 'asc' }]
    })

    return NextResponse.json(items)
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

    const item = await prisma.shoppingItem.create({
      data: {
        eventItemId: eventItem.id,
        item: data.item,
        store: data.store || 'Sonstiges',
        quantity: data.quantity || 1,
        estimatedPrice: data.estimatedPrice || 0,
        actualPrice: data.actualPrice || null,
        notes: data.notes || null
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
