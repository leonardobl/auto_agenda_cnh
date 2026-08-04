import Modal from '..'

describe('Modal', () => {
  it('Deve exibir o título e o conteúdo quando aberto', () => {
    cy.mount(
      <Modal open onClose={cy.stub()} title="Título de teste">
        <p>Conteúdo do modal</p>
      </Modal>,
    )

    cy.contains('Título de teste').should('be.visible')
    cy.contains('Conteúdo do modal').should('be.visible')
  })

  it('Não deve exibir o conteúdo quando fechado', () => {
    cy.mount(
      <Modal open={false} onClose={cy.stub()} title="Título de teste">
        <p>Conteúdo do modal</p>
      </Modal>,
    )

    cy.contains('Conteúdo do modal').should('not.be.visible')
  })

  it('Deve chamar onClose ao clicar no botão de fechar', () => {
    const onClose = cy.stub().as('onClose')

    cy.mount(
      <Modal open onClose={onClose} title="Título de teste">
        <p>Conteúdo do modal</p>
      </Modal>,
    )

    cy.contains('button', 'Fechar').click()
    cy.get('@onClose').should('have.been.called')
  })
})
