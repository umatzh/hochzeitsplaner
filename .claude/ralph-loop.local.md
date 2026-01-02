---
active: true
iteration: 1
max_iterations: 0
completion_promise: "3-Ebenen-Hierarchie vollständig implementiert: Event-Erstellen (Hochzeit/Geburtstag/Firmenevent/etc.) → Sub-Events erstellen (mehrere pro Event) → alle 13 Module unter jedem Sub-Event verfügbar, Smart Module-Selection, Gästelisten-Hierarchie, Budget-Hierarchie, alles getestet"
started_at: "2026-01-02T20:11:29Z"
---

Erweitere den Event-Planner um eine zusätzliche höhere Ebene. Neue Struktur: TOP-LEVEL EVENT (generisch) → SUB-EVENTS → MODULE.

3-EBENEN-HIERARCHIE IMPLEMENTIEREN:

EBENE 1: TOP-LEVEL EVENT (ÜBERGEORDNET)

Event-Typen (User wählt einen):
- Hochzeit
- Geburtstag
- Firmenevent (Konferenz, Team-Building)
- Party / Feier
- Hochschul-Event
- Hochzeits-Serie (Polterabend, Standesamt, Feier, Brunch)
- Sportevent
- Festival
- Wedding Planner (Master für mehrere Hochzeits-Serien)
- Custom Event (User-definiert)

Event-Verwaltung (Top-Level):
- Event erstellen: Name, Typ, Datum, Location, Beschreibung
- Event-Übersicht: Alle erstellten Events
- Event-Details: Kurze Zusammenfassung
- Button: 'Sub-Events hinzufügen' oder direkt zu Sub-Events navigieren

Beispiele:
- Event: 'Hochzeit 2025 - Max & Maria'
- Event: 'Geburtstag 50. - Hans'
- Event: 'Firmenevent - Jahreskonferenz 2025'
- Event: 'Party - Silvester'

EBENE 2: SUB-EVENTS (UNTER JEDEM TOP-LEVEL EVENT)

Pro Event können mehrere Sub-Events erstellt werden:

Hochzeit-Event Sub-Events:
- Polterabend (3. Juni)
- Standesamt (5. Juni, 10:00)
- Hochzeitsfeier (5. Juni, 17:00)
- Brunch (6. Juni)

Geburtstag-Event Sub-Events:
- Vorbereitungs-Treffen
- Hauptfeier
- Brunch danach

Firmenevent Sub-Events:
- Konferenz Tag 1
- Konferenz Tag 2
- Team-Dinner
- Team-Building Aktivität

Sub-Event erstellen:
- Name (z.B. 'Hochzeitsfeier')
- Typ (Dropdown: Standard, Standesamt, Catering, Party, Meetings, etc.)
- Datum & Uhrzeit
- Location
- Budget
- Geplante Gäste
- Status
- Notizen

Sub-Event-Details:
- Übersicht: Wann, wo, Budget, Gäste
- Actions: Module öffnen, Bearbeiten, Löschen
- Timeline: Alle Sub-Events chronologisch

EBENE 3: MODULE PRO SUB-EVENT

Unter jedem Sub-Event: ALLE FUNKTIONEN verfügbar!

Standard-Module (je nach Event-Typ adaptiert):
1. Dashboard (Event-spezifisch)
2. Gästeliste
3. Budget
4. Offerten
5. Todo-Liste
6. Einkaufsliste
7. Zeitplan
8. Kontakte
9. Menüplanung
10. Personal
11. Einsatzplanung
12. Stundenabrechnung
13. Aufgabenverteilung

Module sind SMART & ADAPTIV:
- Hochzeitsfeier: Alle 13 Module
- Standesamt: Nur Gästeliste, Zeitplan, Kontakte, Todo
- Firmenevent-Konferenz: Gästeliste, Zeitplan, Agenda, Personal, Todo, Budget
- Party: Budget, Gästeliste, Einkaufsliste, Zeitplan, Personal
- Brunch: Gästeliste, Menüplanung, Einkaufsliste, Zeitplan

DATABASE SCHEMA:

NEW Tables:
- events (Top-Level)
  * id, name, event_type, main_date, location, description, owner_id, created_at
  
- event_items (Sub-Events)
  * id, event_id, name, type, date, time, location, budget, guest_count, status, created_at

- event_modules (Welche Module sind aktiv pro Sub-Event)
  * id, event_item_id, module_name, is_active, settings

Updated Tables:
- Alle bisherigen Tables mit: event_item_id FK

Beispiel für Hochzeits-Event:
events (1 Row):
- id: ev-001
- name: 'Hochzeit 2025 - Max & Maria'
- event_type: 'Hochzeit'
- main_date: 2025-06-05
- location: 'Zürich'

