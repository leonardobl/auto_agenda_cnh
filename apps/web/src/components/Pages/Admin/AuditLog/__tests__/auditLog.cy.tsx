import AuditLog from '..'

describe('AuditLog (Administrador)', () => {
  it('Deve renderizar o título "Auditoria"', () => {
    cy.mount(<AuditLog />)
    cy.contains('h1', 'Auditoria').should('be.visible')
  })
})
