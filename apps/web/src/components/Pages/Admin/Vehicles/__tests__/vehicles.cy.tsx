import Vehicles from '..'

describe('Vehicles (Administrador)', () => {
  it('Deve renderizar o título "Veículos"', () => {
    cy.mount(<Vehicles />)
    cy.contains('h1', 'Veículos').should('be.visible')
  })
})
