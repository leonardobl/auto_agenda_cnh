import History from '..'

describe('History (Aluno)', () => {
  it('Deve renderizar o título "Histórico"', () => {
    cy.mount(<History />)
    cy.contains('h1', 'Histórico').should('be.visible')
  })
})
