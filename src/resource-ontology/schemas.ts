import { z } from 'zod'

const JsonSchemaPrimitive = z.union([z.string(), z.number(), z.boolean(), z.null()])

export type JsonColumnSchema = {
  type?: string | string[]
  properties?: Record<string, JsonColumnSchema>
  items?: JsonColumnSchema
  required?: string[]
  enum?: Array<string | number | boolean | null>
  additionalProperties?: boolean | JsonColumnSchema
  [key: string]: unknown
}

export const JsonColumnSchema: z.ZodType<JsonColumnSchema> = z.lazy(() =>
  z
    .object({
      type: z.union([z.string(), z.array(z.string())]).optional(),
      properties: z.record(z.string(), JsonColumnSchema).optional(),
      items: JsonColumnSchema.optional(),
      required: z.array(z.string()).optional(),
      enum: z.array(JsonSchemaPrimitive).optional(),
      additionalProperties: z.union([z.boolean(), JsonColumnSchema]).optional(),
    })
    .passthrough(),
)

export const ColumnStatistics = z.object({
  distinctCount: z.number(),
  nullPercent: z.number().min(0).max(100),
  sampleValues: z.array(z.unknown()).max(10),
  minValue: z.unknown().optional(),
  maxValue: z.unknown().optional(),
})

export const RelationSource = z.enum([
  'foreign_key',
  'implicit_name',
  'implicit_value',
  'view_dependency',
])

export const IntrospectedColumn = z.object({
  name: z.string(),
  dataType: z.string().default('unknown'),
  isNullable: z.boolean().optional(),
  jsonSchema: JsonColumnSchema.optional(),
  description: z.string().optional(),
  enumValues: z.array(z.string()).optional(),
})

export const IntrospectedTable = z.object({
  name: z.string(),
  schema: z.string().optional(),
  columns: z.array(IntrospectedColumn),
  rowCount: z.number().optional(),
  description: z.string().optional(),
  businessName: z.string().optional(),
  sampleRows: z.array(z.record(z.string(), z.unknown())).optional(),
})

export const IntrospectedRelation = z.object({
  name: z.string().optional(),
  sourceSchema: z.string().optional(),
  sourceTable: z.string(),
  sourceColumns: z.array(z.string()),
  targetSchema: z.string().optional(),
  targetTable: z.string(),
  targetColumns: z.array(z.string()),
  updateRule: z.string().optional(),
  deleteRule: z.string().optional(),
  source: RelationSource.optional().default('foreign_key'),
  confidence: z.number().min(0).max(1).optional(),
  description: z.string().optional(),
})

export const IntrospectedEnum = z.object({
  name: z.string(),
  values: z.array(z.string()),
})

export const IntrospectedSchema = z.object({
  tables: z.array(IntrospectedTable),
  relations: z.array(IntrospectedRelation),
  enums: z.array(IntrospectedEnum).optional().default([]),
})

export const ResourceOntologyResponseSchema = z.object({
  resourceId: z.string(),
  schema: IntrospectedSchema.nullable(),
  verified: z.boolean(),
  createdAt: z.string(),
})
