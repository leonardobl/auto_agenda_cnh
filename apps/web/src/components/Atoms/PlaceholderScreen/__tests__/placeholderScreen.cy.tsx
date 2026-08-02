import PlaceholderScreen from '..'

describe('PlaceholderScreen', () => {
  it('Deve renderizar o título recebido', () => {
    cy.mount(<PlaceholderScreen title="Início" />)
    cy.contains('h1', 'Início').should('be.visible')
  })

  it('Deve renderizar o texto "Em construção."', () => {
    cy.mount(<PlaceholderScreen title="Início" />)
    cy.contains('Em construção.').should('be.visible')
  })
})
