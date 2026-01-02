import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const existing = await prisma.payrollItem.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const actualHours = data.actualHours !== undefined ? data.actualHours : existing.actualHours
    const hourlyRate = data.hourlyRate !== undefined ? data.hourlyRate : existing.hourlyRate
    const deductions = data.deductions !== undefined ? data.deductions : existing.deductions

    const grossPay = actualHours * hourlyRate
    const netPay = grossPay - deductions

    const payroll = await prisma.payrollItem.update({
      where: { id },
      data: {
        plannedHours: data.plannedHours !== undefined ? data.plannedHours : existing.plannedHours,
        actualHours,
        hourlyRate,
        grossPay,
        deductions,
        netPay,
        notes: data.notes !== undefined ? data.notes : existing.notes
      }
    })

    return NextResponse.json(payroll)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const payroll = await prisma.payrollItem.update({
      where: { id },
      data: {
        ...data,
        paidAt: data.isPaid ? new Date() : null
      }
    })

    return NextResponse.json(payroll)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
