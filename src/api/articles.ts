import { http } from './http'

export interface GenerateArticleRequest {
  topic: string
  style: string
  word_count: number
}

export interface GenerateArticleResponse {
  title: string
  summary: string
  content: string
}

export async function generateArticle(payload: GenerateArticleRequest) {
  const { data } = await http.post<GenerateArticleResponse>('/articles/generate', payload)
  return data
}

export async function healthCheck() {
  const { data } = await http.get<{ status: string }>('/health')
  return data
}
