import TextField from '../../Atoms/InputsRHF/TextField'
import SelectField from '../../Atoms/InputsRHF/SelectField'
import Button from '../../Atoms/Button'
import type { Student, LicenseCategory } from '../../../services/StudentService'

export interface SlotFilters {
  studentId: string
  categoryId: string
  dateFrom: string
  dateTo: string
  durationMinutes: number
}

interface SlotSearchFormProps {
  students: Student[]
  categories: LicenseCategory[]
  filters: SlotFilters
  onFiltersChange: (filters: SlotFilters) => void
  onSearch: () => void
  isSearching: boolean
}

function SlotSearchForm({
  students,
  categories,
  filters,
  onFiltersChange,
  onSearch,
  isSearching,
}: SlotSearchFormProps) {
  const handleStudentChange = (studentId: string) => {
    const student = students.find((candidate) => candidate.id === studentId)
    const categoryId = student?.category_id ?? filters.categoryId
    onFiltersChange({ ...filters, studentId, categoryId })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label="Aluno"
          name="studentId"
          value={filters.studentId}
          onChange={(event) => handleStudentChange(event.target.value)}
        >
          <option value="">Selecione...</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.full_name}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Categoria"
          name="categoryId"
          value={filters.categoryId}
          onChange={(event) => onFiltersChange({ ...filters, categoryId: event.target.value })}
        >
          <option value="">Selecione...</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.code} — {category.name}
            </option>
          ))}
        </SelectField>

        <TextField
          label="De"
          name="dateFrom"
          type="date"
          value={filters.dateFrom}
          onChange={(event) => onFiltersChange({ ...filters, dateFrom: event.target.value })}
        />

        <TextField
          label="Até"
          name="dateTo"
          type="date"
          value={filters.dateTo}
          onChange={(event) => onFiltersChange({ ...filters, dateTo: event.target.value })}
        />

        <TextField
          label="Duração (minutos)"
          name="durationMinutes"
          type="number"
          min={1}
          value={filters.durationMinutes}
          onChange={(event) => onFiltersChange({ ...filters, durationMinutes: Number(event.target.value) })}
        />
      </div>

      <Button
        type="button"
        onClick={onSearch}
        disabled={isSearching || !filters.studentId || !filters.categoryId}
      >
        Buscar horários
      </Button>
    </div>
  )
}

export default SlotSearchForm
