import { toast } from 'react-toastify'
import Profile from '..'

const STUDENT = {
  id: 'student-1',
  user_id: 'user-1',
  full_name: 'Ana Beatriz Souza',
  document: '12345678901',
  phone: '(11) 91234-5601',
  birth_date: null,
  category_id: 'cat-b',
  status: 'ACTIVE',
  created_at: '2026-01-01 00:00:00',
  updated_at: '2026-01-01 00:00:00',
}

const CATEGORIES = [
  { id: 'cat-a', code: 'A', name: 'Motocicletas' },
  { id: 'cat-b', code: 'B', name: 'Automóveis' },
]

describe('Profile (Aluno)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/license-categories', { statusCode: 200, body: CATEGORIES }).as('categories')
  })

  it('Deve renderizar o título "Perfil"', () => {
    cy.intercept('GET', '**/students/me', { statusCode: 200, body: STUDENT }).as('getMe')

    cy.mount(<Profile />)
    cy.contains('h1', 'Perfil').should('be.visible')
  })

  it('Deve exibir os dados do próprio perfil, com nome/documento/categoria/status somente leitura', () => {
    cy.intercept('GET', '**/students/me', { statusCode: 200, body: STUDENT }).as('getMe')

    cy.mount(<Profile />)
    cy.wait('@getMe')
    cy.wait('@categories')

    cy.get('input[value="Ana Beatriz Souza"]').should('be.disabled')
    cy.get('input[value="12345678901"]').should('be.disabled')
    cy.get('input[value="B — Automóveis"]').should('be.disabled')
    cy.get('input[value="Ativo"]').should('be.disabled')
    cy.get('#phone').should('have.value', '(11) 91234-5601').and('not.be.disabled')
  })

  it('Deve atualizar o telefone e notificar sucesso', () => {
    cy.stub(toast, 'success').as('toastSuccess')
    cy.intercept('GET', '**/students/me', { statusCode: 200, body: STUDENT }).as('getMe')
    cy.intercept('PATCH', '**/students/me', {
      statusCode: 200,
      body: { ...STUDENT, phone: '(85) 99999-1111' },
    }).as('updateMe')

    cy.mount(<Profile />)
    cy.wait('@getMe')

    cy.get('#phone').clear()
    cy.get('#phone').type('(85) 99999-1111')
    cy.contains('button', 'Salvar').click()

    cy.wait('@updateMe')
      .its('request.body')
      .should('deep.equal', { phone: '(85) 99999-1111' })
    cy.get('@toastSuccess').should('have.been.calledWith', 'Perfil atualizado com sucesso.')
  })

  it('Deve exibir erro quando o telefone é apagado', () => {
    cy.intercept('GET', '**/students/me', { statusCode: 200, body: STUDENT }).as('getMe')

    cy.mount(<Profile />)
    cy.wait('@getMe')

    cy.get('#phone').clear()
    cy.contains('button', 'Salvar').click()

    cy.contains('Informe o telefone.').should('be.visible')
  })
})
