import { DEFAULT_PAGE_SIZE } from '../../../../constants/pagination'
import Button from '../../../Atoms/Button'
import SlotSearchForm from '../../../Molecules/SlotSearchForm'
import { useSchedulePage } from './useSchedulePage'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function Schedule() {
  const {
    students,
    categories,
    filters,
    setFilters,
    slots,
    hasSearched,
    isSearching,
    handleSearch,
    handleBook,
    isBooking,
    appointments,
    isLoadingAppointments,
    page,
    setPage,
    total,
  } = useSchedulePage()

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Agenda</h1>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium">Buscar horário disponível</h2>
        <SlotSearchForm
          students={students}
          categories={categories}
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
          isSearching={isSearching}
        />

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

      <section className="flex flex-col gap-4">
        <h2 className="font-medium">Aulas agendadas</h2>

        {isLoadingAppointments ? (
          <p>Carregando...</p>
        ) : appointments.length === 0 ? (
          <p>Nenhuma aula agendada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-2">Início</th>
                  <th className="p-2">Aluno</th>
                  <th className="p-2">Instrutor</th>
                  <th className="p-2">Veículo</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-t border-solid">
                    <td className="p-2">{formatDateTime(appointment.start_at)}</td>
                    <td className="p-2">{appointment.student_full_name}</td>
                    <td className="p-2">{appointment.instructor_full_name}</td>
                    <td className="p-2">{appointment.vehicle_plate}</td>
                    <td className="p-2">{appointment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <span>
            Página {page} de {totalPages}
          </span>
          <Button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Próxima
          </Button>
        </div>
      </section>
    </div>
  )
}

export default Schedule
