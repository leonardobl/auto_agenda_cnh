import AuditLog from '..'

describe('AuditLog (Administrador)', () => {
  it('Deve renderizar o título "Auditoria"', () => {
    cy.mount(<AuditLog />)
    cy.contains('h1', 'Auditoria').should('be.visible')
  })

  it('Deve exibir eventos de exemplo na tabela', () => {
    cy.mount(<AuditLog />)

    cy.contains('Aluno cadastrado').should('be.visible')
    cy.contains('Ana Beatriz Souza').should('be.visible')
    cy.contains('admin@autoagenda.local').should('be.visible')
  })
})
