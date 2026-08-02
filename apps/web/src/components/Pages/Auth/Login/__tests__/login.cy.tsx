import { toast } from 'react-toastify'
import Login from '..'

describe('Login', () => {
  it('Deve exibir erros de validação ao submeter o formulário vazio', () => {
    cy.mount(<Login />)

    cy.contains('button', 'Entrar').click()

    cy.contains('Informe o e-mail.').should('be.visible')
    cy.contains('Informe a senha.').should('be.visible')
  })

  it('Deve exibir erro de e-mail inválido', () => {
    cy.mount(<Login />)

    cy.get('#email').type('nao-e-um-email')
    cy.get('#password').type('senha123')
    cy.contains('button', 'Entrar').click()

    cy.contains('Informe um e-mail válido.').should('be.visible')
  })

  it('Deve notificar que a autenticação ainda não está disponível ao submeter dados válidos', () => {
    cy.stub(toast, 'info').as('toastInfo')
    cy.mount(<Login />)

    cy.get('#email').type('aluno@teste.com')
    cy.get('#password').type('senha123')
    cy.contains('button', 'Entrar').click()

    cy.get('@toastInfo').should('have.been.calledWith', 'Autenticação ainda não está disponível.')
  })

  it('Deve conter um link para a página de recuperação de senha', () => {
    cy.mount(<Login />)
    cy.contains('a', 'Esqueci minha senha').should('have.attr', 'href', '/esqueci-senha')
  })
})
