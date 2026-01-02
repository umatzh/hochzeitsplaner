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
      return NextResponse.json({ items: [], totalBudget: 30000 })
    }

    const items = await prisma.budgetItem.findMany({
      where: { eventItemId: eventItem.id },
      orderBy: [{ category: 'asc' }, { item: 'asc' }]
    })

    return NextResponse.json({ items, totalBudget: eventItem.budget })
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

    const totalPrice = (data.quantity || 1) * (data.unitPrice || 0)

    const item = await prisma.budgetItem.create({
      data: {
        eventItemId: eventItem.id,
        category: data.category,
        item: data.item,
        vendor: data.vendor || null,
        quantity: data.quantity || 1,
        unitPrice: data.unitPrice || 0,
        totalPrice,
        offerLink: data.offerLink || null,
        paid: data.paid || 0,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes || null
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
