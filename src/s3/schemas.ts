import { z } from 'zod'

export const S3StorageUriSchema = z
  .string()
  .trim()
  .regex(/^s3:\/\/[^/]+\/.+$/, 'Expected s3://<bucket>/<key> URI')

export const S3FileReferenceSchema = z.object({
  bucketName: z.string().trim().min(1),
  s3Key: z.string().trim().min(1),
  storageUri: S3StorageUriSchema,
  sizeBytes: z.number().int().nonnegative(),
  contentType: z.string().trim().min(1).optional(),
  fileName: z.string().trim().min(1).optional(),
})

export function createS3FileInputSchema(input: { accept?: string } = {}) {
  return S3StorageUriSchema.meta({
    format: 'file',
    'x-ui-field': 'file',
    ...(typeof input.accept === 'string' && input.accept.trim().length > 0
      ? { 'x-accept': input.accept.trim() }
      : {}),
  })
}

export function createS3FilesInputSchema(input: { accept?: string } = {}) {
  return createS3FileInputSchema(input).array()
}

export const S3MessagePointerSchema = z.object({
  storageUri: S3StorageUriSchema,
})

export const PutS3FileInputSchema = z.object({
  s3Key: z.string().trim().min(1),
  body: z.union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()]),
  bucketName: z.string().trim().min(1).optional(),
  contentType: z.string().trim().min(1).optional(),
  contentEncoding: z.string().trim().min(1).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
})

export const GetS3FileInputSchema = z.union([
  z.object({
    storageUri: S3StorageUriSchema,
  }),
  z.object({
    bucketName: z.string().trim().min(1),
    s3Key: z.string().trim().min(1),
  }),
])
