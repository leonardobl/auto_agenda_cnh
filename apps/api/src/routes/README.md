# routes

The **Router** layer. Maps method + path to middlewares (`requireAuth`, `requireRole`, from `middlewares/`) and one controller method. Each `xRoutes({ db })` builds its own model → service → controller instances.

Register literal paths (`/students/me`) before parameterized ones (`/students/:id`) — Express matches in registration order. No business logic and no data access here.
