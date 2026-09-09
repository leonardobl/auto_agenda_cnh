import History from '..'

function appointment(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'appointment-1',
    student_id: 'student-1',
    instructor_id: 'instructor-1',
    vehicle_id: 'vehicle-1',
    category_id: 'cat-b',
    start_at: '2020-01-05T10:00:00.000Z',
    end_at: '2020-01-05T10:50:00.000Z',
    status: 'AGENDADA',
    cancellation_reason: null,
    notes: null,
    created_by: 'admin-1',
    created_at: '2020-01-01 00:00:00',
    updated_at: '2020-01-01 00:00:00',
    student_full_name: 'Ana Teste',
    instructor_full_name: 'Fábio Instrutor',
    vehicle_plate: 'ABC1D23',
    ...overrides,
  }
}

describe('History (Aluno)', () => {
  it('Deve renderizar o título "Histórico"', () => {
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: { items: [], page: 1, pageSize: 50, total: 0 },
    }).as('listAppointments')

    cy.mount(<History />)
    cy.contains('h1', 'Histórico').should('be.visible')
  })

  it('Deve listar apenas as aulas passadas', () => {
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: {
        items: [
          appointment({ id: 'past', start_at: '2020-01-05T10:00:00.000Z' }),
          appointment({ id: 'future', start_at: '2099-01-05T10:00:00.000Z', instructor_full_name: 'Futuro' }),
        ],
        page: 1,
        pageSize: 50,
        total: 2,
      },
    }).as('listAppointments')

    cy.mount(<History />)

    cy.wait('@listAppointments')
    cy.contains('Fábio Instrutor').should('be.visible')
    cy.contains('Futuro').should('not.exist')
  })

  it('Deve exibir mensagem quando não há aulas anteriores', () => {
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: { items: [], page: 1, pageSize: 50, total: 0 },
    }).as('listAppointmentsEmpty')

    cy.mount(<History />)

    cy.wait('@listAppointmentsEmpty')
    cy.contains('Nenhuma aula anterior.').should('be.visible')
  })
})
