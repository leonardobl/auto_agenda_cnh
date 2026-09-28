// Appends `value` to `params` and returns its PostgreSQL placeholder ("$1", "$2", …).
// Lets dynamic WHERE clauses be built without counting positions by hand.
export function bind(params: unknown[], value: unknown): string {
  params.push(value)
  return `$${params.length}`
}
