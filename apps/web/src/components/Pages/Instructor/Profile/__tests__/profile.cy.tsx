import Profile from '..'

describe('Profile (Instrutor)', () => {
  it('Deve renderizar o título "Perfil"', () => {
    cy.mount(<Profile />)
    cy.contains('h1', 'Perfil').should('be.visible')
  })
})
