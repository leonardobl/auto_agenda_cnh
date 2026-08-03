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

  it('Deve armazenar o token retornado ao autenticar com credenciais válidas', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-session-token',
        user: { id: '1', email: 'admin@autoagenda.local', role: 'ADMIN', status: 'ACTIVE' },
      },
    }).as('login')

    cy.mount(<Login />)

    cy.get('#email').type('admin@autoagenda.local')
    cy.get('#password').type('Demo@123')
    cy.contains('button', 'Entrar').click()

    cy.wait('@login')
    cy.window()
      .its('sessionStorage')
      .invoke('getItem', 'authToken')
      .should('eq', 'fake-session-token')
  })

  it('Deve notificar a mensagem de erro retornada pela API ao falhar a autenticação', () => {
    cy.stub(toast, 'error').as('toastError')
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'E-mail ou senha inválidos.',
        correlationId: 'test-correlation-id',
      },
    }).as('login')

    cy.mount(<Login />)

    cy.get('#email').type('admin@autoagenda.local')
    cy.get('#password').type('senha-errada')
    cy.contains('button', 'Entrar').click()

    cy.wait('@login')
    cy.get('@toastError').should('have.been.calledWith', 'E-mail ou senha inválidos.')
  })

  it('Deve conter um link para a página de recuperação de senha', () => {
    cy.mount(<Login />)
    cy.contains('a', 'Esqueci minha senha').should('have.attr', 'href', '/esqueci-senha')
  })
})
