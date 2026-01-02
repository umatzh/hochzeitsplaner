import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BudgetCategoryLabels } from '@/types'

export async function GET() {
  try {
    // Get first event with first eventItem (for demo purposes / legacy support)
    const event = await prisma.event.findFirst({
      include: {
        eventItems: {
          take: 1,
          include: {
            guests: true,
            budgetItems: true,
            todos: true,
            payrollItems: true
          }
        }
      }
    })

    if (!event || event.eventItems.length === 0) {
      return NextResponse.json({
        event: null,
        guests: { total: 0, confirmed: 0, declined: 0, pending: 0 },
        budget: { total: 0, planned: 0, paid: 0, open: 0, remaining: 0, byCategory: [] },
        todos: { open: 0, inProgress: 0, completed: 0 },
        personnel: { planned: 0, paid: 0, open: 0 }
      })
    }

    const eventItem = event.eventItems[0]

    // Guest statistics
    const guestStats = {
      total: eventItem.guests.length,
      confirmed: eventItem.guests.filter(g => g.rsvpStatus === 'CONFIRMED').length,
      declined: eventItem.guests.filter(g => g.rsvpStatus === 'DECLINED').length,
      pending: eventItem.guests.filter(g => g.rsvpStatus === 'PENDING').length
    }

    // Budget statistics
    const budgetPlanned = eventItem.budgetItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const budgetPaid = eventItem.budgetItems.reduce((sum, item) => sum + item.paid, 0)
    const budgetOpen = budgetPlanned - budgetPaid

    // Budget by category
    const categoryTotals = eventItem.budgetItems.reduce((acc, item) => {
      const category = item.category
      acc[category] = (acc[category] || 0) + item.totalPrice
      return acc
    }, {} as Record<string, number>)

    const byCategory = Object.entries(categoryTotals).map(([category, value]) => ({
      name: BudgetCategoryLabels[category] || category,
      value,
      color: '#f43f5e'
    }))

    // Todo statistics
    const todoStats = {
      open: eventItem.todos.filter(t => t.status === 'OPEN').length,
      inProgress: eventItem.todos.filter(t => t.status === 'IN_PROGRESS').length,
      completed: eventItem.todos.filter(t => t.status === 'COMPLETED').length
    }

    // Personnel costs
    const personnelPlanned = eventItem.payrollItems.reduce((sum, p) => sum + p.grossPay, 0)
    const personnelPaid = eventItem.payrollItems.filter(p => p.isPaid).reduce((sum, p) => sum + p.netPay, 0)
    const personnelOpen = personnelPlanned - personnelPaid

    return NextResponse.json({
      event: {
        name: event.name,
        mainDate: event.mainDate.toISOString()
      },
      // Legacy wedding field for backwards compatibility
      wedding: {
        name: event.name,
        weddingDate: event.mainDate.toISOString()
      },
      guests: guestStats,
      budget: {
        total: eventItem.budget,
        planned: budgetPlanned,
        paid: budgetPaid,
        open: budgetOpen,
        remaining: eventItem.budget - budgetPlanned,
        byCategory
      },
      todos: todoStats,
      personnel: {
        planned: personnelPlanned,
        paid: personnelPaid,
        open: personnelOpen
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
