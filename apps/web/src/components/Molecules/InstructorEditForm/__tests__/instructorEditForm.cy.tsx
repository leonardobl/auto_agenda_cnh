import InstructorEditForm from '..'

const DEFAULT_VALUES = {
  fullName: 'Maria Existente',
  credentialNumber: 'CRED-0001',
  phone: '11888887777',
  status: 'ACTIVE' as const,
}

describe('InstructorEditForm', () => {
  it('Deve preencher os campos com os valores padrão informados', () => {
    cy.mount(<InstructorEditForm defaultValues={DEFAULT_VALUES} onSubmit={cy.stub()} />)

    cy.get('#fullName').should('have.value', 'Maria Existente')
    cy.get('#credentialNumber').should('have.value', 'CRED-0001')
    cy.get('#phone').should('have.value', '11888887777')
  })

  it('Não deve exibir campos de e-mail ou senha', () => {
    cy.mount(<InstructorEditForm defaultValues={DEFAULT_VALUES} onSubmit={cy.stub()} />)

    cy.contains('label', 'E-mail').should('not.exist')
    cy.contains('label', 'Senha').should('not.exist')
  })

  it('Deve chamar onSubmit com os dados atualizados', () => {
    const onSubmit = cy.stub().as('onSubmit')
    cy.mount(<InstructorEditForm defaultValues={DEFAULT_VALUES} onSubmit={onSubmit} />)

    cy.get('#status').select('Inativo')
    cy.contains('button', 'Salvar').click()

    cy.get('@onSubmit').should('have.been.calledWithMatch', { status: 'INACTIVE' })
  })
})
