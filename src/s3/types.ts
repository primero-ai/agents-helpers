export type S3FileReference = {
  bucketName: string
  s3Key: string
  storageUri: string
}

export type PutS3FileInput = {
  s3Key: string
  body: Buffer | Uint8Array | string
  bucketName?: string
  contentType?: string
  contentEncoding?: string
  metadata?: Record<string, string>
}

export type PutS3FileResult = S3FileReference & {
  fileName?: string
  contentType?: string
  sizeBytes: number
}

export type GetS3FileInput =
  | {
      storageUri: string
      bucketName?: never
      s3Key?: never
    }
  | {
      storageUri?: never
      bucketName: string
      s3Key: string
    }

export type GetS3FileResult = S3FileReference & {
  body: Buffer
  contentType?: string
  contentEncoding?: string
  metadata?: Record<string, string>
  sizeBytes: number
}

export type S3FileClientOptions = {
  region?: string
  defaultBucketName?: string
  endpoint?: string
  isForcePathStyle?: boolean
  accessKeyId?: string
  secretAccessKey?: string
  sessionToken?: string
}
