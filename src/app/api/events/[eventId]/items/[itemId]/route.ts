import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET single sub-event with all details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string; itemId: string }> }
) {
  try {
    const { eventId, itemId } = await params
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

    const eventItem = await prisma.eventItem.findFirst({
      where: { id: itemId, eventId },
      include: {
        event: true,
        modules: true,
        guests: true,
        budgetItems: true,
        todos: true,
        personnel: true
      }
    })

    if (!eventItem) {
      return NextResponse.json({ error: 'Sub-Event nicht gefunden' }, { status: 404 })
    }

    // Calculate statistics
    const stats = {
      guests: {
        total: eventItem.guests.length,
        confirmed: eventItem.guests.filter(g => g.rsvpStatus === 'CONFIRMED').length,
        declined: eventItem.guests.filter(g => g.rsvpStatus === 'DECLINED').length,
        pending: eventItem.guests.filter(g => g.rsvpStatus === 'PENDING').length
      },
      budget: {
        planned: eventItem.budgetItems.reduce((sum, item) => sum + item.totalPrice, 0),
        paid: eventItem.budgetItems.reduce((sum, item) => sum + item.paid, 0)
      },
      todos: {
        open: eventItem.todos.filter(t => t.status === 'OPEN').length,
        inProgress: eventItem.todos.filter(t => t.status === 'IN_PROGRESS').length,
        completed: eventItem.todos.filter(t => t.status === 'COMPLETED').length
      }
    }

    return NextResponse.json({ ...eventItem, stats })
  } catch (error) {
    console.error('Error fetching event item:', error)
    return NextResponse.json({ error: 'Fehler beim Laden des Sub-Events' }, { status: 500 })
  }
}

// PUT update sub-event
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventId: string; itemId: string }> }
) {
  try {
    const { eventId, itemId } = await params
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

    const existingItem = await prisma.eventItem.findFirst({
      where: { id: itemId, eventId }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Sub-Event nicht gefunden' }, { status: 404 })
    }

    const data = await request.json()
    const { name, itemType, date, time, endTime, location, budget, guestCount, status, notes, activeModules } = data

    // Update the sub-event
    const eventItem = await prisma.eventItem.update({
      where: { id: itemId },
      data: {
        name: name !== undefined ? name : existingItem.name,
        itemType: itemType !== undefined ? itemType : existingItem.itemType,
        date: date ? new Date(date) : existingItem.date,
        time: time !== undefined ? time : existingItem.time,
        endTime: endTime !== undefined ? endTime : existingItem.endTime,
        location: location !== undefined ? location : existingItem.location,
        budget: budget !== undefined ? budget : existingItem.budget,
        guestCount: guestCount !== undefined ? guestCount : existingItem.guestCount,
        status: status !== undefined ? status : existingItem.status,
        notes: notes !== undefined ? notes : existingItem.notes
      }
    })

    // Update module configurations if provided
    if (activeModules && Array.isArray(activeModules)) {
      const allModules = ['dashboard', 'guests', 'budget', 'offers', 'todos', 'shopping', 'timeline', 'contacts', 'menu', 'personnel', 'shifts', 'payroll', 'tasks']

      for (const moduleName of allModules) {
        await prisma.eventModule.upsert({
          where: {
            eventItemId_moduleName: {
              eventItemId: itemId,
              moduleName
            }
          },
          update: {
            isActive: activeModules.includes(moduleName)
          },
          create: {
            eventItemId: itemId,
            moduleName,
            isActive: activeModules.includes(moduleName)
          }
        })
      }
    }

    // Fetch updated item with modules
    const updatedItem = await prisma.eventItem.findUnique({
      where: { id: itemId },
      include: { modules: true }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating event item:', error)
    return NextResponse.json({ error: 'Fehler beim Aktualisieren des Sub-Events' }, { status: 500 })
  }
}

// DELETE sub-event
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string; itemId: string }> }
) {
  try {
    const { eventId, itemId } = await params
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

    const existingItem = await prisma.eventItem.findFirst({
      where: { id: itemId, eventId }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Sub-Event nicht gefunden' }, { status: 404 })
    }

    await prisma.eventItem.delete({
      where: { id: itemId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event item:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen des Sub-Events' }, { status: 500 })
  }
}
