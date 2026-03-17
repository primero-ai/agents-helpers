import test from 'node:test'
import assert from 'node:assert/strict'

test('dist root entry imports successfully', async () => {
  const mod = await import('../dist/index.js')

  assert.equal(typeof mod.ResourceQueryClient, 'function')
  assert.equal(typeof mod.createMastraResourceQueryTool, 'function')
})

test('dist mastra subpath imports successfully', async () => {
  const mod = await import('../dist/mastra/index.js')

  assert.equal(typeof mod.createMastraResourceQueryTool, 'function')
})

test('dist resource-query subpath imports successfully', async () => {
  const mod = await import('../dist/resource-query/client.js')

  assert.equal(typeof mod.ResourceQueryClient, 'function')
})

test('mastra adapter returns a tool definition through the provided factory', async () => {
  const { createMastraResourceQueryTool } = await import('../dist/mastra/index.js')

  const tool = createMastraResourceQueryTool({
    toolFactory: (definition) => definition,
  })

  assert.equal(typeof tool.description, 'string')
  assert.equal(typeof tool.execute, 'function')
  assert.deepEqual(tool.inputSchema.safeParse({ sql: 'select 1', limit: 1 }).success, true)
})
