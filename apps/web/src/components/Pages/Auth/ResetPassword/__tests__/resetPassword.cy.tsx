import { toast } from 'react-toastify'
import ResetPassword from '..'

describe('ResetPassword', () => {
  it('Deve exibir "Link inválido ou expirado" quando não há token na URL', () => {
    cy.mount(<ResetPassword />, { route: '/redefinir-senha' })

    cy.contains('Link inválido ou expirado.').should('be.visible')
    cy.contains('a', 'Solicitar novo link').should('have.attr', 'href', '/esqueci-senha')
  })

  it('Deve exibir o formulário quando há um token na URL', () => {
    cy.mount(<ResetPassword />, { route: '/redefinir-senha?token=abc123' })

    cy.get('#password').should('exist')
    cy.get('#confirmPassword').should('exist')
  })

  it('Deve exibir erro quando as senhas não coincidem', () => {
    cy.mount(<ResetPassword />, { route: '/redefinir-senha?token=abc123' })

    cy.get('#password').type('senha123')
    cy.get('#confirmPassword').type('outrasenha')
    cy.contains('button', 'Redefinir senha').click()

    cy.contains('As senhas não coincidem.').should('be.visible')
  })

  it('Deve notificar que a redefinição ainda não está disponível quando as senhas coincidem', () => {
    cy.stub(toast, 'info').as('toastInfo')
    cy.mount(<ResetPassword />, { route: '/redefinir-senha?token=abc123' })

    cy.get('#password').type('senha123')
    cy.get('#confirmPassword').type('senha123')
    cy.contains('button', 'Redefinir senha').click()

    cy.get('@toastInfo').should(
      'have.been.calledWith',
      'Redefinição de senha ainda não está disponível.',
    )
  })
})
