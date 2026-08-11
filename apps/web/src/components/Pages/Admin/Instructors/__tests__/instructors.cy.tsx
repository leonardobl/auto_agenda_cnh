import Instructors from '..'

const INSTRUCTORS = [
  {
    id: 'instructor-1',
    user_id: 'user-1',
    full_name: 'Ana Instrutora',
    document: '11122233344',
    credential_number: 'CRED-0001',
    phone: '(11) 90000-0001',
    status: 'ACTIVE',
    created_at: '2026-01-01 00:00:00',
    updated_at: '2026-01-01 00:00:00',
    email: 'ana.instrutora@autoagenda.local',
  },
]

describe('Instructors (Administrador)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/instructors*', {
      statusCode: 200,
      body: { items: INSTRUCTORS, page: 1, pageSize: 10, total: 1 },
    }).as('listInstructors')
  })

  it('Deve renderizar o título "Instrutores"', () => {
    cy.mount(<Instructors />)
    cy.contains('h1', 'Instrutores').should('be.visible')
  })

  it('Deve listar os instrutores retornados pela API', () => {
    cy.mount(<Instructors />)

    cy.wait('@listInstructors')
    cy.contains('Ana Instrutora').should('be.visible')
    cy.contains('ana.instrutora@autoagenda.local').should('be.visible')
  })

  it('Deve exibir mensagem quando não há instrutores', () => {
    cy.intercept('GET', '**/instructors*', {
      statusCode: 200,
      body: { items: [], page: 1, pageSize: 10, total: 0 },
    }).as('listInstructorsEmpty')

    cy.mount(<Instructors />)

    cy.wait('@listInstructorsEmpty')
    cy.contains('Nenhum instrutor encontrado.').should('be.visible')
  })

  it('Deve cadastrar um novo instrutor e fechar o modal', () => {
    cy.intercept('POST', '**/instructors', {
      statusCode: 201,
      body: { ...INSTRUCTORS[0], id: 'instructor-2', full_name: 'Novo Instrutor' },
    }).as('createInstructor')

    cy.mount(<Instructors />)
    cy.wait('@listInstructors')

    cy.contains('button', 'Novo instrutor').click()

    cy.get('#email').type('novo.instrutor@autoagenda.local')
    cy.get('#password').type('senhaforte123')
    cy.get('#fullName').type('Novo Instrutor')
    cy.get('#credentialNumber').type('CRED-0099')
    cy.get('#phone').type('11999990000')
    cy.contains('button', 'Cadastrar').click()

    cy.wait('@createInstructor')
    cy.contains('h2', 'Novo instrutor').should('not.be.visible')
  })

  it('Deve editar um instrutor existente, incluindo o status', () => {
    cy.intercept('PATCH', '**/instructors/instructor-1', {
      statusCode: 200,
      body: { ...INSTRUCTORS[0], status: 'INACTIVE' },
    }).as('updateInstructor')

    cy.mount(<Instructors />)
    cy.wait('@listInstructors')

    cy.contains('button', 'Editar').click()
    cy.get('#status').select('Inativo')
    cy.contains('button', 'Salvar').click()

    cy.wait('@updateInstructor')
    cy.contains('h2', 'Editar instrutor').should('not.be.visible')
  })
})
