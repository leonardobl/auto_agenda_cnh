import VehicleForm from '..'

const CATEGORIES = [
  { id: 'cat-a', code: 'A', name: 'Motocicletas' },
  { id: 'cat-b', code: 'B', name: 'Automóveis' },
]

describe('VehicleForm', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/license-categories', { statusCode: 200, body: CATEGORIES }).as('categories')
  })

  it('Deve exibir erros de validação ao submeter vazio', () => {
    cy.mount(<VehicleForm submitLabel="Cadastrar" onSubmit={cy.stub()} />)
    cy.wait('@categories')

    cy.contains('button', 'Cadastrar').click()

    cy.contains('Informe a placa.').should('be.visible')
    cy.contains('Informe a marca.').should('be.visible')
    cy.contains('Informe o modelo.').should('be.visible')
    cy.contains('Informe o ano.').should('be.visible')
    cy.contains('Selecione uma categoria.').should('be.visible')
  })

  it('Deve exibir erro para um ano implausível', () => {
    cy.mount(<VehicleForm submitLabel="Cadastrar" onSubmit={cy.stub()} />)
    cy.wait('@categories')

    cy.get('#plate').type('ABC1D23')
    cy.get('#brand').type('Fiat')
    cy.get('#model').type('Uno')
    cy.get('#year').type('1899')
    cy.get('#categoryId').select('B — Automóveis')
    cy.contains('button', 'Cadastrar').click()

    cy.contains('Ano inválido.').should('be.visible')
  })

  it('Deve chamar onSubmit com os dados preenchidos', () => {
    const onSubmit = cy.stub().as('onSubmit')
    cy.mount(<VehicleForm submitLabel="Cadastrar" onSubmit={onSubmit} />)
    cy.wait('@categories')

    cy.get('#plate').type('ABC1D23')
    cy.get('#brand').type('Fiat')
    cy.get('#model').type('Uno')
    cy.get('#year').type('2021')
    cy.get('#categoryId').select('B — Automóveis')
    cy.contains('button', 'Cadastrar').click()

    cy.get('@onSubmit').should('have.been.calledWithMatch', {
      plate: 'ABC1D23',
      brand: 'Fiat',
      model: 'Uno',
      year: '2021',
      categoryId: 'cat-b',
      status: 'ACTIVE',
    })
  })

  it('Deve preencher os campos com os valores padrão informados', () => {
    cy.mount(
      <VehicleForm
        submitLabel="Salvar"
        onSubmit={cy.stub()}
        defaultValues={{
          plate: 'XYZ9K88',
          brand: 'Honda',
          model: 'CG 160',
          year: '2022',
          categoryId: 'cat-a',
          status: 'MAINTENANCE',
        }}
      />,
    )
    cy.wait('@categories')

    cy.get('#plate').should('have.value', 'XYZ9K88')
    cy.get('#year').should('have.value', '2022')
  })
})
