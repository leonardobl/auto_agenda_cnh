import TextField from '..'

describe('TextField', () => {
  it('Deve renderizar o label associado ao campo', () => {
    cy.mount(<TextField label="E-mail" name="email" />)
    cy.get('label').contains('E-mail')
    cy.get('#email').should('exist')
  })

  it('Deve chamar onChange ao digitar', () => {
    const onChange = cy.stub().as('onChange')
    cy.mount(<TextField label="E-mail" name="email" onChange={onChange} />)
    cy.get('#email').type('a')
    cy.get('@onChange').should('have.been.called')
  })

  it('Deve exibir a mensagem de erro associada ao campo', () => {
    cy.mount(<TextField label="E-mail" name="email" error="Informe um e-mail válido." />)
    cy.contains('Informe um e-mail válido.').should('be.visible')
    cy.get('#email')
      .should('have.attr', 'aria-invalid', 'true')
      .and('have.attr', 'aria-describedby', 'email-error')
  })

  it('Não deve marcar aria-invalid quando não há erro', () => {
    cy.mount(<TextField label="E-mail" name="email" />)
    cy.get('#email').should('have.attr', 'aria-invalid', 'false')
  })
})
