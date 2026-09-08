import { useHomePage } from './useHomePage'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function Home() {
  const {
    studentCount,
    instructorCount,
    vehicleCount,
    appointmentCount,
    upcomingAppointments,
    isLoading,
  } = useHomePage()

  const stats = [
    { label: 'Alunos', value: studentCount },
    { label: 'Instrutores', value: instructorCount },
    { label: 'Veículos', value: vehicleCount },
    { label: 'Aulas agendadas', value: appointmentCount },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Início</h1>

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 rounded-lg border border-solid p-4">
                <span className="text-2xl font-semibold">{stat.value}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">Próximos agendamentos</h2>
            {upcomingAppointments.length === 0 ? (
              <p>Nenhum agendamento futuro.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {upcomingAppointments.map((appointment) => (
                  <li key={appointment.id} className="rounded-lg border border-solid p-3">
                    {formatDateTime(appointment.start_at)} — {appointment.student_full_name} com{' '}
                    {appointment.instructor_full_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Home
