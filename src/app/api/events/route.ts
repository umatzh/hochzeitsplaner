import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET all events for the current user
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
    }

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { shares: { some: { userId } } }
        ]
      },
      include: {
        eventItems: {
          orderBy: { date: 'asc' }
        },
        _count: {
          select: { eventItems: true }
        }
      },
      orderBy: { mainDate: 'asc' }
    })

    // Calculate totals for each event
    const eventsWithTotals = await Promise.all(events.map(async (event) => {
      // Get total budget across all sub-events
      const budgetItems = await prisma.budgetItem.findMany({
        where: {
          eventItem: {
            eventId: event.id
          }
        }
      })
      const totalPlanned = budgetItems.reduce((sum, item) => sum + item.totalPrice, 0)
      const totalPaid = budgetItems.reduce((sum, item) => sum + item.paid, 0)

      // Get total guests across all sub-events
      const guests = await prisma.guest.findMany({
        where: {
          eventItem: {
            eventId: event.id
          }
        }
      })
      const totalGuests = guests.length
      const confirmedGuests = guests.filter(g => g.rsvpStatus === 'CONFIRMED').length

      return {
        ...event,
        totals: {
          budget: totalPlanned,
          paid: totalPaid,
          guests: totalGuests,
          confirmedGuests
        }
      }
    }))

    return NextResponse.json(eventsWithTotals)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Events' }, { status: 500 })
  }
}

// POST create new event
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
    }

    const data = await request.json()
    const { name, eventType, mainDate, location, description, totalBudget } = data

    if (!name || !eventType || !mainDate) {
      return NextResponse.json(
        { error: 'Name, Typ und Datum sind erforderlich' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        name,
        eventType,
        mainDate: new Date(mainDate),
        location: location || null,
        description: description || null,
        totalBudget: totalBudget || 0,
        ownerId: userId
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen des Events' }, { status: 500 })
  }
}
