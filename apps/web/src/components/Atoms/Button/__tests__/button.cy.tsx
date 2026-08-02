import Button from '..'

describe('Button', () => {
  it('Deve renderizar o conteúdo recebido', () => {
    cy.mount(<Button>Entrar</Button>)
    cy.contains('button', 'Entrar').should('be.visible')
  })

  it('Deve chamar onClick ao ser clicado', () => {
    const onClick = cy.stub().as('onClick')
    cy.mount(<Button onClick={onClick}>Entrar</Button>)
    cy.contains('button', 'Entrar').click()
    cy.get('@onClick').should('have.been.calledOnce')
  })

  it('Deve usar type="button" por padrão', () => {
    cy.mount(<Button>Entrar</Button>)
    cy.contains('button', 'Entrar').should('have.attr', 'type', 'button')
  })

  it('Deve permitir sobrescrever o type via props', () => {
    cy.mount(<Button type="submit">Enviar</Button>)
    cy.contains('button', 'Enviar').should('have.attr', 'type', 'submit')
  })
})
