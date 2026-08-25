import { DEFAULT_PAGE_SIZE } from '../../../../constants/pagination'
import Button from '../../../Atoms/Button'
import { useMySchedulePage } from './useMySchedulePage'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function MySchedule() {
  const { appointments, isLoading, page, setPage, total } = useMySchedulePage()

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Minha agenda</h1>

      {isLoading ? (
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
                <th className="p-2">Veículo</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-t border-solid">
                  <td className="p-2">{formatDateTime(appointment.start_at)}</td>
                  <td className="p-2">{appointment.student_full_name}</td>
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
    </div>
  )
}

export default MySchedule
