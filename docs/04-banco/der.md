# DER (lógico e físico) — PostgreSQL

Gerado a partir de `apps/api/src/database/migrations/0001_create_user.sql` … `0010_create_instructor_block.sql` (as migrations *são* o projeto físico deste banco). Dicionário de dados completo em `docs/05_Banco_de_Dados_Dicionario.md`.

```mermaid
erDiagram
  USER ||--o{ STUDENT : "user_id (0..1)"
  USER ||--o{ INSTRUCTOR : "user_id"
  USER ||--o{ SESSION : "user_id"
  USER ||--o{ PASSWORD_RESET_TOKEN : "user_id"
  USER ||--o{ APPOINTMENT : "created_by"
  USER ||--o{ INSTRUCTOR_BLOCK : "created_by"
  LICENSE_CATEGORY ||--o{ STUDENT : "category_id"
  LICENSE_CATEGORY ||--o{ VEHICLE : "category_id"
  LICENSE_CATEGORY ||--o{ APPOINTMENT : "category_id"
  STUDENT ||--o{ APPOINTMENT : "student_id"
  INSTRUCTOR ||--o{ APPOINTMENT : "instructor_id"
  INSTRUCTOR ||--o{ INSTRUCTOR_AVAILABILITY : "instructor_id"
  INSTRUCTOR ||--o{ INSTRUCTOR_BLOCK : "instructor_id"
  VEHICLE ||--o{ APPOINTMENT : "vehicle_id"

  USER {
    text id PK
    text email UK
    text password_hash
    text role
    text status
    timestamptz last_login_at
  }
  STUDENT {
    text id PK
    text user_id FK "UK, nullable"
    text full_name
    text document UK "nullable"
    text phone
    date birth_date
    text category_id FK
    text status
  }
  INSTRUCTOR {
    text id PK
    text user_id FK "UK"
    text full_name
    text document UK "nullable"
    text credential_number UK
    text phone
    text status
  }
  VEHICLE {
    text id PK
    text plate UK
    text brand
    text model
    int year
    text category_id FK
    text status
  }
  LICENSE_CATEGORY {
    text id PK
    text code UK
    text name
  }
  APPOINTMENT {
    text id PK
    text student_id FK
    text instructor_id FK
    text vehicle_id FK
    text category_id FK
    timestamptz start_at
    timestamptz end_at
    text status
    text created_by FK
  }
  INSTRUCTOR_AVAILABILITY {
    text id PK
    text instructor_id FK
    int weekday
    text start_time
    text end_time
    int active
  }
  INSTRUCTOR_BLOCK {
    text id PK
    text instructor_id FK
    timestamptz start_at
    timestamptz end_at
    text reason
    text created_by FK
  }
  SESSION {
    text id PK
    text user_id FK
    timestamptz expires_at
  }
  PASSWORD_RESET_TOKEN {
    text id PK
    text user_id FK
    timestamptz expires_at
    timestamptz used_at "nullable"
  }
```

`appointment` também tem três *exclusion constraints* (não representáveis em notação DER clássica) — ver `decisoes.md`.
