import TextField from '../../../Atoms/InputsRHF/TextField'
import Button from '../../../Atoms/Button'
import { useScheduleClassPage } from './useScheduleClassPage'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function ScheduleClass() {
  const { filters, setFilters, slots, hasSearched, isSearching, handleSearch, handleBook, isBooking } =
    useScheduleClassPage()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Agendar aula</h1>

      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField
            label="De"
            name="dateFrom"
            type="date"
            value={filters.dateFrom}
            onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value })}
          />
          <TextField
            label="Até"
            name="dateTo"
            type="date"
            value={filters.dateTo}
            onChange={(event) => setFilters({ ...filters, dateTo: event.target.value })}
          />
          <TextField
            label="Duração (minutos)"
            name="durationMinutes"
            type="number"
            min={1}
            value={filters.durationMinutes}
            onChange={(event) => setFilters({ ...filters, durationMinutes: Number(event.target.value) })}
          />
        </div>

        <Button type="button" onClick={handleSearch} disabled={isSearching}>
          Buscar horários
        </Button>

        {isSearching ? (
          <p>Buscando horários...</p>
        ) : hasSearched && slots.length === 0 ? (
          <p>Nenhum horário disponível para os filtros informados.</p>
        ) : slots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-2">Início</th>
                  <th className="p-2">Fim</th>
                  <th className="p-2">Instrutor</th>
                  <th className="p-2">Veículo</th>
                  <th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={`${slot.startAt}-${slot.instructorId}`} className="border-t border-solid">
                    <td className="p-2">{formatDateTime(slot.startAt)}</td>
                    <td className="p-2">{formatDateTime(slot.endAt)}</td>
                    <td className="p-2">{slot.instructorName}</td>
                    <td className="p-2">{slot.vehiclePlate}</td>
                    <td className="p-2">
                      <Button type="button" disabled={isBooking} onClick={() => handleBook(slot)}>
                        Reservar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default ScheduleClass
