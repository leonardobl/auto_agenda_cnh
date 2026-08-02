import AuthLayoutTemplate from '..'

describe('AuthLayoutTemplate', () => {
  it('Deve renderizar o nome do produto', () => {
    cy.mount(<AuthLayoutTemplate />)
    cy.contains('AutoAgenda').should('be.visible')
  })
})
