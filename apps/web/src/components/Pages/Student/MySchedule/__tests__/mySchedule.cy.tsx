import MySchedule from '..'

function appointment(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'appointment-1',
    student_id: 'student-1',
    instructor_id: 'instructor-1',
    vehicle_id: 'vehicle-1',
    category_id: 'cat-b',
    start_at: '2099-01-05T10:00:00.000Z',
    end_at: '2099-01-05T10:50:00.000Z',
    status: 'AGENDADA',
    cancellation_reason: null,
    notes: null,
    created_by: 'admin-1',
    created_at: '2026-01-01 00:00:00',
    updated_at: '2026-01-01 00:00:00',
    student_full_name: 'Ana Teste',
    instructor_full_name: 'Fábio Instrutor',
    vehicle_plate: 'ABC1D23',
    ...overrides,
  }
}

describe('MySchedule (Aluno)', () => {
  it('Deve renderizar o título "Minha agenda"', () => {
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: { items: [], page: 1, pageSize: 50, total: 0 },
    }).as('listAppointments')

    cy.mount(<MySchedule />)
    cy.contains('h1', 'Minha agenda').should('be.visible')
  })

  it('Deve listar apenas as aulas futuras', () => {
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: {
        items: [
          appointment({ id: 'future', start_at: '2099-01-05T10:00:00.000Z' }),
          appointment({ id: 'past', start_at: '2020-01-05T10:00:00.000Z', instructor_full_name: 'Antigo' }),
        ],
        page: 1,
        pageSize: 50,
        total: 2,
      },
    }).as('listAppointments')

    cy.mount(<MySchedule />)

    cy.wait('@listAppointments')
    cy.contains('Fábio Instrutor').should('be.visible')
    cy.contains('Antigo').should('not.exist')
  })

  it('Deve exibir mensagem quando não há aulas agendadas', () => {
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: { items: [], page: 1, pageSize: 50, total: 0 },
    }).as('listAppointmentsEmpty')

    cy.mount(<MySchedule />)

    cy.wait('@listAppointmentsEmpty')
    cy.contains('Nenhuma aula agendada.').should('be.visible')
  })
})
