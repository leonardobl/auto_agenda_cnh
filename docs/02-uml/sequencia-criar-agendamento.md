# Diagrama de sequência — criar agendamento (caminho feliz)

Corresponde a `POST /appointments`, implementado em `apps/api/src/models/appointmentService.ts` (`book`). Passa por Router → Controller → Model (Service + Model, dentro de uma transação) → View, conforme a arquitetura MVC descrita no README.

```mermaid
sequenceDiagram
  actor U as Usuário (Admin/Aluno)
  participant R as Router
  participant C as Controller
  participant S as appointmentService
  participant M as appointmentModel
  participant DB as PostgreSQL

  U->>R: POST /appointments {studentId, instructorId, vehicleId, categoryId, startAt}
  R->>C: appointmentController.book(req)
  C->>S: book(params, requester)
  S->>S: valida aluno/instrutor/veículo ativos e compatíveis
  S->>S: valida expediente, antecedência mínima e disponibilidade do instrutor
  S->>DB: withTransaction(BEGIN)
  S->>M: isStudentFree / isInstructorFree / isVehicleFree
  M->>DB: SELECT ... WHERE NOT (overlap)
  DB-->>M: nenhuma linha (livre)
  M-->>S: true, true, true
  S->>M: create(appointment)
  M->>DB: INSERT INTO appointment ... RETURNING *
  DB-->>M: linha criada
  S->>DB: COMMIT
  S-->>C: AppointmentRecord
  C-->>R: presentAppointment(record)
  R-->>U: 201 Created + JSON do agendamento
```
