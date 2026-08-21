import { useState } from 'react'
import SlotSearchForm, { type SlotFilters } from '..'

const STUDENTS = [
  {
    id: 'student-1',
    user_id: null,
    full_name: 'Ana Teste',
    document: null,
    phone: '(11) 90000-0000',
    birth_date: null,
    category_id: 'cat-b',
    status: 'ACTIVE',
    created_at: '2026-01-01 00:00:00',
    updated_at: '2026-01-01 00:00:00',
  },
]

const CATEGORIES = [
  { id: 'cat-a', code: 'A', name: 'Motocicletas' },
  { id: 'cat-b', code: 'B', name: 'Automóveis' },
]

function Harness({ onSearch }: { onSearch: () => void }) {
  const [filters, setFilters] = useState<SlotFilters>({
    studentId: '',
    categoryId: '',
    dateFrom: '2026-01-01',
    dateTo: '2026-01-08',
    durationMinutes: 50,
  })

  return (
    <SlotSearchForm
      students={STUDENTS}
      categories={CATEGORIES}
      filters={filters}
      onFiltersChange={setFilters}
      onSearch={onSearch}
      isSearching={false}
    />
  )
}

describe('SlotSearchForm', () => {
  it('Deve desabilitar o botão de busca até selecionar aluno e categoria', () => {
    cy.mount(<Harness onSearch={cy.stub()} />)
    cy.contains('button', 'Buscar horários').should('be.disabled')
  })

  it('Deve preencher a categoria automaticamente ao selecionar o aluno', () => {
    cy.mount(<Harness onSearch={cy.stub()} />)

    cy.get('#studentId').select('Ana Teste')
    cy.get('#categoryId').should('have.value', 'cat-b')
  })

  it('Deve habilitar e chamar onSearch após selecionar aluno e categoria', () => {
    const onSearch = cy.stub().as('onSearch')
    cy.mount(<Harness onSearch={onSearch} />)

    cy.get('#studentId').select('Ana Teste')
    cy.contains('button', 'Buscar horários').should('not.be.disabled').click()

    cy.get('@onSearch').should('have.been.called')
  })
})
