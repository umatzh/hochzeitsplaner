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

    const payroll = await prisma.payrollItem.findMany({
      where: { eventItemId: eventItem.id },
      include: { personnel: true },
      orderBy: [{ personnel: { personnelId: 'asc' } }]
    })

    return NextResponse.json(payroll)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const eventItem = await getDefaultEventItem()
    if (!eventItem) {
      return NextResponse.json({ error: 'No event found' }, { status: 400 })
    }

    const grossPay = (data.actualHours || data.plannedHours || 0) * (data.hourlyRate || 0)
    const netPay = grossPay - (data.deductions || 0)

    const payroll = await prisma.payrollItem.create({
      data: {
        eventItemId: eventItem.id,
        personnelId: data.personnelId,
        plannedHours: data.plannedHours || 0,
        actualHours: data.actualHours || data.plannedHours || 0,
        hourlyRate: data.hourlyRate || 0,
        grossPay,
        deductions: data.deductions || 0,
        netPay,
        isPaid: false,
        notes: data.notes || null
      }
    })

    return NextResponse.json(payroll)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
