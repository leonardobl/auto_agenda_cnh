import ForgotPassword from '..'

describe('ForgotPassword', () => {
  it('Deve exibir erro para e-mail inválido', () => {
    cy.mount(<ForgotPassword />)

    cy.get('#email').type('invalido')
    cy.contains('button', 'Enviar').click()

    cy.contains('Informe um e-mail válido.').should('be.visible')
  })

  it('Deve exibir a mensagem genérica de confirmação após envio válido', () => {
    cy.intercept('POST', '**/auth/forgot-password', {
      statusCode: 200,
      body: { message: 'Se o e-mail informado existir, você receberá instruções para redefinir sua senha.' },
    }).as('forgotPassword')

    cy.mount(<ForgotPassword />)

    cy.get('#email').type('aluno@teste.com')
    cy.contains('button', 'Enviar').click()

    cy.wait('@forgotPassword')
    cy.contains('Se o e-mail informado existir, você receberá instruções para redefinir sua senha.').should(
      'be.visible',
    )
  })

  it('Deve exibir a mesma mensagem genérica mesmo quando a requisição falha', () => {
    cy.intercept('POST', '**/auth/forgot-password', { statusCode: 500 }).as('forgotPasswordError')

    cy.mount(<ForgotPassword />)

    cy.get('#email').type('aluno@teste.com')
    cy.contains('button', 'Enviar').click()

    cy.wait('@forgotPasswordError')
    cy.contains('Se o e-mail informado existir, você receberá instruções para redefinir sua senha.').should(
      'be.visible',
    )
  })

  it('Deve conter um link de volta para o login', () => {
    cy.mount(<ForgotPassword />)
    cy.contains('a', 'Voltar para o login').should('have.attr', 'href', '/login')
  })
})
