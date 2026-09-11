import Availability from '..'

const INSTRUCTOR = {
  id: 'instructor-1',
  user_id: 'user-1',
  full_name: 'Fábio Ramos Teixeira',
  document: '98765432101',
  credential_number: 'CRED-0001',
  phone: '(11) 93456-7801',
  status: 'ACTIVE',
  created_at: '2026-01-01 00:00:00',
  updated_at: '2026-01-01 00:00:00',
  email: 'instrutor1@autoagenda.local',
}

function mountReady() {
  cy.intercept('GET', '**/instructors/me', { statusCode: 200, body: INSTRUCTOR }).as('getMe')
  cy.intercept('GET', '**/instructors/instructor-1/availability', {
    statusCode: 200,
    body: { items: [] },
  }).as('listAvailability')
  cy.intercept('GET', '**/instructors/instructor-1/blocks', {
    statusCode: 200,
    body: { items: [] },
  }).as('listBlocks')

  cy.mount(<Availability />)
  cy.wait(['@getMe', '@listAvailability', '@listBlocks'])
}

describe('Availability (Instrutor)', () => {
  it('Deve renderizar o título "Disponibilidade"', () => {
    mountReady()
    cy.contains('h1', 'Disponibilidade').should('be.visible')
  })

  it('Deve listar as janelas de disponibilidade existentes', () => {
    cy.intercept('GET', '**/instructors/me', { statusCode: 200, body: INSTRUCTOR }).as('getMe')
    cy.intercept('GET', '**/instructors/instructor-1/availability', {
      statusCode: 200,
      body: { items: [{ id: 'window-1', instructor_id: 'instructor-1', weekday: 1, start_time: '08:00', end_time: '18:00', active: 1, created_at: '2026-01-01 00:00:00' }] },
    }).as('listAvailability')
    cy.intercept('GET', '**/instructors/instructor-1/blocks', { statusCode: 200, body: { items: [] } }).as(
      'listBlocks',
    )

    cy.mount(<Availability />)
    cy.wait(['@getMe', '@listAvailability', '@listBlocks'])

    cy.contains('Segunda, 08:00 às 18:00').should('be.visible')
  })

  it('Deve adicionar uma nova janela de disponibilidade', () => {
    mountReady()
    cy.intercept('POST', '**/instructors/instructor-1/availability', {
      statusCode: 201,
      body: { id: 'window-2', instructor_id: 'instructor-1', weekday: 2, start_time: '09:00', end_time: '12:00', active: 1, created_at: '2026-01-01 00:00:00' },
    }).as('addAvailability')

    cy.get('#weekday').select('Terça')
    cy.get('#startTime').type('09:00')
    cy.get('#endTime').type('12:00')
    cy.contains('button', 'Adicionar').first().click()

    cy.wait('@addAvailability')
      .its('request.body')
      .should('deep.equal', { weekday: 2, startTime: '09:00', endTime: '12:00' })
  })

  it('Deve adicionar um novo bloqueio', () => {
    mountReady()
    cy.intercept('POST', '**/instructors/instructor-1/blocks', {
      statusCode: 201,
      body: {
        id: 'block-1',
        instructor_id: 'instructor-1',
        start_at: '2026-02-01T10:00:00.000Z',
        end_at: '2026-02-01T12:00:00.000Z',
        reason: 'Consulta médica',
        created_by: 'user-1',
        created_at: '2026-01-01 00:00:00',
      },
    }).as('addBlock')

    cy.get('#startAt').type('2026-02-01T07:00')
    cy.get('#endAt').type('2026-02-01T09:00')
    cy.get('#reason').type('Consulta médica')
    cy.contains('button', 'Adicionar').last().click()

    cy.wait('@addBlock')
      .its('request.body.reason')
      .should('equal', 'Consulta médica')
  })
})
