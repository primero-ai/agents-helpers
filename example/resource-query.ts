import { ResourceQueryClient } from '../src/resource-query/client'

const main = async () => {
  const client = new ResourceQueryClient()

  const result = await client.query({
    sql: 'select 1 as ok',
    limit: 1,
  })

  console.log('columns:', result.columns)
  console.log('rowCount:', result.rowCount)
  console.log('rows:', result.rows)
}

main().catch((error) => {
  console.error('Resource query failed:', error)
  process.exitCode = 1
})
