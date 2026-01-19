export type ResourceQueryInput = {
  sql: string
  limit?: number
}

export type ResourceQueryResponse<Row = Record<string, unknown>> = {
  rows: Row[]
  rowCount?: number
  columns?: string[]
}

export type ResourceQueryClientOptions = {
  baseUrl?: string
  tokenId?: string
  tokenSecret?: string
  timeoutMs?: number
}
