import { toast } from 'react-toastify'
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
    })
  })

  it('Deve exibir o botão "Sair"', () => {
    cy.mount(<AdminLayoutTemplate />)
    cy.contains('button', 'Sair').should('be.visible')
  })

  it('Deve notificar que o logout ainda não está disponível ao clicar em "Sair"', () => {
    cy.stub(toast, 'info').as('toastInfo')
    cy.mount(<AdminLayoutTemplate />)

    cy.contains('button', 'Sair').click()

    cy.get('@toastInfo').should(
      'have.been.calledWith',
      'Encerrar sessão ainda não está disponível.',
    )
  })
})
