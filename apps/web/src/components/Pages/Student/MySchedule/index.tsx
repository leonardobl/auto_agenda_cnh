import { useMySchedulePage } from './useMySchedulePage'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function MySchedule() {
  const { appointments, isLoading } = useMySchedulePage()

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

export default MySchedule
