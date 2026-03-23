import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type GetObjectCommandOutput,
} from '@aws-sdk/client-s3'
import { PRIMERO_BASE_URL } from '#constants'
import { GetS3FileInputSchema, PutS3FileInputSchema, S3StorageUriSchema } from '#s3/schemas'
import type {
  GetS3FileInput,
  GetS3FileResult,
  PutS3FileInput,
  PutS3FileResult,
  S3FileClientOptions,
} from '#s3/types'

export class S3FileClient {
  private readonly defaultBucketName?: string
  private readonly client: S3Client

  constructor(options: S3FileClientOptions = {}) {
    const region =
      options.region ??
      process.env.AWS_REGION ??
      process.env.AWS_DEFAULT_REGION ??
      'us-east-1'

    this.defaultBucketName =
      options.defaultBucketName ??
      process.env.PRIMERO_STORAGE_BUCKET_NAME ??
      process.env.STORAGE_BUCKET_NAME

    this.client = new S3Client({
      region,
      ...(typeof options.endpoint === 'string' && options.endpoint.trim().length > 0
        ? { endpoint: options.endpoint }
        : {}),
      ...(typeof options.isForcePathStyle === 'boolean'
        ? { forcePathStyle: options.isForcePathStyle }
        : {}),
      ...(typeof options.accessKeyId === 'string' && typeof options.secretAccessKey === 'string'
        ? {
            credentials: {
              accessKeyId: options.accessKeyId,
              secretAccessKey: options.secretAccessKey,
              ...(typeof options.sessionToken === 'string'
                ? { sessionToken: options.sessionToken }
                : {}),
            },
          }
        : {}),
    })
  }

  async putFile(input: PutS3FileInput): Promise<PutS3FileResult> {
    const payload = PutS3FileInputSchema.parse(input)
    const bucketName =
      typeof payload.bucketName === 'string' ? payload.bucketName : this.defaultBucketName

    if (typeof bucketName !== 'string' || bucketName.trim().length === 0) {
      throw new Error(
        'Missing bucket name. Provide input.bucketName or configure defaultBucketName/STORAGE_BUCKET_NAME.',
      )
    }

    const bodyBuffer = toBuffer(payload.body)

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: payload.s3Key,
        Body: bodyBuffer,
        ...(typeof payload.contentType === 'string' ? { ContentType: payload.contentType } : {}),
        ...(typeof payload.contentEncoding === 'string'
          ? { ContentEncoding: payload.contentEncoding }
          : {}),
        ...(payload.metadata ? { Metadata: payload.metadata } : {}),
      }),
    )

    const fileName = resolveFileNameFromS3Key(payload.s3Key)

    return {
      bucketName,
      s3Key: payload.s3Key,
      storageUri: toS3StorageUri(bucketName, payload.s3Key),
      sizeBytes: bodyBuffer.byteLength,
      ...(typeof payload.contentType === 'string' ? { contentType: payload.contentType } : {}),
      ...(typeof fileName === 'string' ? { fileName } : {}),
    }
  }

  async getFile(input: GetS3FileInput): Promise<GetS3FileResult> {
    const payload = GetS3FileInputSchema.parse(input)
    const resolved =
      'storageUri' in payload
        ? parseS3StorageUri(payload.storageUri)
        : { bucketName: payload.bucketName, s3Key: payload.s3Key }
    const result = await this.client.send(
      new GetObjectCommand({
        Bucket: resolved.bucketName,
        Key: resolved.s3Key,
      }),
    )
    const body = await toBodyBuffer(result)

    return {
      bucketName: resolved.bucketName,
      s3Key: resolved.s3Key,
      storageUri: toS3StorageUri(resolved.bucketName, resolved.s3Key),
      body,
      sizeBytes: body.byteLength,
      ...(typeof result.ContentType === 'string' ? { contentType: result.ContentType } : {}),
      ...(typeof result.ContentEncoding === 'string'
        ? { contentEncoding: result.ContentEncoding }
        : {}),
      ...(result.Metadata ? { metadata: result.Metadata } : {}),
    }
  }
}

export function parseS3StorageUri(storageUri: string): {
  bucketName: string
  s3Key: string
} {
  const normalizedUri = S3StorageUriSchema.parse(storageUri)
  const withoutProtocol = normalizedUri.replace(/^s3:\/\//, '')
  const slashIndex = withoutProtocol.indexOf('/')

  if (slashIndex < 1) {
    throw new Error(`Invalid S3 storage URI: '${storageUri}'`)
  }

  const bucketName = withoutProtocol.slice(0, slashIndex)
  const s3Key = withoutProtocol.slice(slashIndex + 1)

  if (bucketName.trim().length === 0 || s3Key.trim().length === 0) {
    throw new Error(`Invalid S3 storage URI: '${storageUri}'`)
  }

  return {
    bucketName,
    s3Key,
  }
}

export function toS3StorageUri(bucketName: string, s3Key: string): string {
  const trimmedBucketName = bucketName.trim()
  const trimmedS3Key = s3Key.trim().replace(/^\/+/, '')

  if (trimmedBucketName.length === 0 || trimmedS3Key.length === 0) {
    throw new Error('Cannot build S3 storage URI with empty bucket or key.')
  }

  return `s3://${trimmedBucketName}/${trimmedS3Key}`
}

export function resolveS3ConsoleUrl(input: { bucketName: string; s3Key: string }): string {
  const encodedS3Key = encodeURIComponent(input.s3Key)

  return `${PRIMERO_BASE_URL}/s3/object/${encodeURIComponent(input.bucketName)}/${encodedS3Key}`
}

function resolveFileNameFromS3Key(s3Key: string): string | undefined {
  const normalizedS3Key = s3Key.trim().replace(/\/+$/, '')

  if (normalizedS3Key.length === 0) {
    return undefined
  }

  const segments = normalizedS3Key.split('/')
  const lastIndex = segments.length - 1
  const fileName = lastIndex >= 0 ? segments[lastIndex]?.trim() : undefined

  return typeof fileName === 'string' && fileName.length > 0 ? fileName : undefined
}

function toBuffer(body: Buffer | Uint8Array | string): Buffer {
  if (Buffer.isBuffer(body)) {
    return body
  }

  if (typeof body === 'string') {
    return Buffer.from(body)
  }

  return Buffer.from(body)
}

async function toBodyBuffer(result: GetObjectCommandOutput): Promise<Buffer> {
  if (!result.Body) {
    return Buffer.alloc(0)
  }

  const body = result.Body as {
    transformToByteArray?: () => Promise<Uint8Array>
  }

  if (typeof body.transformToByteArray === 'function') {
    return Buffer.from(await body.transformToByteArray())
  }

  throw new Error('S3 response body cannot be converted to byte array in this runtime.')
}
