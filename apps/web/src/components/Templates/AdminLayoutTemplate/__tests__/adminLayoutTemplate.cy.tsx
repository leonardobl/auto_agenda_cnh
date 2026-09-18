import AdminLayoutTemplate from '..'

describe('AdminLayoutTemplate', () => {
  it('Deve renderizar todos os itens de navegação do administrador', () => {
    cy.mount(<AdminLayoutTemplate />)

    cy.get('nav[aria-label="Navegação do administrador"]').within(() => {
      cy.contains('a', 'Início').should('be.visible')
      cy.contains('a', 'Agenda').should('be.visible')
      cy.contains('a', 'Alunos').should('be.visible')
      cy.contains('a', 'Instrutores').should('be.visible')
      cy.contains('a', 'Veículos').should('be.visible')
      cy.contains('a', 'Configurações').should('be.visible')
      cy.contains('a', 'Auditoria').should('be.visible')
      cy.contains('a', 'Relatórios').should('be.visible')
    })
  })

  it('Deve exibir o botão "Sair"', () => {
    cy.mount(<AdminLayoutTemplate />)
    cy.contains('button', 'Sair').should('be.visible')
  })

  it('Deve encerrar a sessão e limpar o token ao clicar em "Sair"', () => {
    cy.intercept('POST', '**/auth/logout', { statusCode: 204 }).as('logout')
    sessionStorage.setItem('authToken', 'fake-token')

    cy.mount(<AdminLayoutTemplate />)
    cy.contains('button', 'Sair').click()

    cy.wait('@logout')
    cy.window()
      .its('sessionStorage')
      .invoke('getItem', 'authToken')
      .should('be.null')
  })
})
