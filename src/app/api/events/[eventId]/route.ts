import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET single event with all details
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

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          { ownerId: userId },
          { shares: { some: { userId } } }
        ]
      },
      include: {
        eventItems: {
          orderBy: { date: 'asc' },
          include: {
            modules: true,
            _count: {
              select: {
                guests: true,
                budgetItems: true,
                todos: true
              }
            }
          }
        },
        masterGuests: true,
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event nicht gefunden' }, { status: 404 })
    }

    // Calculate totals
    const budgetItems = await prisma.budgetItem.findMany({
      where: { eventItem: { eventId } }
    })
    const guests = await prisma.guest.findMany({
      where: { eventItem: { eventId } }
    })

    const totals = {
      budget: {
        planned: budgetItems.reduce((sum, item) => sum + item.totalPrice, 0),
        paid: budgetItems.reduce((sum, item) => sum + item.paid, 0)
      },
      guests: {
        total: guests.length,
        confirmed: guests.filter(g => g.rsvpStatus === 'CONFIRMED').length,
        declined: guests.filter(g => g.rsvpStatus === 'DECLINED').length,
        pending: guests.filter(g => g.rsvpStatus === 'PENDING').length
      }
    }

    return NextResponse.json({ ...event, totals })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Fehler beim Laden des Events' }, { status: 500 })
  }
}

// PUT update event
export async function PUT(
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

    // Check ownership
    const existingEvent = await prisma.event.findFirst({
      where: { id: eventId, ownerId: userId }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event nicht gefunden oder keine Berechtigung' }, { status: 404 })
    }

    const data = await request.json()
    const { name, eventType, mainDate, location, description, totalBudget } = data

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        name: name || existingEvent.name,
        eventType: eventType || existingEvent.eventType,
        mainDate: mainDate ? new Date(mainDate) : existingEvent.mainDate,
        location: location !== undefined ? location : existingEvent.location,
        description: description !== undefined ? description : existingEvent.description,
        totalBudget: totalBudget !== undefined ? totalBudget : existingEvent.totalBudget
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Fehler beim Aktualisieren des Events' }, { status: 500 })
  }
}

// DELETE event
export async function DELETE(
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

    // Check ownership
    const existingEvent = await prisma.event.findFirst({
      where: { id: eventId, ownerId: userId }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event nicht gefunden oder keine Berechtigung' }, { status: 404 })
    }

    await prisma.event.delete({
      where: { id: eventId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen des Events' }, { status: 500 })
  }
}
