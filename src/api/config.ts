import { http } from './http'

export interface AIProviderConfig {
  key: string
  api_keys: string[]
  api_key_index: number
  api_base: string
  models: string[]
  model_index: number
  max_tokens: number
}

export interface AIConfig {
  api_type: string
  providers: Record<string, AIProviderConfig>
}

export interface AIConfigTestResult {
  success: boolean
  provider: string
  model: string
  message: string
  response: string
}

export async function getAIConfig() {
  const { data } = await http.get<AIConfig>('/config/ai')
  return data
}

export async function saveAIConfig(payload: AIConfig) {
  const { data } = await http.put<AIConfig>('/config/ai', payload)
  return data
}

export async function testAIConfig(payload: AIConfig) {
  const { data } = await http.post<AIConfigTestResult>('/config/ai/test', payload)
  return data
}
