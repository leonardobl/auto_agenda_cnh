import Home from '..'

describe('Home (Instrutor)', () => {
  it('Deve renderizar o título "Início"', () => {
    cy.mount(<Home />)
    cy.contains('h1', 'Início').should('be.visible')
  })
})
