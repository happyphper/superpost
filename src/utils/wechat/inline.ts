import type { Theme } from './types'
import { escapeHtml } from './helpers'
import { renderMathSvg } from './math'

export function inlineFormat(text: string, theme: Theme): string {
  const placeholders: string[] = []
  const stash = (value: string) => {
    placeholders.push(value)
    return `@@SP_${placeholders.length - 1}@@`
  }
  const imageStyle =
    theme.variant === 'agentBuilder'
      ? `display: block; width: 100%; max-width: 100%; box-sizing: border-box; border: 1px solid ${theme.border}; border-radius: 4px; background: #ffffff; box-shadow: 0 12px 28px rgba(15, 23, 42, 0.10), 0 2px 8px rgba(79, 70, 229, 0.08);`
      : 'display: block; width: 100%; max-width: 100%; border-radius: 6px;'

  let value = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt: string, src: string) =>
    stash(
      `<section style="margin: ${theme.variant === 'agentBuilder' ? '0 0 18px' : '0'};"><img src="${escapeHtml(src)}" alt="${escapeHtml(
        alt
      )}" style="${imageStyle}" /></section>`
    )
  )

  value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, url: string) =>
    stash(
      `<a href="${escapeHtml(url)}" style="color: ${theme.primary}; text-decoration: none;">${inlineFormat(
        label,
        theme
      )}</a>`
    )
  )

  value = value.replace(/`([^`]+)`/g, (_, code: string) =>
    stash(
      `<code style="font-size: 13px; padding: 2px 5px; border-radius: 4px; background: ${theme.soft}; color: ${theme.primary};">${escapeHtml(
        code
      )}</code>`
    )
  )

  value = value.replace(/(^|[^\\])\$(?!\$)(.+?)(?<!\\)\$/g, (_match, prefix: string, formula: string) =>
    `${prefix}${stash(renderMathSvg(formula, theme, false))}`
  )

  value = escapeHtml(value)
  value = value.replace(
    /\*\*\*(.+?)\*\*\*/g,
    `<strong style="font-weight: 700; color: ${theme.text};"><span style="display: inline-block; font-style: italic; transform: skewX(-7deg); transform-origin: left center;">$1</span></strong>`
  )
  value = value.replace(
    /\*\*(.+?)\*\*/g,
    `<strong style="font-weight: 700; color: ${theme.text};">$1</strong>`
  )
  value = value.replace(
    /~{1,2}([^~]+?)~~/g,
    '<span style="text-decoration: line-through; color: #94a3b8;">$1</span>'
  )
  value = value.replace(
    /(?<!\*)\*([^*]+)\*(?!\*)/g,
    `<span style="display: inline-block; font-style: italic; transform: skewX(-7deg); transform-origin: left center; color: ${theme.muted};">$1</span>`
  )

  placeholders.forEach((placeholder, index) => {
    value = value.replace(`@@SP_${index}@@`, placeholder)
  })
  return value
}