event_items (4 Rows):
- id: ei-001, event_id: ev-001, name: 'Polterabend', date: 2025-06-03
- id: ei-002, event_id: ev-001, name: 'Standesamt', date: 2025-06-05
- id: ei-003, event_id: ev-001, name: 'Hochzeitsfeier', date: 2025-06-05
- id: ei-004, event_id: ev-001, name: 'Brunch', date: 2025-06-06

event_modules (zB für Standesamt):
- id: em-001, event_item_id: ei-002, module_name: 'guests', is_active: true
- id: em-002, event_item_id: ei-002, module_name: 'timeline', is_active: true
- id: em-003, event_item_id: ei-002, module_name: 'contacts', is_active: true
- id: em-004, event_item_id: ei-002, module_name: 'todos', is_active: true
- id: em-005, event_item_id: ei-002, module_name: 'budget', is_active: false

UI NAVIGATION STRUKTUR:

Home-Page:
- 'Neues Event erstellen' Button
- Übersicht aller Events (Karten):
  * [Event-Name] [Typ] [Datum] [Anzahl Sub-Events]
  * Klick: Zu Event-Details

Event-Details Page (nach Event-Auswahl):
- Event-Info (oben): Name, Typ, Hauptdatum, Gäste-Total, Budget-Total
- Sub-Events List (links oder oben Tabs):
  * Polterabend [3.6.]
  * Standesamt [5.6., 10:00]
  * Hochzeitsfeier [5.6., 17:00]
  * Brunch [6.6.]
  * '+' Button: Neues Sub-Event
- Sub-Event-Details (Mitte):
  * Übersicht: Wann, wo, Budget, Gäste
  * Module-Navigation (Tabs oder Sidebar):
    - Dashboard
    - Gästeliste
    - Budget
    - Offerten
    - Todo
    - Einkaufsliste
    - Zeitplan
    - Kontakte
    - Menüplanung
    - Personal
    - Einsatzplanung
    - Stundenabrechnung
    - Aufgabenverteilung

SMART MODULE SELECTION:

Bei Sub-Event Erstellung:
- System schlägt basierend auf Event-Typ vor welche Module relevant sind
- User kann Module aktivieren/deaktivieren
- Z.B. Standesamt: Nur 4 Module aktiv, nicht alle 13

Module-Templates pro Event-Typ:
- Hochzeit/Hochzeitsfeier: All 13 modules
- Hochzeit/Standesamt: Gästeliste, Zeitplan, Kontakte, Todo
- Hochzeit/Brunch: Gästeliste, Menü, Einkauf, Zeitplan
- Firmenevent/Konferenz: Gästeliste, Agenda/Zeitplan, Kontakte, Todo, Personal
- Party: Gästeliste, Einkauf, Budget, Zeitplan, Personal
- Geburtstag: Gästeliste, Budget, Zeitplan, Todo, Einkauf

ÜBERGEORDNETE FEATURES:

1) DASHBOARD-HIERARCHIE:
   - Top-Event Dashboard: Alle Sub-Events überblick, Total Budget, Total Gäste, Timeline
   - Sub-Event Dashboard: Event-spezifisches Dashboard (wie vorher)

2) GÄSTELISTEN:
   - Master-Liste (Top-Event Level): Alle möglichen Gäste
   - Pro Sub-Event: Welche Gäste sind eingeladen + RSVP pro Sub-Event

3) BUDGET-HIERARCHIE:
   - Top-Event: Total Budget über alle Sub-Events
   - Pro Sub-Event: Event-spezifisches Budget
   - Automatische Summation

4) REPORTS & EXPORTS:
   - Top-Event Report: Gesamt-Übersicht
   - Pro Sub-Event: Detaillierte Reports
   - Alle als PDF/CSV

5) SHARING & ROLLEN:
   - Admin: Alle Events
   - Organizer: Einzelne Events
   - Guest: Nur Gästelisten-View
   - Helper: Nur zugewiesene Sub-Events sehen

TESTING:

- Test Hochzeit-Event: Erstelle Event mit 4 Sub-Events
- Test Geburtstag-Event: Erstelle Event mit 2 Sub-Events
- Test Firmenevent: Erstelle Event mit 5 Sub-Events
- Test Module-Selection: Richtige Module pro Event-Typ aktiv?
- Test Gästelisten: Master-Liste + RSVP pro Sub-Event
- Test Budget: Hierarchie-Summation korrekt?
- Test Navigation: Smooth zwischen Event-Ebenen
- Test Mobile: Responsive auf allen Ebenen
- Test Exports: Pro Event + Sub-Event funktioniert

COMPLETION: 3-Ebenen-Hierarchie komplett implementiert - Top-Event → Sub-Events → Module, Smart Module-Selection, Gästelisten-Hierarchie, Budget-Hierarchie, alles getestet und produktionsreif.
