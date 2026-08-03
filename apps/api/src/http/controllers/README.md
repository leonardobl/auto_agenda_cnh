# controllers

Converts HTTP requests into calls to `modules`/use-cases and shapes the HTTP response. Empty for now — health checks (the only routes this change adds) are simple enough to live directly in `src/http/routes`. The first real controller lands with the first domain feature (e.g. auth).
