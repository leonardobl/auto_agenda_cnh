import { toast } from 'react-toastify'
import Settings from '..'

describe('Settings (Administrador)', () => {
  it('Deve renderizar o título "Configurações"', () => {
    cy.mount(<Settings />)
    cy.contains('h1', 'Configurações').should('be.visible')
  })

  it('Deve exibir os valores reais do algoritmo de agendamento', () => {
    cy.mount(<Settings />)

    cy.get('#businessHoursStartHour').should('have.value', '8')
    cy.get('#businessHoursEndHour').should('have.value', '18')
    cy.get('#defaultDurationMinutes').should('have.value', '50')
    cy.get('#minAdvanceMinutes').should('have.value', '120')
  })

  it('Deve exibir confirmação de sucesso ao salvar, sem persistir', () => {
    cy.stub(toast, 'success').as('toastSuccess')
    cy.mount(<Settings />)

    cy.get('#defaultDurationMinutes').clear()
    cy.get('#defaultDurationMinutes').type('60')
    cy.contains('button', 'Salvar').click()

    cy.get('@toastSuccess').should('have.been.calledWith', 'Configurações salvas.')

    cy.mount(<Settings />)
    cy.get('#defaultDurationMinutes').should('have.value', '50')
  })
})
