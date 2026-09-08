import InstructorLayoutTemplate from '..'

describe('InstructorLayoutTemplate', () => {
  it('Deve renderizar todos os itens de navegação do instrutor', () => {
    cy.mount(<InstructorLayoutTemplate />)

    cy.get('nav[aria-label="Navegação do instrutor"]').within(() => {
      cy.contains('a', 'Início').should('be.visible')
      cy.contains('a', 'Minha agenda').should('be.visible')
      cy.contains('a', 'Disponibilidade').should('be.visible')
      cy.contains('a', 'Perfil').should('be.visible')
    })
  })

  it('Deve exibir o botão "Sair"', () => {
    cy.mount(<InstructorLayoutTemplate />)
    cy.contains('button', 'Sair').should('be.visible')
  })

  it('Deve encerrar a sessão e limpar o token ao clicar em "Sair"', () => {
    cy.intercept('POST', '**/auth/logout', { statusCode: 204 }).as('logout')
    sessionStorage.setItem('authToken', 'fake-token')

    cy.mount(<InstructorLayoutTemplate />)
    cy.contains('button', 'Sair').click()

    cy.wait('@logout')
    cy.window()
      .its('sessionStorage')
      .invoke('getItem', 'authToken')
      .should('be.null')
  })
})
