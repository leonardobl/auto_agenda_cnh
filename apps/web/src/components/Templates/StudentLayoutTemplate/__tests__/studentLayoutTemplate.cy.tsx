import { toast } from 'react-toastify'
import StudentLayoutTemplate from '..'

describe('StudentLayoutTemplate', () => {
  it('Deve renderizar todos os itens de navegação do aluno', () => {
    cy.mount(<StudentLayoutTemplate />)

    cy.get('nav[aria-label="Navegação do aluno"]').within(() => {
      cy.contains('a', 'Início').should('be.visible')
      cy.contains('a', 'Minha agenda').should('be.visible')
      cy.contains('a', 'Agendar aula').should('be.visible')
      cy.contains('a', 'Histórico').should('be.visible')
      cy.contains('a', 'Perfil').should('be.visible')
    })
  })

  it('Deve exibir o botão "Sair"', () => {
    cy.mount(<StudentLayoutTemplate />)
    cy.contains('button', 'Sair').should('be.visible')
  })

  it('Deve notificar que o logout ainda não está disponível ao clicar em "Sair"', () => {
    cy.stub(toast, 'info').as('toastInfo')
    cy.mount(<StudentLayoutTemplate />)

    cy.contains('button', 'Sair').click()

    cy.get('@toastInfo').should(
      'have.been.calledWith',
      'Encerrar sessão ainda não está disponível.',
    )
  })
})
