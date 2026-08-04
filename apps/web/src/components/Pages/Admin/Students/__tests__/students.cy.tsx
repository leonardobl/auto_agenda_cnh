import Students from '..'

const CATEGORIES = [
  { id: 'cat-a', code: 'A', name: 'Motocicletas' },
  { id: 'cat-b', code: 'B', name: 'Automóveis' },
]

const STUDENTS = [
  {
    id: 'student-1',
    user_id: null,
    full_name: 'Ana Teste',
    document: '11122233344',
    phone: '(11) 90000-0001',
    birth_date: null,
    category_id: 'cat-b',
    status: 'ACTIVE',
    created_at: '2026-01-01 00:00:00',
    updated_at: '2026-01-01 00:00:00',
  },
]

describe('Students (Administrador)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/license-categories', { statusCode: 200, body: CATEGORIES }).as('categories')
    cy.intercept('GET', '**/students*', {
      statusCode: 200,
      body: { items: STUDENTS, page: 1, pageSize: 10, total: 1 },
    }).as('listStudents')
  })

  it('Deve renderizar o título "Alunos"', () => {
    cy.mount(<Students />)
    cy.contains('h1', 'Alunos').should('be.visible')
  })

  it('Deve listar os alunos retornados pela API', () => {
    cy.mount(<Students />)

    cy.wait('@listStudents')
    cy.contains('Ana Teste').should('be.visible')
    cy.contains('11122233344').should('be.visible')
  })

  it('Deve exibir mensagem quando não há alunos', () => {
    cy.intercept('GET', '**/students*', {
      statusCode: 200,
      body: { items: [], page: 1, pageSize: 10, total: 0 },
    }).as('listStudentsEmpty')

    cy.mount(<Students />)

    cy.wait('@listStudentsEmpty')
    cy.contains('Nenhum aluno encontrado.').should('be.visible')
  })

  it('Deve cadastrar um novo aluno e fechar o modal', () => {
    cy.intercept('POST', '**/students', {
      statusCode: 201,
      body: { ...STUDENTS[0], id: 'student-2', full_name: 'Novo Aluno' },
    }).as('createStudent')

    cy.mount(<Students />)
    cy.wait('@listStudents')

    cy.contains('button', 'Novo aluno').click()
    cy.wait('@categories')

    cy.get('#fullName').type('Novo Aluno')
    cy.get('#phone').type('11999990000')
    cy.get('#categoryId').select('A — Motocicletas')
    cy.contains('button', 'Cadastrar').click()

    cy.wait('@createStudent')
    cy.contains('h2', 'Novo aluno').should('not.be.visible')
  })

  it('Deve inativar um aluno após confirmação', () => {
    cy.intercept('POST', '**/students/student-1/deactivate', {
      statusCode: 200,
      body: { ...STUDENTS[0], status: 'INACTIVE' },
    }).as('deactivateStudent')

    cy.mount(<Students />)
    cy.wait('@listStudents')

    cy.on('window:confirm', () => true)
    cy.contains('button', 'Inativar').click()

    cy.wait('@deactivateStudent')
  })
})
