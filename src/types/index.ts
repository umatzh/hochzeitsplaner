// ===== EVENT TYPES (EBENE 1) =====
export const EventType = {
  WEDDING: 'WEDDING',
  BIRTHDAY: 'BIRTHDAY',
  CORPORATE: 'CORPORATE',
  PARTY: 'PARTY',
  UNIVERSITY: 'UNIVERSITY',
  WEDDING_SERIES: 'WEDDING_SERIES',
  SPORTS: 'SPORTS',
  FESTIVAL: 'FESTIVAL',
  WEDDING_PLANNER: 'WEDDING_PLANNER',
  CUSTOM: 'CUSTOM'
} as const
export type EventType = typeof EventType[keyof typeof EventType]

export const EventTypeLabels: Record<string, string> = {
  WEDDING: 'Hochzeit',
  BIRTHDAY: 'Geburtstag',
  CORPORATE: 'Firmenevent',
  PARTY: 'Party / Feier',
  UNIVERSITY: 'Hochschul-Event',
  WEDDING_SERIES: 'Hochzeits-Serie',
  SPORTS: 'Sportevent',
  FESTIVAL: 'Festival',
  WEDDING_PLANNER: 'Wedding Planner',
  CUSTOM: 'Eigenes Event'
}

// ===== SUB-EVENT TYPES (EBENE 2) =====
export const EventItemType = {
  MAIN_EVENT: 'MAIN_EVENT',
  CIVIL_CEREMONY: 'CIVIL_CEREMONY',
  PARTY: 'PARTY',
  BRUNCH: 'BRUNCH',
  MEETING: 'MEETING',
  CONFERENCE: 'CONFERENCE',
  TEAM_BUILDING: 'TEAM_BUILDING',
  DINNER: 'DINNER',
  BACHELOR_PARTY: 'BACHELOR_PARTY',
  REHEARSAL: 'REHEARSAL',
  RECEPTION: 'RECEPTION',
  CUSTOM: 'CUSTOM'
} as const
export type EventItemType = typeof EventItemType[keyof typeof EventItemType]

export const EventItemTypeLabels: Record<string, string> = {
  MAIN_EVENT: 'Hauptevent',
  CIVIL_CEREMONY: 'Standesamt',
  PARTY: 'Party / Feier',
  BRUNCH: 'Brunch',
  MEETING: 'Meeting',
  CONFERENCE: 'Konferenz',
  TEAM_BUILDING: 'Team-Building',
  DINNER: 'Dinner',
  BACHELOR_PARTY: 'Polterabend',
  REHEARSAL: 'Probe',
  RECEPTION: 'Empfang',
  CUSTOM: 'Sonstiges'
}

export const EventItemStatus = {
  PLANNING: 'PLANNING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const
export type EventItemStatus = typeof EventItemStatus[keyof typeof EventItemStatus]

export const EventItemStatusLabels: Record<string, string> = {
  PLANNING: 'In Planung',
  CONFIRMED: 'Bestätigt',
  COMPLETED: 'Abgeschlossen',
  CANCELLED: 'Abgesagt'
}

// ===== MODULE NAMES (EBENE 3) =====
export const ModuleName = {
  DASHBOARD: 'dashboard',
  GUESTS: 'guests',
  BUDGET: 'budget',
  OFFERS: 'offers',
  TODOS: 'todos',
  SHOPPING: 'shopping',
  TIMELINE: 'timeline',
  CONTACTS: 'contacts',
  MENU: 'menu',
  PERSONNEL: 'personnel',
  SHIFTS: 'shifts',
  PAYROLL: 'payroll',
  TASKS: 'tasks'
} as const
export type ModuleName = typeof ModuleName[keyof typeof ModuleName]

export const ModuleLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  guests: 'Gästeliste',
  budget: 'Budget',
  offers: 'Offerten',
  todos: 'ToDo-Liste',
  shopping: 'Einkaufsliste',
  timeline: 'Zeitplan',
  contacts: 'Kontakte',
  menu: 'Menüplanung',
  personnel: 'Personal',
  shifts: 'Einsatzplanung',
  payroll: 'Stundenabrechnung',
  tasks: 'Aufgabenverteilung'
}

