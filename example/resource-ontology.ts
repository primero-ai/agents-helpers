import { ResourceOntologyClient } from '../src/resource-ontology/client'

const main = async () => {
  const client = new ResourceOntologyClient()
  const ontology = await client.get()

  console.log('ontology:', ontology)
}

main().catch((error) => {
  console.error('Resource ontology failed:', error)
  process.exitCode = 1
})
