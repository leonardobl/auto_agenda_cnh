// Shared envelope for paginated listings (BE-009): `{ items, page, pageSize, total }`.
export interface PageResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export function presentPage<T, V>(result: PageResult<T>, presentItem: (item: T) => V): PageResult<V> {
  return {
    items: result.items.map(presentItem),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  }
}

export function presentItems<T, V>(items: T[], presentItem: (item: T) => V): { items: V[] } {
  return { items: items.map(presentItem) }
}
