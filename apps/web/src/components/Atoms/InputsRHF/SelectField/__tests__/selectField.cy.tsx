import SelectField from '..'

describe('SelectField', () => {
  it('Deve renderizar o label e as opções', () => {
    cy.mount(
      <SelectField label="Categoria" name="categoria">
        <option value="a">Opção A</option>
        <option value="b">Opção B</option>
      </SelectField>,
    )

    cy.contains('label', 'Categoria').should('be.visible')
    cy.get('select').find('option').should('have.length', 2)
  })

  it('Deve exibir mensagem de erro quando informada', () => {
    cy.mount(
      <SelectField label="Categoria" name="categoria" error="Selecione uma categoria.">
        <option value="a">Opção A</option>
      </SelectField>,
    )

    cy.contains('Selecione uma categoria.').should('be.visible')
  })
})
