import { tool } from 'ai'
import { Agent } from '@mastra/core/agent'
import { openai } from '@ai-sdk/openai'
import { createMastraResourceQueryTool } from '../src/mastra'

const primeroResourceQuery = createMastraResourceQueryTool({
  toolFactory: tool,
  baseUrl: process.env.PRIMERO_API_BASE_URL,
  tokenId: process.env.PRIMERO_API_KEY_ID,
  tokenSecret: process.env.PRIMERO_API_KEY_SECRET,
})

const agent = new Agent({
  name: 'Primero Analyst',
  instructions:
    'Use the primeroResourceQuery tool when you need data from Primero resources. Prefer small limits.',
  model: openai('gpt-4.1-mini'),
  tools: {
    primeroResourceQuery,
  },
})

const main = async () => {
  const response = await agent.generate(
    'Use primeroResourceQuery to run "select 1 as ok" with limit 1 and summarize the result.',
  )

  console.log(response.text)
}

main().catch((error) => {
  console.error('Mastra resource query failed:', error)
  process.exitCode = 1
})
