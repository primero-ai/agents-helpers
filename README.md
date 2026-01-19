# @primero.ai/agents-helpers

Utilities for Primero agents. Currently ships a typed Resource Query client for
calling the Primero API.

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

### `client.query(input)`

Input:

- `sql`: SQL string to execute.
- `limit`: Optional row limit (max 5000).

Returns `{ rows, rowCount?, columns? }`.

## Example script

```bash
pnpm install
pnpm tsx example/resource-query.ts
```
