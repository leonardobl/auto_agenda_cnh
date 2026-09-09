import ScheduleClass from '..'

describe('ScheduleClass (Aluno)', () => {
  it('Deve renderizar o título "Agendar aula"', () => {
    cy.mount(<ScheduleClass />)
    cy.contains('h1', 'Agendar aula').should('be.visible')
  })

  it('Deve buscar e reservar um horário disponível sem informar aluno ou categoria', () => {
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
      body: { id: 'appointment-1', start_at: '2026-01-06T10:00:00.000Z' },
    }).as('createAppointment')

    cy.mount(<ScheduleClass />)

    cy.contains('button', 'Buscar horários').click()

    cy.wait('@searchSlots')
      .its('request.url')
      .should('not.include', 'studentId')
      .and('not.include', 'categoryId')

    cy.contains('button', 'Reservar').click()

    cy.wait('@createAppointment')
      .its('request.body')
      .should('not.have.property', 'studentId')
  })

  it('Deve exibir mensagem quando a busca não encontra horários', () => {
    cy.intercept('GET', '**/availability/slots*', { statusCode: 200, body: { items: [] } }).as(
      'searchSlotsEmpty',
    )

    cy.mount(<ScheduleClass />)

    cy.contains('button', 'Buscar horários').click()

    cy.wait('@searchSlotsEmpty')
    cy.contains('Nenhum horário disponível para os filtros informados.').should('be.visible')
  })
})
