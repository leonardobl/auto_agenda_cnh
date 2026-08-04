import StudentForm from '..'

const CATEGORIES = [
  { id: 'cat-a', code: 'A', name: 'Motocicletas' },
  { id: 'cat-b', code: 'B', name: 'Automóveis' },
]

describe('StudentForm', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/license-categories', { statusCode: 200, body: CATEGORIES }).as('categories')
  })

  it('Deve exibir erros de validação ao submeter vazio', () => {
    cy.mount(<StudentForm submitLabel="Cadastrar" onSubmit={cy.stub()} />)
    cy.wait('@categories')

    cy.contains('button', 'Cadastrar').click()

    cy.contains('Informe o nome completo.').should('be.visible')
    cy.contains('Informe o telefone.').should('be.visible')
    cy.contains('Selecione uma categoria.').should('be.visible')
  })

  it('Deve chamar onSubmit com os dados preenchidos', () => {
    const onSubmit = cy.stub().as('onSubmit')
    cy.mount(<StudentForm submitLabel="Cadastrar" onSubmit={onSubmit} />)
    cy.wait('@categories')

    cy.get('#fullName').type('Fulano de Tal')
    cy.get('#phone').type('11999998888')
    cy.get('#categoryId').select('A — Motocicletas')
    cy.contains('button', 'Cadastrar').click()

    cy.get('@onSubmit').should('have.been.calledWithMatch', {
      fullName: 'Fulano de Tal',
      phone: '11999998888',
      categoryId: 'cat-a',
    })
  })

  it('Deve preencher os campos com os valores padrão informados', () => {
    cy.mount(
      <StudentForm
        submitLabel="Salvar"
        onSubmit={cy.stub()}
        defaultValues={{ fullName: 'Maria Existente', phone: '11888887777', categoryId: 'cat-b' }}
      />,
    )
    cy.wait('@categories')

    cy.get('#fullName').should('have.value', 'Maria Existente')
    cy.get('#phone').should('have.value', '11888887777')
  })
})
