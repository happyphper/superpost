import type { FrontMatter } from './types'

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function isSafeInlineHtml(value: string) {
  const normalized = value.trim()
  if (!/^<([a-z][\w-]*)(?:\s[^>]*)?>[\s\S]*<\/\1>$|^<(br|hr|img)(?:\s[^>]*)?\/?>$/i.test(normalized)) {
    return false
  }
  if (/<\/?(script|style|iframe|object|embed|link|meta|form|input|textarea|button)\b/i.test(normalized)) {
    return false
  }
  if (/\son\w+\s*=/i.test(normalized)) return false
  if (/javascript\s*:/i.test(normalized)) return false
  return true
}

export function formatDateStamp(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

export function formatChineseDateStamp(date = new Date()) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export function getShareLabel(date = new Date()) {
  return date.getHours() >= 18 ? 'EVENING SHARE' : 'MORNING SHARE'
}

export function parseFrontMatter(markdown: string): { meta: FrontMatter; content: string } {
  if (!markdown.startsWith('---')) return { meta: {}, content: markdown }
  const lines = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  if (lines[0].trim() !== '---') return { meta: {}, content: markdown }
  const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === '---')
  if (endIndex < 0) return { meta: {}, content: markdown }

  const meta: FrontMatter = {}
  lines.slice(1, endIndex).forEach((line) => {
    const match = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/)
    if (!match) return
    const key = match[1].trim()
    const rawValue = match[2].trim().replace(/^['"]|['"]$/g, '')
    if (key === 'title') meta.title = rawValue
    if (key === 'author') meta.author = rawValue
    if (key === 'title_hide') meta.titleHide = rawValue.toLowerCase() === 'true'
    if (key === 'date') meta.date = parseFrontMatterDate(rawValue)
  })

  return {
    meta,
    content: lines.slice(endIndex + 1).join('\n').trimStart()
  }
}

export function parseFrontMatterDate(value: string) {
  const match = value.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/
  )
  if (!match) {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }
  const [, year, month, day, hour = '0', minute = '0', second = '0'] = match
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  )
}
