import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getDefaultModules } from '@/types'

// GET all sub-events for an event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
    }

    // Verify access to event
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          { ownerId: userId },
          { shares: { some: { userId } } }
        ]
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event nicht gefunden' }, { status: 404 })
    }

    const items = await prisma.eventItem.findMany({
      where: { eventId },
      include: {
        modules: true,
        _count: {
          select: {
            guests: true,
            budgetItems: true,
            todos: true,
            personnel: true
          }
        }
      },
      orderBy: [{ date: 'asc' }, { sortOrder: 'asc' }]
    })

    // Calculate budget per sub-event
    const itemsWithBudget = await Promise.all(items.map(async (item) => {
      const budgetItems = await prisma.budgetItem.findMany({
        where: { eventItemId: item.id }
      })
      const planned = budgetItems.reduce((sum, b) => sum + b.totalPrice, 0)
      const paid = budgetItems.reduce((sum, b) => sum + b.paid, 0)

      return {
        ...item,
        budgetStats: { planned, paid, open: planned - paid }
      }
    }))

    return NextResponse.json(itemsWithBudget)
  } catch (error) {
    console.error('Error fetching event items:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Sub-Events' }, { status: 500 })
  }
}

// POST create new sub-event with smart module selection
export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
    }

    // Verify ownership
    const event = await prisma.event.findFirst({
      where: { id: eventId, ownerId: userId }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event nicht gefunden oder keine Berechtigung' }, { status: 404 })
    }

    const data = await request.json()
    const { name, itemType, date, time, endTime, location, budget, guestCount, notes, activeModules } = data

    if (!name || !itemType || !date) {
      return NextResponse.json(
        { error: 'Name, Typ und Datum sind erforderlich' },
        { status: 400 }
      )
    }

    // Get the next sort order
    const maxSortOrder = await prisma.eventItem.aggregate({
      where: { eventId },
      _max: { sortOrder: true }
    })

    // Create the sub-event
    const eventItem = await prisma.eventItem.create({
      data: {
        eventId,
        name,
        itemType,
        date: new Date(date),
        time: time || null,
        endTime: endTime || null,
        location: location || null,
        budget: budget || 0,
        guestCount: guestCount || 0,
        notes: notes || null,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1
      }
    })

    // Create module configurations using smart selection or provided modules
    const modulesToActivate = activeModules || getDefaultModules(event.eventType, itemType)
    const allModules = ['dashboard', 'guests', 'budget', 'offers', 'todos', 'shopping', 'timeline', 'contacts', 'menu', 'personnel', 'shifts', 'payroll', 'tasks']

    await prisma.eventModule.createMany({
      data: allModules.map(moduleName => ({
        eventItemId: eventItem.id,
        moduleName,
        isActive: modulesToActivate.includes(moduleName)
      }))
    })

    // Fetch the created item with modules
    const createdItem = await prisma.eventItem.findUnique({
      where: { id: eventItem.id },
      include: { modules: true }
    })

    return NextResponse.json(createdItem, { status: 201 })
  } catch (error) {
    console.error('Error creating event item:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen des Sub-Events' }, { status: 500 })
  }
}
