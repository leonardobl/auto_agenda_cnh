import { toast } from 'react-toastify'
import Reports from '..'

describe('Reports (Administrador)', () => {
  it('Deve renderizar o título "Relatórios"', () => {
    cy.mount(<Reports />)
    cy.contains('h1', 'Relatórios').should('be.visible')
  })

  it('Deve exibir estado de carregamento e depois a confirmação simulada', () => {
    cy.stub(toast, 'success').as('toastSuccess')
    cy.clock()
    cy.mount(<Reports />)

    cy.contains('button', 'Exportar relatório de aulas').click()
    cy.contains('button', 'Exportando...').should('be.disabled')

    cy.tick(800)

    cy.get('@toastSuccess').should('have.been.calledWith', 'Relatório gerado (simulado).')
    cy.contains('button', 'Exportar relatório de aulas').should('not.be.disabled')
  })
})
