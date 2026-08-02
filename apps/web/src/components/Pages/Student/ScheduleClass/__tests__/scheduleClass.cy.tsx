import ScheduleClass from '..'

describe('ScheduleClass (Aluno)', () => {
  it('Deve renderizar o título "Agendar aula"', () => {
    cy.mount(<ScheduleClass />)
    cy.contains('h1', 'Agendar aula').should('be.visible')
  })
})
