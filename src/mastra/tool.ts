import { ResourceQueryInputSchema } from '../resource-query/schemas'
import type { ResourceQueryClientOptions, ResourceQueryInput, ResourceQueryResponse } from '../resource-query/types'
import { ResourceQueryClient } from '../resource-query/client'

const DEFAULT_MASTRA_RESOURCE_QUERY_TOOL_DESCRIPTION =
  'Query Primero resources by executing read-only SQL against the configured Primero API.'

export type MastraToolDefinition = {
  description: string
  inputSchema: typeof ResourceQueryInputSchema
  execute: (input: ResourceQueryInput) => Promise<ResourceQueryResponse>
}

export type MastraToolFactory<TTool> = (definition: MastraToolDefinition) => TTool

export type CreateMastraResourceQueryToolOptions<TTool> = ResourceQueryClientOptions & {
  description?: string
  toolFactory: MastraToolFactory<TTool>
}

export function createMastraResourceQueryTool<TTool>({
  description = DEFAULT_MASTRA_RESOURCE_QUERY_TOOL_DESCRIPTION,
  toolFactory,
  ...clientOptions
}: CreateMastraResourceQueryToolOptions<TTool>): TTool {
  const client = new ResourceQueryClient(clientOptions)

  return toolFactory({
    description,
    inputSchema: ResourceQueryInputSchema,
    execute: async (input) => client.query(input),
  })
}
