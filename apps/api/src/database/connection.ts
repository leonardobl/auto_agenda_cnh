import pg from 'pg'
import type { QueryResult, QueryResultRow } from 'pg'

// Global type parsers (they apply to every pg connection in this process):
// - timestamptz comes back as an ISO 8601 string, the same shape the API already
//   returned for start_at/end_at (a raw pg `Date` would serialize fine too, but strings
//   keep models, views and tests free of Date handling).
// - date (birth_date) comes back as the raw 'YYYY-MM-DD' string; pg's default would
//   build a timezone-dependent Date at local midnight.
pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, (value) => new Date(value).toISOString())
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value)

// Anything models can run SQL on: the Pool itself (one implicit client per call) or a
// dedicated client inside a transaction. Models take a Queryable so the same model code
// works in and out of a transaction.
export interface Queryable {
  query<R extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<R>>
}

export interface Database extends Queryable {
  // Runs `fn` on a dedicated client between BEGIN and COMMIT; any error rolls back and
  // is rethrown. The client is always returned to the pool.
  withTransaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>
  close(): Promise<void>
}

interface CreateDatabaseOptions {
  // Sets `search_path` on every connection (tests use it to isolate a temporary schema).
  searchPath?: string
}

export function createDatabase(connectionString: string, options: CreateDatabaseOptions = {}): Database {
  const pool = new pg.Pool({
    connectionString,
    options: options.searchPath ? `-c search_path=${options.searchPath}` : undefined,
  })

  // An idle client can error (e.g. the server restarts); without a listener that would
  // crash the whole process as an unhandled 'error' event.
  pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL pool error:', error.message)
  })

  return {
    query: (text, values) => pool.query(text, values),

    async withTransaction(fn) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const result = await fn(client)
        await client.query('COMMIT')
        return result
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },

    close: () => pool.end(),
  }
}
