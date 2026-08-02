import MySchedule from '..'

describe('MySchedule (Aluno)', () => {
  it('Deve renderizar o título "Minha agenda"', () => {
    cy.mount(<MySchedule />)
    cy.contains('h1', 'Minha agenda').should('be.visible')
  })
})
