import Home from '..'

describe('Home (Aluno)', () => {
  it('Deve renderizar o título "Início"', () => {
    cy.mount(<Home />)
    cy.contains('h1', 'Início').should('be.visible')
  })
})
