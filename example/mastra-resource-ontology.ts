import { tool } from 'ai'
import { Agent } from '@mastra/core/agent'
import { openai } from '@ai-sdk/openai'
import { createMastraResourceOntologyTool } from '../src/mastra'

const primeroResourceOntology = createMastraResourceOntologyTool({
  toolFactory: tool,
  baseUrl: process.env.PRIMERO_API_BASE_URL,
  tokenId: process.env.PRIMERO_API_KEY_ID,
  tokenSecret: process.env.PRIMERO_API_KEY_SECRET,
})

const agent = new Agent({
  name: 'Primero Ontology Explorer',
  instructions: 'Use primeroResourceOntology when you need the Primero resource ontology.',
  model: openai('gpt-4.1-mini'),
  tools: {
    primeroResourceOntology,
  },
})

const main = async () => {
  const response = await agent.generate(
    'Use primeroResourceOntology and summarize the ontology that comes back.',
  )

  console.log(response.text)
}

main().catch((error) => {
  console.error('Mastra resource ontology failed:', error)
  process.exitCode = 1
})
