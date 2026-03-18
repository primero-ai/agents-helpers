export const DEFAULT_RESOURCES_ENDPOINT_PATH = '/api/resources/query'
export const DEFAULT_RESOURCES_ONTOLOGY_ENDPOINT_PATH = '/api/resources/ontology'

export const DEFAULT_TIMEOUT_MS = process.env.PRIMERO_API_TIMEOUT_MS ?? 60_000

export const PRIMERO_TOKEN_ID = process.env.PRIMERO_API_KEY_ID ?? 'primero-api-key-id'
export const PRIMERO_TOKEN_SECRET = process.env.PRIMERO_API_KEY_SECRET ?? 'primero-api-key-secret'

export const PRIMERO_BASE_URL = process.env.PRIMERO_API_BASE_URL ?? 'https://app.primero.ai'
