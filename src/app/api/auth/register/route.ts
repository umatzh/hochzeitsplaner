import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getDefaultModules } from '@/types'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email und Passwort sind erforderlich' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email bereits registriert' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      }
    })

    // Create initial event for user
    const event = await prisma.event.create({
      data: {
        name: 'Mein erstes Event',
        eventType: 'WEDDING',
        mainDate: new Date('2025-09-15'),
        location: 'Zürich',
        totalBudget: 30000,
        ownerId: user.id
      }
    })

    // Create initial sub-event (main wedding)
    const eventItem = await prisma.eventItem.create({
      data: {
        eventId: event.id,
        name: 'Hochzeitsfeier',
        itemType: 'MAIN_EVENT',
        date: new Date('2025-09-15'),
        time: '17:00',
        location: 'Zürich',
        budget: 25000
      }
    })

    // Create module configurations for the sub-event
    const allModules = ['dashboard', 'guests', 'budget', 'offers', 'todos', 'shopping', 'timeline', 'contacts', 'menu', 'personnel', 'shifts', 'payroll', 'tasks']
    const activeModules = getDefaultModules('WEDDING', 'MAIN_EVENT')

    await prisma.eventModule.createMany({
      data: allModules.map(moduleName => ({
        eventItemId: eventItem.id,
        moduleName,
        isActive: activeModules.includes(moduleName)
      }))
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registrierung fehlgeschlagen' },
      { status: 500 }
    )
  }
}
