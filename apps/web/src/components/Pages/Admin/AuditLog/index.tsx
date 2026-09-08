// mocked: no backend, see "O que é real vs. simulado" in README.md — this is a
// fixed sample, not a real query against an audit_event table.
const SAMPLE_EVENTS = [
  {
    id: 'sample-1',
    action: 'Aluno cadastrado',
    entity: 'Ana Beatriz Souza',
    user: 'admin@autoagenda.local',
    createdAt: '08/09/2026 09:12',
  },
  {
    id: 'sample-2',
    action: 'Instrutor editado',
    entity: 'Fábio Ramos Teixeira',
    user: 'admin@autoagenda.local',
    createdAt: '08/09/2026 09:20',
  },
  {
    id: 'sample-3',
    action: 'Aula agendada',
    entity: 'Ana Beatriz Souza com Fábio Ramos Teixeira',
    user: 'admin@autoagenda.local',
    createdAt: '08/09/2026 10:05',
  },
  {
    id: 'sample-4',
    action: 'Veículo colocado em manutenção',
    entity: 'ABC1D23',
    user: 'admin@autoagenda.local',
    createdAt: '07/09/2026 16:40',
  },
  {
    id: 'sample-5',
    action: 'Login realizado',
    entity: 'instrutor1@autoagenda.local',
    user: 'instrutor1@autoagenda.local',
    createdAt: '07/09/2026 08:03',
  },
]

function AuditLog() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Auditoria</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Ação</th>
              <th className="p-2">Entidade</th>
              <th className="p-2">Usuário</th>
              <th className="p-2">Data</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_EVENTS.map((event) => (
              <tr key={event.id} className="border-t border-solid">
                <td className="p-2">{event.action}</td>
                <td className="p-2">{event.entity}</td>
                <td className="p-2">{event.user}</td>
                <td className="p-2">{event.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AuditLog
