# Diagrama de atividades — fluxo de agendamento de aula

Cobre o fluxo real, de ponta a ponta, para Admin ou Aluno. Não inclui presença/conclusão/cancelamento, que não existem no sistema (toda aula permanece `AGENDADA`).

```mermaid
flowchart TD
  Start([Início]) --> Login[Fazer login]
  Login --> Perfil{Perfil?}
  Perfil -->|Aluno| SelfCategoria[Categoria e aluno resolvidos automaticamente]
  Perfil -->|Admin| EscolheAluno[Escolher aluno e categoria]
  SelfCategoria --> Buscar
  EscolheAluno --> Buscar[Buscar horários disponíveis]
  Buscar --> TemSlot{Algum horário livre?}
  TemSlot -->|Não| AjustarFiltro[Ajustar datas/duração] --> Buscar
  TemSlot -->|Sim| Selecionar[Selecionar um horário]
  Selecionar --> Reservar[Confirmar reserva]
  Reservar --> Valido{Passou nas validações?}
  Valido -->|Não - 400/409| Erro[Exibir erro específico] --> Buscar
  Valido -->|Sim - 201| Confirmado[Aula criada em AGENDADA]
  Confirmado --> Listagem[Aparece em /appointments do aluno, instrutor e admin]
  Listagem --> End([Fim])
```
