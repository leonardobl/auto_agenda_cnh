import { useHistoryPage } from './useHistoryPage'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function History() {
  const { appointments, isLoading } = useHistoryPage()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Histórico</h1>

      {isLoading ? (
        <p>Carregando...</p>
      ) : appointments.length === 0 ? (
        <p>Nenhuma aula anterior.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">Início</th>
                <th className="p-2">Instrutor</th>
                <th className="p-2">Veículo</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-t border-solid">
                  <td className="p-2">{formatDateTime(appointment.start_at)}</td>
                  <td className="p-2">{appointment.instructor_full_name}</td>
                  <td className="p-2">{appointment.vehicle_plate}</td>
                  <td className="p-2">{appointment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default History
