import { toast } from 'react-toastify'
import Profile from '..'

const INSTRUCTOR = {
  id: 'instructor-1',
  user_id: 'user-1',
  full_name: 'Fábio Ramos Teixeira',
  document: '98765432101',
  credential_number: 'CRED-0001',
  phone: '(11) 93456-7801',
  status: 'ACTIVE',
  created_at: '2026-01-01 00:00:00',
  updated_at: '2026-01-01 00:00:00',
  email: 'instrutor1@autoagenda.local',
}

describe('Profile (Instrutor)', () => {
  it('Deve renderizar o título "Perfil"', () => {
    cy.intercept('GET', '**/instructors/me', { statusCode: 200, body: INSTRUCTOR }).as('getMe')

    cy.mount(<Profile />)
    cy.contains('h1', 'Perfil').should('be.visible')
  })

  it('Deve exibir os dados do próprio perfil, com nome/documento/registro/status somente leitura', () => {
    cy.intercept('GET', '**/instructors/me', { statusCode: 200, body: INSTRUCTOR }).as('getMe')

    cy.mount(<Profile />)
    cy.wait('@getMe')

    cy.get('input[value="Fábio Ramos Teixeira"]').should('be.disabled')
    cy.get('input[value="98765432101"]').should('be.disabled')
    cy.get('input[value="CRED-0001"]').should('be.disabled')
    cy.get('input[value="Ativo"]').should('be.disabled')
    cy.get('#phone').should('have.value', '(11) 93456-7801').and('not.be.disabled')
  })

  it('Deve atualizar o telefone e notificar sucesso', () => {
    cy.stub(toast, 'success').as('toastSuccess')
    cy.intercept('GET', '**/instructors/me', { statusCode: 200, body: INSTRUCTOR }).as('getMe')
    cy.intercept('PATCH', '**/instructors/me', {
      statusCode: 200,
      body: { ...INSTRUCTOR, phone: '(85) 99999-1111' },
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
    cy.intercept('GET', '**/instructors/me', { statusCode: 200, body: INSTRUCTOR }).as('getMe')

    cy.mount(<Profile />)
    cy.wait('@getMe')

    cy.get('#phone').clear()
    cy.contains('button', 'Salvar').click()

    cy.contains('Informe o telefone.').should('be.visible')
  })
})