// ===== SMART MODULE TEMPLATES =====
export const ModuleTemplates: Record<string, string[]> = {
  // Wedding sub-events
  'WEDDING_MAIN_EVENT': ['dashboard', 'guests', 'budget', 'offers', 'todos', 'shopping', 'timeline', 'contacts', 'menu', 'personnel', 'shifts', 'payroll', 'tasks'],
  'WEDDING_CIVIL_CEREMONY': ['guests', 'timeline', 'contacts', 'todos'],
  'WEDDING_BACHELOR_PARTY': ['guests', 'budget', 'shopping', 'timeline', 'todos'],
  'WEDDING_BRUNCH': ['guests', 'menu', 'shopping', 'timeline'],
  'WEDDING_RECEPTION': ['guests', 'timeline', 'contacts', 'menu'],

  // Birthday sub-events
  'BIRTHDAY_MAIN_EVENT': ['dashboard', 'guests', 'budget', 'todos', 'shopping', 'timeline', 'menu'],
  'BIRTHDAY_PARTY': ['guests', 'budget', 'shopping', 'timeline', 'menu'],

  // Corporate sub-events
  'CORPORATE_CONFERENCE': ['guests', 'budget', 'timeline', 'contacts', 'todos', 'personnel'],
  'CORPORATE_TEAM_BUILDING': ['guests', 'budget', 'timeline', 'contacts', 'todos'],
  'CORPORATE_DINNER': ['guests', 'budget', 'menu', 'timeline', 'contacts'],
  'CORPORATE_MEETING': ['guests', 'timeline', 'contacts', 'todos'],

  // Party sub-events
  'PARTY_MAIN_EVENT': ['dashboard', 'guests', 'budget', 'shopping', 'timeline', 'menu', 'personnel'],
  'PARTY_PARTY': ['guests', 'budget', 'shopping', 'timeline', 'menu'],

  // Default
  'DEFAULT': ['dashboard', 'guests', 'budget', 'todos', 'timeline', 'contacts']
}

// Get default modules for a sub-event based on parent event type and sub-event type
export function getDefaultModules(eventType: string, itemType: string): string[] {
  const key = `${eventType}_${itemType}`
  return ModuleTemplates[key] || ModuleTemplates['DEFAULT']
}

// ===== EVENT SHARE ROLES =====
export const EventShareRole = {
  ADMIN: 'ADMIN',
  ORGANIZER: 'ORGANIZER',
  HELPER: 'HELPER',
  VIEWER: 'VIEWER'
} as const
export type EventShareRole = typeof EventShareRole[keyof typeof EventShareRole]

export const EventShareRoleLabels: Record<string, string> = {
  ADMIN: 'Administrator',
  ORGANIZER: 'Organisator',
  HELPER: 'Helfer',
  VIEWER: 'Betrachter'
}

// ===== USER ROLES =====
export const UserRole = {
  ADMIN: 'ADMIN',
  PLANNER: 'PLANNER',
  GUEST_VIEW: 'GUEST_VIEW'
} as const
export type UserRole = typeof UserRole[keyof typeof UserRole]

// ===== GUEST ENUMS =====
export const GuestPriority = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
} as const
export type GuestPriority = typeof GuestPriority[keyof typeof GuestPriority]

export const InvitationStatus = {
  NOT_SENT: 'NOT_SENT',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED'
} as const
export type InvitationStatus = typeof InvitationStatus[keyof typeof InvitationStatus]

export const RsvpStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  DECLINED: 'DECLINED'
} as const
export type RsvpStatus = typeof RsvpStatus[keyof typeof RsvpStatus]

export const MenuType = {
  REGULAR: 'REGULAR',
  VEGETARIAN: 'VEGETARIAN',
  VEGAN: 'VEGAN',
  CHILD: 'CHILD',
  SPECIAL: 'SPECIAL'
} as const
export type MenuType = typeof MenuType[keyof typeof MenuType]

// ===== BUDGET ENUMS =====
export const BudgetCategory = {
  CATERING: 'CATERING',
  DRINKS: 'DRINKS',
  DECORATION: 'DECORATION',
  EQUIPMENT: 'EQUIPMENT',
  LOCATION: 'LOCATION',
  PERSONNEL: 'PERSONNEL',
  OTHER: 'OTHER'
} as const
export type BudgetCategory = typeof BudgetCategory[keyof typeof BudgetCategory]

// ===== OFFER ENUMS =====
export const OfferStatus = {
  OPEN: 'OPEN',
  REQUESTED: 'REQUESTED',
  RECEIVED: 'RECEIVED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
} as const
export type OfferStatus = typeof OfferStatus[keyof typeof OfferStatus]

// ===== TODO ENUMS =====
export const TodoCategory = {
  LOCATION: 'LOCATION',
  INVITATION: 'INVITATION',
  CATERING: 'CATERING',
  SHOPPING: 'SHOPPING',
  DECORATION: 'DECORATION',
  PLANNING: 'PLANNING',
  PERSONNEL: 'PERSONNEL',
  LOGISTICS: 'LOGISTICS',
  FOLLOWUP: 'FOLLOWUP'
} as const
export type TodoCategory = typeof TodoCategory[keyof typeof TodoCategory]

