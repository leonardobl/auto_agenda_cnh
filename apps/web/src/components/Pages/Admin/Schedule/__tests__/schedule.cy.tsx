import Schedule from '..'

const STUDENTS = [
  {
    id: 'student-1',
    user_id: null,
    full_name: 'Ana Teste',
    document: null,
    phone: '(11) 90000-0000',
    birth_date: null,
    category_id: 'cat-b',
    status: 'ACTIVE',
    created_at: '2026-01-01 00:00:00',
    updated_at: '2026-01-01 00:00:00',
  },
]

const CATEGORIES = [
  { id: 'cat-a', code: 'A', name: 'Motocicletas' },
  { id: 'cat-b', code: 'B', name: 'Automóveis' },
]

const APPOINTMENTS = [
  {
    id: 'appointment-1',
    student_id: 'student-1',
    instructor_id: 'instructor-1',
    vehicle_id: 'vehicle-1',
    category_id: 'cat-b',
    start_at: '2026-01-05T10:00:00.000Z',
    end_at: '2026-01-05T10:50:00.000Z',
    status: 'AGENDADA',
    cancellation_reason: null,
    notes: null,
    created_by: 'admin-1',
    created_at: '2026-01-01 00:00:00',
    updated_at: '2026-01-01 00:00:00',
    student_full_name: 'Ana Teste',
    instructor_full_name: 'Fábio Instrutor',
    vehicle_plate: 'ABC1D23',
  },
]

describe('Schedule (Administrador)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/students*', {
      statusCode: 200,
      body: { items: STUDENTS, page: 1, pageSize: 100, total: 1 },
    }).as('listStudents')
    cy.intercept('GET', '**/license-categories', { statusCode: 200, body: CATEGORIES }).as('categories')
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: { items: APPOINTMENTS, page: 1, pageSize: 10, total: 1 },
    }).as('listAppointments')
  })

  it('Deve renderizar o título "Agenda"', () => {
    cy.mount(<Schedule />)
    cy.contains('h1', 'Agenda').should('be.visible')
  })

  it('Deve listar as aulas já agendadas', () => {
    cy.mount(<Schedule />)

    cy.wait('@listAppointments')
    cy.contains('Ana Teste').should('be.visible')
    cy.contains('Fábio Instrutor').should('be.visible')
    cy.contains('ABC1D23').should('be.visible')
  })

  it('Deve buscar e reservar um horário disponível', () => {
    cy.intercept('GET', '**/availability/slots*', {
      statusCode: 200,
      body: {
        items: [
          {
            startAt: '2026-01-06T10:00:00.000Z',
            endAt: '2026-01-06T10:50:00.000Z',
            instructorId: 'instructor-1',
            instructorName: 'Fábio Instrutor',
            vehicleId: 'vehicle-1',
            vehiclePlate: 'ABC1D23',
          },
        ],
      },
    }).as('searchSlots')
    cy.intercept('POST', '**/appointments', {
      statusCode: 201,
      body: { ...APPOINTMENTS[0], id: 'appointment-2', start_at: '2026-01-06T10:00:00.000Z' },
    }).as('createAppointment')

    cy.mount(<Schedule />)
    cy.wait('@listStudents')

    cy.get('#studentId').select('Ana Teste')
    cy.contains('button', 'Buscar horários').click()

    cy.wait('@searchSlots')
    cy.contains('Reservar').should('be.visible')
    cy.contains('button', 'Reservar').click()

    cy.wait('@createAppointment')
  })

  it('Deve exibir mensagem quando a busca não encontra horários', () => {
    cy.intercept('GET', '**/availability/slots*', { statusCode: 200, body: { items: [] } }).as(
      'searchSlotsEmpty',
    )

    cy.mount(<Schedule />)
    cy.wait('@listStudents')

    cy.get('#studentId').select('Ana Teste')
    cy.contains('button', 'Buscar horários').click()

    cy.wait('@searchSlotsEmpty')
    cy.contains('Nenhum horário disponível para os filtros informados.').should('be.visible')
  })
})
