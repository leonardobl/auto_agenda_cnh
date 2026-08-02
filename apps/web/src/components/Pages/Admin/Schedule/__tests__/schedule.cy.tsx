import Schedule from '..'

describe('Schedule (Administrador)', () => {
  it('Deve renderizar o título "Agenda"', () => {
    cy.mount(<Schedule />)
    cy.contains('h1', 'Agenda').should('be.visible')
  })
})
