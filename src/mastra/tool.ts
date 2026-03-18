import { z } from 'zod'
import { ResourceOntologyClient } from '#resource-ontology/client'
import type { ResourceOntologyClientOptions, ResourceOntologyResponse } from '#resource-ontology/types'
import { ResourceQueryInputSchema } from '#resource-query/schemas'
import type {
  ResourceQueryClientOptions,
  ResourceQueryInput,
  ResourceQueryResponse,
} from '#resource-query/types'
import { ResourceQueryClient } from '#resource-query/client'

const DEFAULT_MASTRA_RESOURCE_QUERY_TOOL_DESCRIPTION =
  'Query Primero resources by executing read-only SQL against the configured Primero API.'
const DEFAULT_MASTRA_RESOURCE_ONTOLOGY_TOOL_DESCRIPTION =
  'Fetch the Primero resource ontology from the configured Primero API.'
const ResourceOntologyToolInputSchema = z.object({})

export type MastraToolDefinition<TInput, TOutput, TSchema extends z.ZodTypeAny> = {
  description: string
  inputSchema: TSchema
  execute: (input: TInput) => Promise<TOutput>
}

export type MastraToolFactory<TTool, TInput, TOutput, TSchema extends z.ZodTypeAny> = (
  definition: MastraToolDefinition<TInput, TOutput, TSchema>,
) => TTool

export type CreateMastraResourceQueryToolOptions<TTool> = ResourceQueryClientOptions & {
  description?: string
  toolFactory: MastraToolFactory<
    TTool,
    ResourceQueryInput,
    ResourceQueryResponse,
    typeof ResourceQueryInputSchema
  >
}

export type CreateMastraResourceOntologyToolOptions<TTool> = ResourceOntologyClientOptions & {
  description?: string
  toolFactory: MastraToolFactory<
    TTool,
    z.infer<typeof ResourceOntologyToolInputSchema>,
    ResourceOntologyResponse,
    typeof ResourceOntologyToolInputSchema
  >
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

export function createMastraResourceOntologyTool<TTool>({
  description = DEFAULT_MASTRA_RESOURCE_ONTOLOGY_TOOL_DESCRIPTION,
  toolFactory,
  ...clientOptions
}: CreateMastraResourceOntologyToolOptions<TTool>): TTool {
  const client = new ResourceOntologyClient(clientOptions)

  return toolFactory({
    description,
    inputSchema: ResourceOntologyToolInputSchema,
    execute: async () => client.get(),
  })
}
