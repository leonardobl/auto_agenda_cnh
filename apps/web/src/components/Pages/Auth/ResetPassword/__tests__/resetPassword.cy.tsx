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

  it('Deve redefinir a senha e notificar sucesso quando o token é válido', () => {
    cy.stub(toast, 'success').as('toastSuccess')
    cy.intercept('POST', '**/auth/reset-password', {
      statusCode: 200,
      body: { message: 'Senha redefinida com sucesso.' },
    }).as('resetPassword')

    cy.mount(<ResetPassword />, { route: '/redefinir-senha?token=abc123' })

    cy.get('#password').type('senha123')
    cy.get('#confirmPassword').type('senha123')
    cy.contains('button', 'Redefinir senha').click()

    cy.wait('@resetPassword')
      .its('request.body')
      .should('deep.equal', { token: 'abc123', password: 'senha123' })
    cy.get('@toastSuccess').should(
      'have.been.calledWith',
      'Senha redefinida com sucesso. Faça login com a nova senha.',
    )
  })

  it('Deve exibir a mensagem de erro da API quando o token é inválido ou expirado', () => {
    cy.stub(toast, 'error').as('toastError')
    cy.intercept('POST', '**/auth/reset-password', {
      statusCode: 400,
      body: { code: 'VALIDATION_ERROR', message: 'Link inválido ou expirado.' },
    }).as('resetPasswordError')

    cy.mount(<ResetPassword />, { route: '/redefinir-senha?token=abc123' })

    cy.get('#password').type('senha123')
    cy.get('#confirmPassword').type('senha123')
    cy.contains('button', 'Redefinir senha').click()

    cy.wait('@resetPasswordError')
    cy.get('@toastError').should('have.been.calledWith', 'Link inválido ou expirado.')
  })
})
