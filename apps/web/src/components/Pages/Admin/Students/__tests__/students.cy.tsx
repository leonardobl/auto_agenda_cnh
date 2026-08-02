import Students from '..'

describe('Students (Administrador)', () => {
  it('Deve renderizar o título "Alunos"', () => {
    cy.mount(<Students />)
    cy.contains('h1', 'Alunos').should('be.visible')
  })
})
