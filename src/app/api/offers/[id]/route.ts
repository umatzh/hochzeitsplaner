import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const offer = await prisma.offer.update({
      where: { id },
      data: {
        category: data.category,
        vendorName: data.vendorName,
        contactName: data.contactName || null,
        phone: data.phone || null,
        email: data.email || null,
        amount: data.amount || 0,
        status: data.status,
        requestedAt: data.requestedAt ? new Date(data.requestedAt) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        notes: data.notes || null,
        documentUrl: data.documentUrl || null
      }
    })

    return NextResponse.json(offer)
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

    const offer = await prisma.offer.update({
      where: { id },
      data
    })

    return NextResponse.json(offer)
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
    await prisma.offer.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
