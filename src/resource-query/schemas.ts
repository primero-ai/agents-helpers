import { z } from 'zod'

export const ResourceQueryInputSchema = z.object({
  sql: z.string().min(1),
  limit: z.number().int().positive().max(5000).optional(),
})
export const ResourceQueryResponseSchema = z.object({
  rows: z.array(z.unknown()),
  rowCount: z.number().optional(),
  columns: z.array(z.string()).optional(),
})
