import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const totalPrice = (data.quantity || 1) * (data.unitPrice || 0)

    const item = await prisma.budgetItem.update({
      where: { id },
      data: {
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.budgetItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
