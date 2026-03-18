import test from 'node:test'
import assert from 'node:assert/strict'

test('dist root entry imports successfully', async () => {
  const mod = await import('../dist/index.js')

  assert.equal(typeof mod.ResourceQueryClient, 'function')
  assert.equal(typeof mod.ResourceOntologyClient, 'function')
  assert.equal(typeof mod.createMastraResourceQueryTool, 'function')
  assert.equal(typeof mod.createMastraResourceOntologyTool, 'function')
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
