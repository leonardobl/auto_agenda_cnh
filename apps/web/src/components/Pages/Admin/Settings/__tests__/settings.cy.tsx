import Settings from '..'

describe('Settings (Administrador)', () => {
  it('Deve renderizar o título "Configurações"', () => {
    cy.mount(<Settings />)
    cy.contains('h1', 'Configurações').should('be.visible')
  })
})