export const TodoStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
} as const
export type TodoStatus = typeof TodoStatus[keyof typeof TodoStatus]

export const TodoPriority = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
} as const
export type TodoPriority = typeof TodoPriority[keyof typeof TodoPriority]

// ===== TIMELINE ENUMS =====
export const TimelineStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED'
} as const
export type TimelineStatus = typeof TimelineStatus[keyof typeof TimelineStatus]

// ===== MENU ENUMS =====
export const MenuCourse = {
  APERO: 'APERO',
  STARTER: 'STARTER',
  MAIN: 'MAIN',
  DESSERT: 'DESSERT',
  DRINKS: 'DRINKS'
} as const
export type MenuCourse = typeof MenuCourse[keyof typeof MenuCourse]

// ===== PERSONNEL ENUMS =====
export const PersonnelRole = {
  SETUP: 'SETUP',
  SERVICE: 'SERVICE',
  KITCHEN: 'KITCHEN',
  BAR: 'BAR',
  TEARDOWN: 'TEARDOWN',
  COORDINATION: 'COORDINATION',
  OTHER: 'OTHER'
} as const
export type PersonnelRole = typeof PersonnelRole[keyof typeof PersonnelRole]

// ===== TASK ENUMS =====
export const TaskArea = {
  PREPARATION: 'PREPARATION',
  SETUP: 'SETUP',
  KITCHEN: 'KITCHEN',
  SERVICE: 'SERVICE',
  BAR: 'BAR',
  COORDINATION: 'COORDINATION',
  TEARDOWN: 'TEARDOWN'
} as const
export type TaskArea = typeof TaskArea[keyof typeof TaskArea]

export const TaskAssignmentStatus = {
  OPEN: 'OPEN',
  COMPLETED: 'COMPLETED'
} as const
export type TaskAssignmentStatus = typeof TaskAssignmentStatus[keyof typeof TaskAssignmentStatus]

// ===== STORES =====
export const Stores = [
  'IKEA',
  'Amazon',
  'Top CC',
  'Metzger',
  'Markt',
  'Getränkehandel',
  'Sonstiges'
] as const
export type Store = typeof Stores[number]

// ===== LABELS (German) =====
export const BudgetCategoryLabels: Record<string, string> = {
  CATERING: 'Catering',
  DRINKS: 'Getränke',
  DECORATION: 'Deko',
  EQUIPMENT: 'Ausstattung',
  LOCATION: 'Location',
  PERSONNEL: 'Personal',
  OTHER: 'Sonstiges'
}

export const RsvpStatusLabels: Record<string, string> = {
  PENDING: 'Offen',
  CONFIRMED: 'Zugesagt',
  DECLINED: 'Abgesagt'
}

export const TodoStatusLabels: Record<string, string> = {
  OPEN: 'Offen',
  IN_PROGRESS: 'In Arbeit',
  COMPLETED: 'Erledigt'
}

export const PriorityLabels: Record<string, string> = {
  HIGH: 'Hoch',
  MEDIUM: 'Mittel',
  LOW: 'Niedrig'
}

export const PersonnelRoleLabels: Record<string, string> = {
  SETUP: 'Aufbau',
  SERVICE: 'Service',
  KITCHEN: 'Küche',
  BAR: 'Bar',
  TEARDOWN: 'Abbau',
  COORDINATION: 'Koordination',
  OTHER: 'Sonstiges'
}

export const TaskAreaLabels: Record<string, string> = {
  PREPARATION: 'Vorbereitung',
  SETUP: 'Aufbau',
  KITCHEN: 'Küche',
  SERVICE: 'Service',
  BAR: 'Bar',
  COORDINATION: 'Koordination',
  TEARDOWN: 'Abbau'
}

export const MenuCourseLabels: Record<string, string> = {
  APERO: 'Apéro',
  STARTER: 'Vorspeise',
  MAIN: 'Hauptgang',
  DESSERT: 'Dessert',
  DRINKS: 'Getränke'
}

export const OfferStatusLabels: Record<string, string> = {
  OPEN: 'Offen',
  REQUESTED: 'Angefragt',
  RECEIVED: 'Erhalten',
  ACCEPTED: 'Akzeptiert',
  REJECTED: 'Abgelehnt'
}

// ===== DASHBOARD STATISTICS =====
export interface DashboardStats {
  daysUntilEvent: number
  guests: {
    total: number
    confirmed: number
    declined: number
    pending: number
  }
  budget: {
    total: number
    planned: number
    paid: number
    open: number
    remaining: number
  }
  todos: {
    open: number
    inProgress: number
    completed: number
  }
  personnel: {
    planned: number
    paid: number
    open: number
  }
}
