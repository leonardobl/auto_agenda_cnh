import Availability from '..'

describe('Availability (Instrutor)', () => {
  it('Deve renderizar o título "Disponibilidade"', () => {
    cy.mount(<Availability />)
    cy.contains('h1', 'Disponibilidade').should('be.visible')
  })
})
