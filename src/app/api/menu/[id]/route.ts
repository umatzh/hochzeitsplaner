import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        course: data.course,
        name: data.name,
        ingredients: data.ingredients || null,
        portionSize: data.portionSize || null,
        allergens: data.allergens || null,
        vegetarianAlternative: data.vegetarianAlternative || null,
        preparationNotes: data.preparationNotes || null,
        timing: data.timing || null,
        servings: data.servings || 0,
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
    await prisma.menuItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
