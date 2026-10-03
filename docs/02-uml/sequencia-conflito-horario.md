# Diagrama de sequência — tentativa de agendar horário já ocupado

O PDF pede um diagrama de "reagendar com conflito"; este projeto não implementa reagendamento (Non-Goal registrado em `appointment-scheduling`'s design.md), então este diagrama documenta o fluxo real de conflito que existe: duas tentativas de reserva no mesmo horário/recurso, coberto por `apps/api/tests/concurrency.test.ts`.

```mermaid
sequenceDiagram
  actor A as Requisição A
  actor B as Requisição B
  participant S as appointmentService
  participant DB as PostgreSQL (exclusion constraints)

  A->>S: POST /appointments (instrutor X, 10:00–10:50)
  B->>S: POST /appointments (mesmo instrutor X, 10:00–10:50)
  par Checagem da aplicação
    S->>DB: isInstructorFree? (A)
    DB-->>S: true
  and
    S->>DB: isInstructorFree? (B)
    DB-->>S: true (ainda não commitado)
  end
  S->>DB: INSERT appointment (A) — commit primeiro
  DB-->>S: 201 OK
  S->>DB: INSERT appointment (B)
  DB-->>S: erro 23P01 (exclusion_violation: appointment_instructor_no_overlap)
  S-->>B: 409 APPOINTMENT_INSTRUCTOR_CONFLICT
  S-->>A: 201 Created
```

A checagem da aplicação (`isInstructorFree`) reduz a chance de conflito, mas quem garante a exclusão mútua sob concorrência real é a *exclusion constraint* do banco (migration `0007`) — ver `docs/04-banco/decisoes.md`.
