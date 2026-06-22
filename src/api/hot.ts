import { http } from './http'

export interface HotPlatformConfig {
  name: string
  weight: number
  enabled: boolean
}

export interface HotConfig {
  platforms: HotPlatformConfig[]
  default_count: number
}

export interface HotTopic {
  platform: string
  title: string
  rank: number
  heat: string
  url: string
  source: string
}

export interface HotTopicsResponse {
  platform: string
  updated_at: number
  topics: HotTopic[]
}

export async function getHotConfig() {
  const { data } = await http.get<HotConfig>('/hot/config')
  return data
}

export async function saveHotConfig(payload: HotConfig) {
  const { data } = await http.put<HotConfig>('/hot/config', payload)
  return data
}

export async function getHotTopics(platform?: string, count = 10) {
  const { data } = await http.get<HotTopicsResponse>('/hot/topics', {
    params: { platform, count }
  })
  return data
}

export async function pickHotTopic(count = 5) {
  const { data } = await http.get<{ platform: string; topic: HotTopic; updated_at: number }>(
    '/hot/pick',
    { params: { count } }
  )
  return data
}
