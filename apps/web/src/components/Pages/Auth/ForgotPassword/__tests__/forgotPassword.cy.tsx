import ForgotPassword from '..'

describe('ForgotPassword', () => {
  it('Deve exibir erro para e-mail inválido', () => {
    cy.mount(<ForgotPassword />)

    cy.get('#email').type('invalido')
    cy.contains('button', 'Enviar').click()

    cy.contains('Informe um e-mail válido.').should('be.visible')
  })

  it('Deve exibir a mensagem genérica de confirmação após envio válido', () => {
    cy.mount(<ForgotPassword />)

    cy.get('#email').type('aluno@teste.com')
    cy.contains('button', 'Enviar').click()

    cy.contains('Se o e-mail informado existir, você receberá instruções para redefinir sua senha.').should(
      'be.visible',
    )
  })

  it('Deve conter um link de volta para o login', () => {
    cy.mount(<ForgotPassword />)
    cy.contains('a', 'Voltar para o login').should('have.attr', 'href', '/login')
  })
})
