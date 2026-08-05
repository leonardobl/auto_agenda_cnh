import Vehicles from '..'

const CATEGORIES = [
  { id: 'cat-a', code: 'A', name: 'Motocicletas' },
  { id: 'cat-b', code: 'B', name: 'Automóveis' },
]

const VEHICLES = [
  {
    id: 'vehicle-1',
    plate: 'ABC1D23',
    brand: 'Volkswagen',
    model: 'Gol',
    year: 2020,
    category_id: 'cat-b',
    status: 'ACTIVE',
    created_at: '2026-01-01 00:00:00',
    updated_at: '2026-01-01 00:00:00',
  },
]

describe('Vehicles (Administrador)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/license-categories', { statusCode: 200, body: CATEGORIES }).as('categories')
    cy.intercept('GET', '**/vehicles*', {
      statusCode: 200,
      body: { items: VEHICLES, page: 1, pageSize: 10, total: 1 },
    }).as('listVehicles')
  })

  it('Deve renderizar o título "Veículos"', () => {
    cy.mount(<Vehicles />)
    cy.contains('h1', 'Veículos').should('be.visible')
  })

  it('Deve listar os veículos retornados pela API', () => {
    cy.mount(<Vehicles />)

    cy.wait('@listVehicles')
    cy.contains('ABC1D23').should('be.visible')
    cy.contains('Gol').should('be.visible')
  })

  it('Deve exibir mensagem quando não há veículos', () => {
    cy.intercept('GET', '**/vehicles*', {
      statusCode: 200,
      body: { items: [], page: 1, pageSize: 10, total: 0 },
    }).as('listVehiclesEmpty')

    cy.mount(<Vehicles />)

    cy.wait('@listVehiclesEmpty')
    cy.contains('Nenhum veículo encontrado.').should('be.visible')
  })

  it('Deve cadastrar um novo veículo e fechar o modal', () => {
    cy.intercept('POST', '**/vehicles', {
      statusCode: 201,
      body: { ...VEHICLES[0], id: 'vehicle-2', plate: 'ZZZ9Z99' },
    }).as('createVehicle')

    cy.mount(<Vehicles />)
    cy.wait('@listVehicles')

    cy.contains('button', 'Novo veículo').click()
    cy.wait('@categories')

    cy.get('#plate').type('ZZZ9Z99')
    cy.get('#brand').type('Fiat')
    cy.get('#model').type('Uno')
    cy.get('#year').type('2021')
    cy.get('#categoryId').select('A — Motocicletas')
    cy.contains('button', 'Cadastrar').click()

    cy.wait('@createVehicle')
    cy.contains('h2', 'Novo veículo').should('not.be.visible')
  })

  it('Deve editar um veículo existente, incluindo o status', () => {
    cy.intercept('PATCH', '**/vehicles/vehicle-1', {
      statusCode: 200,
      body: { ...VEHICLES[0], status: 'MAINTENANCE' },
    }).as('updateVehicle')

    cy.mount(<Vehicles />)
    cy.wait('@listVehicles')

    cy.contains('button', 'Editar').click()
    cy.wait('@categories')

    cy.get('#status').select('Manutenção')
    cy.contains('button', 'Salvar').click()

    cy.wait('@updateVehicle')
    cy.contains('h2', 'Editar veículo').should('not.be.visible')
  })
})
