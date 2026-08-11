import InstructorRegisterForm from '..'

describe('InstructorRegisterForm', () => {
  it('Deve exibir erros de validação ao submeter vazio', () => {
    cy.mount(<InstructorRegisterForm onSubmit={cy.stub()} />)

    cy.contains('button', 'Cadastrar').click()

    cy.contains('Informe o e-mail.').should('be.visible')
    cy.contains('A senha deve ter pelo menos 8 caracteres.').should('be.visible')
    cy.contains('Informe o nome completo.').should('be.visible')
    cy.contains('Informe o registro profissional.').should('be.visible')
    cy.contains('Informe o telefone.').should('be.visible')
  })

  it('Deve exibir erro de e-mail inválido', () => {
    cy.mount(<InstructorRegisterForm onSubmit={cy.stub()} />)

    cy.get('#email').type('nao-e-um-email')
    cy.get('#password').type('senhaforte123')
    cy.contains('button', 'Cadastrar').click()

    cy.contains('Informe um e-mail válido.').should('be.visible')
  })

  it('Deve chamar onSubmit com os dados preenchidos', () => {
    const onSubmit = cy.stub().as('onSubmit')
    cy.mount(<InstructorRegisterForm onSubmit={onSubmit} />)

    cy.get('#email').type('instrutor.teste@autoagenda.local')
    cy.get('#password').type('senhaforte123')
    cy.get('#fullName').type('Fulano de Tal')
    cy.get('#credentialNumber').type('CRED-0099')
    cy.get('#phone').type('11999998888')
    cy.contains('button', 'Cadastrar').click()

    cy.get('@onSubmit').should('have.been.calledWithMatch', {
      email: 'instrutor.teste@autoagenda.local',
      password: 'senhaforte123',
      fullName: 'Fulano de Tal',
      credentialNumber: 'CRED-0099',
      phone: '11999998888',
    })
  })
})
