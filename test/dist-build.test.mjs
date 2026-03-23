import assert from 'node:assert/strict'
import test from 'node:test'

test('dist root entry imports successfully', async () => {
  const mod = await import('../dist/index.js')

  assert.equal(typeof mod.ResourceQueryClient, 'function')
  assert.equal(typeof mod.ResourceOntologyClient, 'function')
  assert.equal(typeof mod.createMastraResourceQueryTool, 'function')
  assert.equal(typeof mod.createMastraResourceOntologyTool, 'function')
  assert.equal(typeof mod.S3FileClient, 'function')
  assert.equal(typeof mod.parseS3StorageUri, 'function')
  assert.equal(typeof mod.toS3StorageUri, 'function')
})

test('dist mastra subpath imports successfully', async () => {
  const mod = await import('../dist/mastra/index.js')

  assert.equal(typeof mod.createMastraResourceQueryTool, 'function')
  assert.equal(typeof mod.createMastraResourceOntologyTool, 'function')
})

test('dist resource-query subpath imports successfully', async () => {
  const mod = await import('../dist/resource-query/client.js')

  assert.equal(typeof mod.ResourceQueryClient, 'function')
})

test('dist resource-ontology subpath imports successfully', async () => {
  const mod = await import('../dist/resource-ontology/client.js')

  assert.equal(typeof mod.ResourceOntologyClient, 'function')
})

test('dist s3 subpath imports successfully', async () => {
  const mod = await import('../dist/s3/client.js')

  assert.equal(typeof mod.S3FileClient, 'function')
  assert.equal(typeof mod.parseS3StorageUri, 'function')
  assert.equal(typeof mod.toS3StorageUri, 'function')
})

test('s3 URI helpers parse and format values', async () => {
  const { parseS3StorageUri, toS3StorageUri } = await import('../dist/s3/client.js')
  const storageUri = toS3StorageUri('bucket-a', 'folder/file.txt')
  const parsed = parseS3StorageUri(storageUri)

  assert.equal(storageUri, 's3://bucket-a/folder/file.txt')
  assert.deepEqual(parsed, {
    bucketName: 'bucket-a',
    s3Key: 'folder/file.txt',
  })
})

test('parseS3StorageUri throws on invalid values', async () => {
  const { parseS3StorageUri } = await import('../dist/s3/client.js')

  assert.throws(() => parseS3StorageUri('http://bucket/key'))
  assert.throws(() => parseS3StorageUri('s3://missing-key'))
})

test('S3FileClient putFile and getFile can be exercised with mocked transport', async () => {
  const { S3FileClient } = await import('../dist/s3/client.js')
  const client = new S3FileClient({
    defaultBucketName: 'sample-bucket',
    region: 'us-east-1',
  })
  const sendCalls = []

  client.client = {
    send: async (command) => {
      sendCalls.push(command)

      if (command.constructor.name === 'PutObjectCommand') {
        return {}
      }

      if (command.constructor.name === 'GetObjectCommand') {
        return {
          Body: {
            transformToByteArray: async () => Uint8Array.from([79, 75]),
          },
          ContentType: 'text/plain',
        }
      }

      throw new Error('Unexpected command')
    },
  }

  const putResult = await client.putFile({
    s3Key: 'folder/output.json',
    body: '{"ok":true}',
    contentType: 'application/json',
  })

  assert.equal(putResult.bucketName, 'sample-bucket')
  assert.equal(putResult.s3Key, 'folder/output.json')
  assert.equal(putResult.storageUri, 's3://sample-bucket/folder/output.json')
  assert.equal(putResult.fileName, 'output.json')
  assert.equal(putResult.contentType, 'application/json')

  const getResult = await client.getFile({
    storageUri: 's3://sample-bucket/folder/output.json',
  })

  assert.equal(getResult.bucketName, 'sample-bucket')
  assert.equal(getResult.s3Key, 'folder/output.json')
  assert.equal(getResult.contentType, 'text/plain')
  assert.equal(getResult.body.toString('utf8'), 'OK')
  assert.equal(sendCalls.length, 2)
})

test('mastra adapter returns a tool definition through the provided factory', async () => {
  const { createMastraResourceOntologyTool, createMastraResourceQueryTool } =
    await import('../dist/mastra/index.js')
  const queryTool = createMastraResourceQueryTool({
    toolFactory: (definition) => definition,
  })
  const ontologyTool = createMastraResourceOntologyTool({
    toolFactory: (definition) => definition,
  })

  assert.equal(typeof queryTool.description, 'string')
  assert.equal(typeof queryTool.execute, 'function')
  assert.deepEqual(queryTool.inputSchema.safeParse({ sql: 'select 1', limit: 1 }).success, true)

  assert.equal(typeof ontologyTool.description, 'string')
  assert.equal(typeof ontologyTool.execute, 'function')
  assert.deepEqual(ontologyTool.inputSchema.safeParse({}).success, true)
})

test('resource ontology schema parses the introspected resource payload', async () => {
  const { ResourceOntologyResponseSchema } = await import('../dist/resource-ontology/schemas.js')
  const parsed = ResourceOntologyResponseSchema.parse({
    tables: [
      {
        name: 'users',
        columns: [
          {
            name: 'id',
            dataType: 'uuid',
          },
          {
            name: 'profile',
            dataType: 'jsonb',
            jsonSchema: {
              type: 'object',
              properties: {
                email: { type: 'string' },
              },
            },
          },
        ],
      },
    ],
    relations: [
      {
        sourceTable: 'users',
        sourceColumns: ['id'],
        targetTable: 'accounts',
        targetColumns: ['user_id'],
      },
    ],
  })

  assert.equal(parsed.tables[0].name, 'users')
})
