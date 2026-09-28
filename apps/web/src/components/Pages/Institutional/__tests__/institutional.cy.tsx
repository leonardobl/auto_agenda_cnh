import Institutional from '..'
import { CONTACT, SERVICES } from '../content'

describe('Institutional', () => {
  it('Deve renderizar todas as seções da página', () => {
    cy.mount(<Institutional />)

    cy.get('#sobre').should('exist')
    cy.get('#servicos').should('exist')
    cy.get('#galeria').should('exist')
    cy.get('#matricule-se').should('exist')
    cy.get('#contato').should('exist')
  })

  it('Deve listar todas as categorias de CNH na seção de serviços', () => {
    cy.mount(<Institutional />)

    SERVICES.forEach((service) => {
      cy.get('#servicos').contains(service.name).should('be.visible')
    })
  })

  it('Deve linkar o botão "Entrar" para a página de login', () => {
    cy.mount(<Institutional />)

    cy.contains('a', 'Entrar').should('have.attr', 'href', '/login')
  })

  it('Deve abrir o WhatsApp em uma nova aba a partir da seção de matrícula', () => {
    cy.mount(<Institutional />)

    cy.get('#matricule-se')
      .contains('a', 'Falar no WhatsApp')
      .should('have.attr', 'href')
      .and('include', `https://wa.me/${CONTACT.whatsappNumber}`)

    cy.get('#matricule-se')
      .contains('a', 'Falar no WhatsApp')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer')
  })

  it('Deve exibir os links de redes sociais no rodapé', () => {
    cy.mount(<Institutional />)

    CONTACT.socials.forEach((social) => {
      cy.get('#contato')
        .contains('a', social.label)
        .should('have.attr', 'href', social.href)
        .and('have.attr', 'target', '_blank')
    })
  })
})
