export type JsonColumnSchema = {
  type?: string | string[]
  properties?: Record<string, JsonColumnSchema>
  items?: JsonColumnSchema
  required?: string[]
  enum?: Array<string | number | boolean | null>
  additionalProperties?: boolean | JsonColumnSchema
  [key: string]: unknown
}

export type ColumnStatistics = {
  distinctCount: number
  nullPercent: number
  sampleValues: unknown[]
  minValue?: unknown
  maxValue?: unknown
}

export type RelationSource =
  | 'foreign_key'
  | 'implicit_name'
  | 'implicit_value'
  | 'view_dependency'

export type IntrospectedColumn = {
  name: string
  dataType: string
  isNullable?: boolean
  jsonSchema?: JsonColumnSchema
  description?: string
  enumValues?: string[]
}

export type IntrospectedTable = {
  name: string
  schema?: string
  columns: IntrospectedColumn[]
  rowCount?: number
  description?: string
  businessName?: string
  sampleRows?: Record<string, unknown>[]
}

export type IntrospectedRelation = {
  name?: string
  sourceSchema?: string
  sourceTable: string
  sourceColumns: string[]
  targetSchema?: string
  targetTable: string
  targetColumns: string[]
  updateRule?: string
  deleteRule?: string
  source?: RelationSource
  confidence?: number
  description?: string
}

export type IntrospectedEnum = {
  name: string
  values: string[]
}

export type IntrospectedSchema = {
  tables: IntrospectedTable[]
  relations: IntrospectedRelation[]
  enums?: IntrospectedEnum[]
}

export type ResourceOntologyResponse = {
  resourceId: string
  schema: IntrospectedSchema | null
  verified: boolean
  createdAt: string
}

export type ResourceOntologyClientOptions = {
  baseUrl?: string
  tokenId?: string
  tokenSecret?: string
  timeoutMs?: number
}
