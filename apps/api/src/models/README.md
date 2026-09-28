# models

The **Model** layer of the API's MVC structure. Two kinds of files, both free of Express/HTTP concerns:

- `*Model.ts` — persistence, plain SQL via `node:sqlite` (see "Reconciling with the academic spec" in the root `CLAUDE.md` for why not an ORM). One per table, factory `createXModel(db)`.
- `*Service.ts` — the business rules, validation and transactions of each use case; what controllers call. Throws `ApiError` for expected failures.

Never import `express`, `views/`, `controllers/` or `routes/` from here. Note `node:sqlite` doesn't enforce foreign keys: a service must check that a referenced id exists itself.
