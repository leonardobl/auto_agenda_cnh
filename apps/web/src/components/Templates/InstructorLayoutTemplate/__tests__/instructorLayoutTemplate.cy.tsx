import { toast } from 'react-toastify'
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

  it('Deve notificar que o logout ainda não está disponível ao clicar em "Sair"', () => {
    cy.stub(toast, 'info').as('toastInfo')
    cy.mount(<InstructorLayoutTemplate />)

    cy.contains('button', 'Sair').click()

    cy.get('@toastInfo').should(
      'have.been.calledWith',
      'Encerrar sessão ainda não está disponível.',
    )
  })
})
