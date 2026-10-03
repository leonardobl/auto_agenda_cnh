# Diagrama de classes (domínio e persistência)

Classes correspondentes às tabelas de `apps/api/src/database/migrations/` e aos tipos `*Record` de `apps/api/src/models/*Model.ts`. Como o projeto não usa ORM (SQL puro), "classe" aqui é o mesmo objeto que a tabela e que o `*Record` do model — não há uma camada de entidade separada.

```mermaid
classDiagram
  class User {
    +string id
    +string email
    +string password_hash
    +string role
    +string status
    +string~ last_login_at
  }
  class Student {
    +string id
    +string~ user_id
    +string full_name
    +string~ document
    +string phone
    +string~ birth_date
    +string category_id
    +string status
  }
  class Instructor {
    +string id
    +string user_id
    +string full_name
    +string~ document
    +string credential_number
    +string phone
    +string status
  }
  class Vehicle {
    +string id
    +string plate
    +string brand
    +string model
    +int year
    +string category_id
    +string status
  }
  class LicenseCategory {
    +string id
    +string code
    +string name
  }
  class Appointment {
    +string id
    +string student_id
    +string instructor_id
    +string vehicle_id
    +string category_id
    +timestamptz start_at
    +timestamptz end_at
    +string status
  }
  class InstructorAvailability {
    +string id
    +string instructor_id
    +int weekday
    +string start_time
    +string end_time
    +int active
  }
  class InstructorBlock {
    +string id
    +string instructor_id
    +timestamptz start_at
    +timestamptz end_at
    +string reason
    +string created_by
  }
  class Session {
    +string id
    +string user_id
    +timestamptz expires_at
  }
  class PasswordResetToken {
    +string id
    +string user_id
    +timestamptz expires_at
    +timestamptz~ used_at
  }

  User "1" -- "0..1" Student : user_id
  User "1" -- "0..1" Instructor : user_id
  User "1" -- "*" Session : user_id
  User "1" -- "*" PasswordResetToken : user_id
  LicenseCategory "1" -- "*" Student : category_id
  LicenseCategory "1" -- "*" Vehicle : category_id
  LicenseCategory "1" -- "*" Appointment : category_id
  Student "1" -- "*" Appointment : student_id
  Instructor "1" -- "*" Appointment : instructor_id
  Instructor "1" -- "*" InstructorAvailability : instructor_id
  Instructor "1" -- "*" InstructorBlock : instructor_id
  Vehicle "1" -- "*" Appointment : vehicle_id
```

**Nota**: `Appointment` tem `status` como coluna, mas hoje o único valor possível é `AGENDADA` — ver `estados-appointment.md`.
