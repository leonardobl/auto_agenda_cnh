import Home from '..'

function mockCounts() {
  cy.intercept('GET', '**/students*', {
    statusCode: 200,
    body: { items: [], page: 1, pageSize: 1, total: 5 },
  }).as('students')
  cy.intercept('GET', '**/instructors*', {
    statusCode: 200,
    body: { items: [], page: 1, pageSize: 1, total: 2 },
  }).as('instructors')
  cy.intercept('GET', '**/vehicles*', {
    statusCode: 200,
    body: { items: [], page: 1, pageSize: 1, total: 3 },
  }).as('vehicles')
}

describe('Home (Administrador)', () => {
  it('Deve renderizar o título "Início"', () => {
    mockCounts()
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: { items: [], page: 1, pageSize: 5, total: 0 },
    }).as('appointments')

    cy.mount(<Home />)
    cy.contains('h1', 'Início').should('be.visible')
  })

  it('Deve exibir as contagens reais de alunos, instrutores, veículos e aulas agendadas', () => {
    mockCounts()
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: { items: [], page: 1, pageSize: 5, total: 4 },
    }).as('appointments')

    cy.mount(<Home />)
    cy.wait(['@students', '@instructors', '@vehicles', '@appointments'])

    cy.contains('5').should('be.visible')
    cy.contains('Alunos').should('be.visible')
    cy.contains('2').should('be.visible')
    cy.contains('Instrutores').should('be.visible')
    cy.contains('3').should('be.visible')
    cy.contains('Veículos').should('be.visible')
    cy.contains('4').should('be.visible')
    cy.contains('Aulas agendadas').should('be.visible')
  })

  it('Deve listar os próximos agendamentos futuros', () => {
    mockCounts()
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'appointment-1',
            student_id: 'student-1',
            instructor_id: 'instructor-1',
            vehicle_id: 'vehicle-1',
            category_id: 'cat-b',
            start_at: '2099-01-01T10:00:00.000Z',
            end_at: '2099-01-01T10:50:00.000Z',
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
        ],
        page: 1,
        pageSize: 5,
        total: 1,
      },
    }).as('appointments')

    cy.mount(<Home />)
    cy.wait('@appointments')

    cy.contains('Ana Teste').should('be.visible')
    cy.contains('Fábio Instrutor').should('be.visible')
  })

  it('Deve exibir mensagem quando não há agendamentos futuros', () => {
    mockCounts()
    cy.intercept('GET', '**/appointments*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 'appointment-1',
            student_id: 'student-1',
            instructor_id: 'instructor-1',
            vehicle_id: 'vehicle-1',
            category_id: 'cat-b',
            start_at: '2020-01-01T10:00:00.000Z',
            end_at: '2020-01-01T10:50:00.000Z',
            status: 'AGENDADA',
            cancellation_reason: null,
            notes: null,
            created_by: 'admin-1',
            created_at: '2020-01-01 00:00:00',
            updated_at: '2020-01-01 00:00:00',
            student_full_name: 'Ana Teste',
            instructor_full_name: 'Fábio Instrutor',
            vehicle_plate: 'ABC1D23',
          },
        ],
        page: 1,
        pageSize: 5,
        total: 1,
      },
    }).as('appointments')

    cy.mount(<Home />)
    cy.wait('@appointments')

    cy.contains('Nenhum agendamento futuro.').should('be.visible')
  })
})
