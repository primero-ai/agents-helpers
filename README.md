# @primero.ai/agents-helpers

Utilities for Primero agents. Currently ships typed clients for resource query
and resource ontology endpoints, plus a Mastra-compatible tool adapter.

## Installation

```bash
npm install @primero.ai/agents-helpers
# or
pnpm add @primero.ai/agents-helpers
# or
yarn add @primero.ai/agents-helpers
```

The package targets Node.js 18+ and ships ESM.

## Quick start

```ts
import { ResourceQueryClient } from '@primero.ai/agents-helpers'

const client = new ResourceQueryClient({
  baseUrl: 'https://primero.ai/',
  tokenId: process.env.PRIMERO_API_KEY_ID,
  tokenSecret: process.env.PRIMERO_API_KEY_SECRET,
})

const result = await client.query({
  sql: 'select 1 as ok',
  limit: 1,
})

console.log(result.rows)
```

## Resource Ontology

```ts
import { ResourceOntologyClient } from '@primero.ai/agents-helpers'

const client = new ResourceOntologyClient({
  baseUrl: 'https://primero.ai/',
  tokenId: process.env.PRIMERO_API_KEY_ID,
  tokenSecret: process.env.PRIMERO_API_KEY_SECRET,
})

const ontology = await client.get()

console.log(ontology)
```

## Mastra

Mastra can consume this package through an AI SDK-compatible tool factory. That
keeps this package decoupled from Mastra internals while still letting a Mastra
agent call Primero resources through the helper.

```ts
import { tool } from 'ai'
import { Agent } from '@mastra/core/agent'
import { openai } from '@ai-sdk/openai'
import { createMastraResourceQueryTool } from '@primero.ai/agents-helpers/mastra'

const primeroResourceQuery = createMastraResourceQueryTool({
  toolFactory: tool,
  baseUrl: process.env.PRIMERO_API_BASE_URL,
  tokenId: process.env.PRIMERO_API_KEY_ID,
  tokenSecret: process.env.PRIMERO_API_KEY_SECRET,
})

const agent = new Agent({
  name: 'Primero Analyst',
  instructions: 'Use primeroResourceQuery whenever you need Primero data.',
  model: openai('gpt-4.1-mini'),
  tools: {
    primeroResourceQuery,
  },
})
```

For the ontology endpoint:

```ts
import { tool } from 'ai'
import { createMastraResourceOntologyTool } from '@primero.ai/agents-helpers/mastra'

const primeroResourceOntology = createMastraResourceOntologyTool({
  toolFactory: tool,
  baseUrl: process.env.PRIMERO_API_BASE_URL,
  tokenId: process.env.PRIMERO_API_KEY_ID,
  tokenSecret: process.env.PRIMERO_API_KEY_SECRET,
})
```

## Environment variables

The client reads defaults from environment variables when options are omitted.

- `PRIMERO_API_BASE_URL` (default: `https://primero.ai/`)
- `PRIMERO_API_KEY_ID` (default: `primero-api-key-id`)
- `PRIMERO_API_KEY_SECRET` (default: `primero-api-key-secret`)
- `PRIMERO_API_TIMEOUT_MS` (default: `60000`)

## API

### `new ResourceQueryClient(options?)`

Options:

- `baseUrl`: Base URL for the Primero API.
- `tokenId`: API token id.
- `tokenSecret`: API token secret.
- `timeoutMs`: Request timeout in milliseconds.

### `client.query(input)`

Input:

- `sql`: SQL string to execute.
- `limit`: Optional row limit (max 5000).

Returns `{ rows, rowCount?, columns? }`.

### `new ResourceOntologyClient(options?)`

Options:

- `baseUrl`: Base URL for the Primero API.
- `tokenId`: API token id.
- `tokenSecret`: API token secret.
- `timeoutMs`: Request timeout in milliseconds.

### `client.get()`

Fetches resource ontology metadata from `api/resources/ontology`.

### `createMastraResourceQueryTool(options)`

Builds a Mastra-compatible tool by wrapping `ResourceQueryClient`.

Options:

- `toolFactory`: Usually `tool` from `ai`.
- `description`: Optional tool description exposed to the model.
- All `ResourceQueryClient` options: `baseUrl`, `tokenId`, `tokenSecret`,
  `timeoutMs`.

### `createMastraResourceOntologyTool(options)`

Builds a Mastra-compatible tool by wrapping `ResourceOntologyClient`.

Options:

- `toolFactory`: Usually `tool` from `ai`.
- `description`: Optional tool description exposed to the model.
- All `ResourceOntologyClient` options: `baseUrl`, `tokenId`, `tokenSecret`,
  `timeoutMs`.

## Example script

```bash
pnpm install
pnpm tsx example/resource-query.ts
pnpm tsx example/resource-ontology.ts
pnpm tsx example/mastra-resource-query.ts
pnpm tsx example/mastra-resource-ontology.ts
```
