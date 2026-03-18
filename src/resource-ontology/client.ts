import axios, { type AxiosInstance } from 'axios'
import {
  DEFAULT_RESOURCES_ONTOLOGY_ENDPOINT_PATH,
  DEFAULT_TIMEOUT_MS,
  PRIMERO_BASE_URL,
  PRIMERO_TOKEN_ID,
  PRIMERO_TOKEN_SECRET,
} from '#constants'
import { ResourceOntologyResponseSchema } from '#resource-ontology/schemas'
import type { ResourceOntologyClientOptions, ResourceOntologyResponse } from '#resource-ontology/types'

export class ResourceOntologyClient {
  private readonly endpointUrl: string
  private readonly tokenId: string
  private readonly tokenSecret: string
  private readonly http: AxiosInstance

  constructor(options: ResourceOntologyClientOptions = {}) {
    this.endpointUrl = this.buildEndpointUrl(options)
    this.tokenId = options.tokenId ?? PRIMERO_TOKEN_ID
    this.tokenSecret = options.tokenSecret ?? PRIMERO_TOKEN_SECRET

    this.http = axios.create({
      timeout: Number(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    })
  }

  async get<Response = ResourceOntologyResponse>(): Promise<Response> {
    const response = await this.http.post(this.endpointUrl, {
      tokenId: this.tokenId,
      tokenSecret: this.tokenSecret,
    })
    const parsed = ResourceOntologyResponseSchema.parse(response.data)

    return parsed as Response
  }

  private buildEndpointUrl(options: ResourceOntologyClientOptions): string {
    const baseUrl = options.baseUrl ?? PRIMERO_BASE_URL

    if (!baseUrl) {
      throw new Error('Missing base URL. Set PRIMERO_API_BASE_URL.')
    }

    return `${baseUrl}${DEFAULT_RESOURCES_ONTOLOGY_ENDPOINT_PATH}`
  }
}
