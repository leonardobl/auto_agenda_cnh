import MySchedule from '..'

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

describe('MySchedule (Instrutor)', () => {
  it('Deve renderizar o título "Minha agenda"', () => {
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: { items: [], page: 1, pageSize: 10, total: 0 },
    }).as('listAppointments')

    cy.mount(<MySchedule />)
    cy.contains('h1', 'Minha agenda').should('be.visible')
  })

  it('Deve listar apenas as próprias aulas retornadas pela API', () => {
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: { items: APPOINTMENTS, page: 1, pageSize: 10, total: 1 },
    }).as('listAppointments')

    cy.mount(<MySchedule />)

    cy.wait('@listAppointments')
    cy.contains('Ana Teste').should('be.visible')
    cy.contains('ABC1D23').should('be.visible')
    cy.contains('AGENDADA').should('be.visible')
  })

  it('Deve exibir mensagem quando não há aulas agendadas', () => {
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: { items: [], page: 1, pageSize: 10, total: 0 },
    }).as('listAppointmentsEmpty')

    cy.mount(<MySchedule />)

    cy.wait('@listAppointmentsEmpty')
    cy.contains('Nenhuma aula agendada.').should('be.visible')
  })
})
