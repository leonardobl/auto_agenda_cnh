# models

The **Model** layer of the API's MVC structure. Two kinds of files, both free of Express/HTTP concerns:

- `*Model.ts` — persistence, plain SQL through `pg` (no ORM). One per table, factory `createXModel(db: Queryable)` — the same model works on the connection pool or, inside `database.withTransaction`, on the transaction's client. Every method is async.
- `*Service.ts` — the business rules, validation and transactions of each use case; what controllers call. Throws `ApiError` for expected failures.

Never import `express`, `views/`, `controllers/` or `routes/` from here. PostgreSQL enforces foreign keys and the appointment exclusion constraints, but services still validate references and overlaps first so the client gets a specific 4xx instead of a raw constraint error (`23503`/`23P01`, see `database/errors.ts`).
