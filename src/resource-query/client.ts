import axios, { type AxiosInstance } from 'axios'
import {
  DEFAULT_RESOURCES_ENDPOINT_PATH,
  DEFAULT_TIMEOUT_MS,
  PRIMERO_BASE_URL,
  PRIMERO_TOKEN_ID,
  PRIMERO_TOKEN_SECRET,
} from '../constants'
import { ResourceQueryInputSchema, ResourceQueryResponseSchema } from './schemas'
import type {
  ResourceQueryClientOptions,
  ResourceQueryInput,
  ResourceQueryResponse,
} from './types'

export class ResourceQueryClient {
  private readonly endpointUrl: string
  private readonly tokenId: string
  private readonly tokenSecret: string
  private readonly http: AxiosInstance

  constructor(options: ResourceQueryClientOptions = {}) {
    this.endpointUrl = this.buildEndpointUrl(options)
    this.tokenId = options.tokenId ?? PRIMERO_TOKEN_ID
    this.tokenSecret = options.tokenSecret ?? PRIMERO_TOKEN_SECRET

    this.http = axios.create({ timeout: Number(DEFAULT_TIMEOUT_MS) })
  }

  async query<Row = Record<string, unknown>>(
    input: ResourceQueryInput,
  ): Promise<ResourceQueryResponse<Row>> {
    const payload = ResourceQueryInputSchema.parse(input)
    const response = await this.http.post(this.endpointUrl, {
      ...payload,
      tokenId: this.tokenId,
      tokenSecret: this.tokenSecret,
    })
    const parsed = ResourceQueryResponseSchema.parse(response.data)

    return parsed as ResourceQueryResponse<Row>
  }

  private buildEndpointUrl(options: ResourceQueryClientOptions): string {
    const baseUrl = options.baseUrl ?? PRIMERO_BASE_URL

    if (!baseUrl) {
      throw new Error(
        'Missing base URL. Set PRIMERO_API_BASE_URL.',
      )
    }

    const endpointPath = DEFAULT_RESOURCES_ENDPOINT_PATH

    return `${baseUrl}${endpointPath}`
  }
}
