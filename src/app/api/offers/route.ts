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

    const offers = await prisma.offer.findMany({
      where: { eventItemId: eventItem.id },
      orderBy: [{ isFavorite: 'desc' }, { category: 'asc' }, { amount: 'asc' }]
    })

    return NextResponse.json(offers)
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

    const offer = await prisma.offer.create({
      data: {
        eventItemId: eventItem.id,
        category: data.category,
        vendorName: data.vendorName,
        contactName: data.contactName || null,
        phone: data.phone || null,
        email: data.email || null,
        amount: data.amount || 0,
        status: data.status || 'OPEN',
        requestedAt: data.requestedAt ? new Date(data.requestedAt) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        notes: data.notes || null,
        documentUrl: data.documentUrl || null
      }
    })

    return NextResponse.json(offer)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
