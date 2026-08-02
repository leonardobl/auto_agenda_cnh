import Home from '..'

describe('Home (Administrador)', () => {
  it('Deve renderizar o título "Início"', () => {
    cy.mount(<Home />)
    cy.contains('h1', 'Início').should('be.visible')
  })
})
