import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const guest = await prisma.guest.update({
      where: { id },
      data: {
        name: data.name,
        companion: data.companion || null,
        child1Name: data.child1Name || null,
        child2Name: data.child2Name || null,
        priority: data.priority,
        invitationStatus: data.invitationStatus,
        rsvpStatus: data.rsvpStatus,
        menuType: data.menuType,
        allergies: data.allergies || null,
        tableNumber: data.tableNumber || null,
        notes: data.notes || null,
        email: data.email || null,
        phone: data.phone || null
      }
    })

    return NextResponse.json(guest)
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
    await prisma.guest.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
