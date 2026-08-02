import Instructors from '..'

describe('Instructors (Administrador)', () => {
  it('Deve renderizar o título "Instrutores"', () => {
    cy.mount(<Instructors />)
    cy.contains('h1', 'Instrutores').should('be.visible')
  })
})
