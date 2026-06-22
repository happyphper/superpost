import type { BlockLabel, FrontMatter, ListItem, QuoteTone, Theme, TocItem } from './types'
import { escapeHtml, formatDateStamp } from './helpers'
import { inlineFormat } from './inline'
import { renderMathSvg } from './math'

const chineseSectionNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

export function renderParagraph(parts: string[], theme: Theme) {
  const text = parts.map((item) => item.trim()).filter(Boolean).join(' ')
  if (!text) return ''
  if (theme.variant === 'agentBuilder') {
    return `<section style="margin: 0 0 14px; padding: 0; font-size: 16px; line-height: 1.85; color: ${theme.muted}; text-align: justify; font-weight: 500;">${inlineFormat(
      text,
      theme
    )}</section>`
  }
  if (theme.variant === 'education') {
    return `<section style="margin: 0 0 14px; padding: 0; font-size: 16px; line-height: 1.9; color: ${theme.text}; text-align: justify;">${inlineFormat(
      text,
      theme
    )}</section>`
  }
  if (theme.variant === 'light') {
    return `<section style="margin: 0 0 14px; padding: 0; font-size: 16px; line-height: 1.9; color: ${theme.text}; text-align: justify;">${inlineFormat(
      text,
      theme
    )}</section>`
  }
  return `<section style="margin: 0 0 14px; padding: 0; font-size: 16px; line-height: 1.85; color: ${theme.text}; text-align: justify;">${inlineFormat(
    text,
    theme
  )}</section>`
}

export function renderHeading(
  line: string,
  theme: Theme,
  sectionIndex = 0,
  meta: FrontMatter = {},
  headingLabel?: BlockLabel,
  showSectionNumbers = false
) {
  const match = line.match(/^(#{1,6})\s+(.+)$/)
  if (!match) return ''
  const level = Math.min(match[1].length, 3)
  const title = inlineFormat(match[2].trim(), theme)
  const shouldHideTitle = Boolean(meta.titleHide && meta.title === match[2].trim() && level === 1)

  if (theme.variant === 'agentBuilder') {
    if (level === 1) {
      if (shouldHideTitle) {
        return ''
      }
      const labelHtml = headingLabel?.text
        ? `<p style="margin: 0 0 8px; padding: 0; color: ${theme.primary}; font-size: 13px; line-height: 1.35; font-weight: 800; letter-spacing: 1px; text-align: ${headingLabel.align};">${inlineFormat(
            headingLabel.text,
            theme
          )}</p>`
        : ''
      return `<section style="margin: 18px 0 12px; padding: 0;">${labelHtml}<h1 style="margin: 0; padding: 0; font-size: 24px; line-height: 1.35; font-weight: 800; color: ${theme.text}; letter-spacing: 0;">${title}</h1></section>`
    }
    if (level === 2) {
      const number = chineseSectionNumbers[sectionIndex - 1] || String(sectionIndex)
      const prefix = showSectionNumbers ? `${number}、` : ''
      return `<section style="margin: 20px 0 12px; padding: 0 0 8px; border-bottom: 1px solid ${theme.border};"><h2 style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', 'Songti SC', SimSun, serif; font-size: 21px; line-height: 1.4; font-weight: 800; color: ${theme.text};">${prefix}${title}</h2></section>`
    }
    return `<section style="margin: 18px 0 10px; padding: 0;"><h3 style="margin: 0; padding: 0; font-size: 18px; line-height: 1.45; font-weight: 800; color: ${theme.text};">${title}</h3></section>`
  }

  if (shouldHideTitle) return ''

  if (theme.variant === 'analytics') {
    if (level === 1) {
      return `<section style="margin: 2px 0 24px; padding: 0 0 0 14px; border-left: 4px solid ${theme.primary};"><h1 style="margin: 0; font-size: 21px; line-height: 1.55; font-weight: 800; color: ${theme.text}; letter-spacing: 0;">${title}</h1><span style="display: block; width: 72px; height: 3px; margin-top: 12px; border-radius: 999px; background: linear-gradient(90deg, ${theme.primary}, ${theme.accent});"></span></section>`
    }
    if (level === 2) {
      return `<section style="margin: 26px 0 14px; padding: 0 0 0 12px; border-left: 4px solid ${theme.primary};"><h2 style="margin: 0; font-size: 19px; line-height: 1.45; font-weight: 800; color: ${theme.text};">${title}</h2><span style="display: block; width: 64px; height: 3px; margin-top: 8px; border-radius: 999px; background: linear-gradient(90deg, ${theme.primary}, ${theme.accent});"></span></section>`
    }
    return `<section style="margin: 20px 0 12px; padding: 10px 12px; border: 1px solid ${theme.border}; border-radius: 8px; background: ${theme.surface};"><h3 style="margin: 0; font-size: 17px; line-height: 1.45; font-weight: 700; color: ${theme.text};">${title}</h3></section>`
  }

  if (theme.variant === 'education') {
    if (level === 1) {
      return `<section style="margin: 4px 0 26px; padding: 18px 18px 16px; border: 2px solid ${theme.border}; border-radius: 18px; background: linear-gradient(135deg, #ffffff, ${theme.soft}); box-shadow: 6px 8px 0 rgba(79,70,229,0.14), inset -3px -3px 10px rgba(79,70,229,0.08), inset 3px 3px 10px rgba(255,255,255,0.92);"><span style="display: block; width: 58px; height: 8px; margin: 0 0 14px; border-radius: 999px; background: linear-gradient(90deg, ${theme.primary}, #38bdf8, ${theme.accent});"></span><h1 style="margin: 0; font-size: 22px; line-height: 1.55; font-weight: 800; color: ${theme.text}; letter-spacing: 0;">${title}</h1></section>`
    }
    if (level === 2) {
      return `<section style="margin: 26px 0 14px; padding: 12px 14px; border: 2px solid ${theme.border}; border-radius: 16px; background: #ffffff; box-shadow: 4px 5px 0 rgba(249,115,22,0.16), inset -2px -2px 8px rgba(79,70,229,0.06);"><h2 style="margin: 0; font-size: 19px; line-height: 1.45; font-weight: 800; color: ${theme.text};">${title}</h2></section>`
    }
    return `<section style="margin: 20px 0 12px; padding: 0 0 0 12px; border-left: 4px solid ${theme.accent};"><h3 style="margin: 0; font-size: 17px; line-height: 1.5; font-weight: 800; color: ${theme.text};">${title}</h3></section>`
  }

  if (theme.variant === 'light') {
    const style = theme.style || ''
    if (level === 1) {
      if (style.includes('Brutalism')) {
        return `<section style="margin: 4px 0 24px; padding: 16px; border: 3px solid ${theme.text}; background: ${theme.background}; box-shadow: 6px 6px 0 ${theme.accent};"><h1 style="margin: 0; font-size: 22px; line-height: 1.5; font-weight: 900; color: ${theme.text}; letter-spacing: 0;">${title}</h1></section>`
      }
      if (style.includes('Glassmorphism') || style.includes('Liquid Glass')) {
        return `<section style="margin: 4px 0 24px; padding: 16px 16px 15px; border: 1px solid ${theme.border}; border-radius: 12px; background: rgba(255,255,255,0.88); box-shadow: 0 12px 28px rgba(15,23,42,0.08);"><span style="display: block; width: 46px; height: 4px; margin: 0 0 12px; border-radius: 999px; background: linear-gradient(90deg, ${theme.primary}, ${theme.accent});"></span><h1 style="margin: 0; font-size: 21px; line-height: 1.55; font-weight: 800; color: ${theme.text}; letter-spacing: 0;">${title}</h1></section>`
      }
      if (style.includes('Soft UI') || style.includes('Neumorphism')) {
        return `<section style="margin: 4px 0 24px; padding: 17px 16px; border-radius: 16px; background: ${theme.background}; box-shadow: 8px 8px 18px rgba(15,23,42,0.08), -6px -6px 16px rgba(255,255,255,0.88);"><h1 style="margin: 0; font-size: 21px; line-height: 1.55; font-weight: 800; color: ${theme.text}; letter-spacing: 0;">${title}</h1><span style="display: block; width: 68px; height: 3px; margin-top: 12px; border-radius: 999px; background: ${theme.primary};"></span></section>`
      }
      if (style.includes('Trust & Authority')) {
        return `<section style="margin: 2px 0 24px; padding: 0 0 14px; border-bottom: 2px solid ${theme.accent};"><h1 style="margin: 0; font-size: 22px; line-height: 1.55; font-weight: 800; color: ${theme.text}; letter-spacing: 0;">${title}</h1></section>`
      }
      return `<section style="margin: 2px 0 24px; padding: 0 0 0 13px; border-left: 4px solid ${theme.primary};"><h1 style="margin: 0; font-size: 21px; line-height: 1.55; font-weight: 800; color: ${theme.text}; letter-spacing: 0;">${title}</h1><span style="display: block; width: 68px; height: 3px; margin-top: 12px; border-radius: 999px; background: linear-gradient(90deg, ${theme.primary}, ${theme.accent});"></span></section>`
    }
    if (level === 2) {
      return `<section style="margin: 25px 0 14px; padding: 0 0 0 12px; border-left: 4px solid ${theme.primary};"><h2 style="margin: 0; font-size: 19px; line-height: 1.45; font-weight: 800; color: ${theme.text};">${title}</h2></section>`
    }
    return `<section style="margin: 20px 0 12px;"><h3 style="margin: 0; font-size: 17px; line-height: 1.5; font-weight: 800; color: ${theme.text};">${title}</h3><span style="display: block; width: 38px; height: 2px; margin-top: 7px; border-radius: 999px; background: ${theme.accent};"></span></section>`
  }

  const sizes: Record<number, string> = { 1: '22px', 2: '19px', 3: '17px' }
  const margins: Record<number, string> = {
    1: '30px 0 18px',
    2: '24px 0 14px',
    3: '20px 0 12px'
  }
  return `<section style="margin: ${margins[level]};"><h${level} style="margin: 0; font-size: ${sizes[level]}; line-height: 1.45; font-weight: 700; color: ${theme.text};">${inlineFormat(
    match[2].trim(),
    theme
  )}</h${level}></section>`
}

export function renderTitleBlock(lines: string[], theme: Theme, titleLabel?: BlockLabel) {
  const rawTitle = lines.map((line) => line.trim()).filter(Boolean).join(' ')
  if (!rawTitle) return ''
  const title = inlineFormat(rawTitle.replace(/^#\s+/, ''), theme)
  if (theme.variant === 'agentBuilder') {
    const labelHtml = titleLabel?.text
      ? `<p style="margin: 0 0 8px; padding: 0; max-width: 100%; overflow: hidden; color: ${theme.primary}; font-size: 13px; line-height: 1.35; font-weight: 800; letter-spacing: 1px; white-space: nowrap; text-align: ${titleLabel.align};">${inlineFormat(
          titleLabel.text,
          theme
        )}</p>`
      : ''
    return `<section style="margin: 0 0 22px; padding: 0;">${labelHtml}<h1 style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', 'Songti SC', SimSun, serif; font-size: 31px; line-height: 1.18; font-weight: 800; color: ${theme.text}; letter-spacing: 0;">${title}</h1><section style="display: block; margin: 8px 0 0; padding: 0; line-height: 0; font-size: 0;"><span style="display: inline-block; width: 58%; height: 4px; margin: 0; padding: 0; background: ${theme.accent}; vertical-align: top;"></span><span style="display: inline-block; width: 14%; height: 4px; margin: 0; padding: 0; background: linear-gradient(90deg, ${theme.accent}, rgba(129,140,248,0)); vertical-align: top;"></span></section></section>`
  }
  return renderHeading(`# ${rawTitle.replace(/^#\s+/, '')}`, theme)
}

export function renderHeader(lines: string[], theme: Theme) {
  const customText = lines.map((line) => line.trim()).filter(Boolean).join(' ')
  const text = customText || `DAILY SHARE / ${formatDateStamp(new Date())}`
  if (theme.variant === 'agentBuilder') {
    return `<section style="margin: 0 0 22px; padding: 0 0 22px; border-bottom: 1px solid ${theme.border};"><span style="display: inline-block; margin-right: 8px; color: ${theme.primary}; font-size: 18px; line-height: 1;">▣</span><span style="display: inline-block; color: #94a3b8; font-size: 15px; line-height: 1.6; font-weight: 700; letter-spacing: 1px;">${inlineFormat(
      text,
      theme
    )}</span></section>`
  }
  return `<section style="margin: 0 0 18px; padding: 0 0 12px; border-bottom: 1px solid ${theme.border || theme.soft};"><span style="display: inline-block; margin-right: 8px; color: ${theme.primary}; font-size: 16px; line-height: 1;">▣</span><span style="display: inline-block; color: ${theme.muted}; font-size: 14px; line-height: 1.6; font-weight: 700; letter-spacing: 1px;">${inlineFormat(
    text,
    theme
  )}</span></section>`
}

function parseQuoteToneLine(line: string): { tone: QuoteTone; text: string } | null {
  const value = line.replace(/^>+/, '').trim()
  const iconMatch = value.match(/^!\[([A-Za-z]+)]\s*(.*)$/)
  const bracketMatch = value.match(/^\[([A-Za-z]+)]\s*(.*)$/)
  const match = iconMatch || bracketMatch
  if (!match) return null
  const rawTone = match[1].toLowerCase()
  const toneMap: Record<string, QuoteTone> = {
    primary: 'primary',
    blue: 'primary',
    info: 'info',
    gray: 'info',
    grey: 'info',
    tip: 'success',
    success: 'success',
    ok: 'success',
    warning: 'warning',
    warn: 'warning',
    danger: 'danger',
    error: 'danger',
    default: 'default'
  }
  const tone = toneMap[rawTone]
  if (!tone) return null
  return { tone, text: match[2].trim() }
}

function getQuoteToneStyle(tone: QuoteTone, theme: Theme) {
  const styles: Record<QuoteTone, { label: string; color: string; bg: string; text: string }> = {
    default: {
      label: 'QUOTE',
      color: theme.accent || theme.primary,
      bg: 'rgba(248,250,252,0.86)',
      text: '#64748b'
    },
    primary: {
      label: 'PRIMARY',
      color: theme.primary,
      bg: 'rgba(239,246,255,0.94)',
      text: '#2563eb'
    },
    success: {
      label: 'SUCCESS',
      color: '#52c41a',
      bg: 'rgba(240,249,235,0.94)',
      text: '#3f8f1f'
    },
    info: {
      label: 'INFO',
      color: '#909399',
      bg: 'rgba(244,244,245,0.95)',
      text: '#73767a'
    },
    warning: {
      label: 'WARNING',
      color: '#e6a23c',
      bg: 'rgba(253,246,236,0.95)',
      text: '#b7791f'
    },
    danger: {
      label: 'DANGER',
      color: '#ff4d4f',
      bg: 'rgba(254,240,240,0.95)',
      text: '#f56c6c'
    }
  }
  return styles[tone]
}

export function renderQuote(lines: string | string[], theme: Theme, quoteLabel?: BlockLabel) {
  const quoteLines = (Array.isArray(lines) ? lines : [lines])
    .map((line) => line.replace(/^>+/, '').trim())
    .filter(Boolean)
  const toneMarker = quoteLines.length ? parseQuoteToneLine(`> ${quoteLines[0]}`) : null
  const tone = toneMarker?.tone || 'default'
  const contentLines = toneMarker
    ? [toneMarker.text, ...quoteLines.slice(1)].filter(Boolean)
    : quoteLines
  const text = contentLines.map((line) => inlineFormat(line, theme)).join('<br />')
  if (!text) return ''
  if (theme.variant === 'agentBuilder') {
    const toneStyle = getQuoteToneStyle(tone, theme)
    const label = quoteLabel?.text ? escapeHtml(quoteLabel.text) : ''
    const align = quoteLabel?.align || 'left'
    const labelHtml = label
      ? `<p style="margin: 0 0 5px; padding: 0; font-size: 11px; line-height: 1.45; color: ${toneStyle.color}; font-weight: 900; letter-spacing: 1.3px; text-align: ${align};"><span style="display: inline-block; width: 7px; height: 7px; margin-right: 7px; border-radius: 999px; background: ${toneStyle.color}; vertical-align: 1px;"></span>${label}</p>`
      : ''
    const defaultStyle =
      tone === 'default'
        ? `border-left: 3px solid ${toneStyle.color}; border-radius: 0 6px 6px 0; background: ${toneStyle.bg}; box-shadow: inset 0 0 0 1px rgba(148,163,184,0.14);`
        : `border-left: 3px solid ${toneStyle.color}; border-radius: 4px; background: ${toneStyle.bg}; box-shadow: inset 0 0 0 1px rgba(148,163,184,0.08);`
    return `<section style="margin: 0 0 16px; padding: 10px 13px; ${defaultStyle}">${labelHtml}<p style="margin: 0; padding: 0; font-size: 14px; line-height: 1.72; color: ${toneStyle.text}; font-weight: 600; text-align: justify;">${text}</p></section>`
  }
  if (theme.variant === 'analytics') {
    const toneStyle = getQuoteToneStyle(tone, theme)
    return `<section style="margin: 18px 0; padding: 14px 16px; border: 1px solid ${theme.border}; border-left: 4px solid ${toneStyle.color}; border-radius: 8px; background: ${toneStyle.bg}; box-shadow: 0 8px 20px rgba(15,23,42,0.06);"><p style="margin: 0; font-size: 15px; line-height: 1.85; color: ${theme.muted};">${text}</p></section>`
  }
  if (theme.variant === 'education') {
    const toneStyle = getQuoteToneStyle(tone, theme)
    return `<section style="margin: 18px 0; padding: 14px 16px; border: 2px solid ${toneStyle.color}; border-radius: 16px; background: ${toneStyle.bg}; box-shadow: 4px 5px 0 rgba(79,70,229,0.12), inset -2px -2px 8px rgba(79,70,229,0.05);"><p style="margin: 0; font-size: 15px; line-height: 1.85; color: ${theme.muted};">${text}</p></section>`
  }
  if (theme.variant === 'light') {
    const toneStyle = getQuoteToneStyle(tone, theme)
    return `<section style="margin: 18px 0; padding: 13px 15px; border-left: 4px solid ${toneStyle.color}; border-radius: 8px; background: ${toneStyle.bg};"><p style="margin: 0; font-size: 15px; line-height: 1.85; color: ${theme.muted};">${text}</p></section>`
  }
  const toneStyle = getQuoteToneStyle(tone, theme)
  return `<section style="margin: 18px 0; padding: 12px 14px; border-left: 4px solid ${toneStyle.color}; background: ${toneStyle.bg};"><p style="margin: 0; font-size: 15px; line-height: 1.8; color: ${theme.muted};">${text}</p></section>`
}

export function renderCard(
  lines: string[],
  theme: Theme,
  cardLabel?: BlockLabel
) {
  const body = lines
    .map((line) => line.replace(/^>+/, '').trim())
    .map((line) =>
      line
        ? `<p style="margin: 0 0 8px; padding: 0; font-size: ${theme.variant === 'agentBuilder' ? '17px' : '15px'}; line-height: ${theme.variant === 'agentBuilder' ? '1.85' : '1.8'}; color: ${theme.variant === 'agentBuilder' ? theme.text : theme.muted}; font-weight: ${theme.variant === 'agentBuilder' ? '700' : '400'}; text-align: justify;">${inlineFormat(
            line,
            theme
          )}</p>`
        : ''
    )
    .join('')
  if (!body) return ''
  if (theme.variant === 'agentBuilder') {
    const label = cardLabel?.text ? escapeHtml(cardLabel.text) : 'CORE PHILOSOPHY'
    const align = cardLabel?.align || 'left'
    const labelHtml = `<p style="margin: 0; padding: 0; color: ${theme.primary}; font-size: 13px; line-height: 1.35; font-weight: 900; letter-spacing: 2px; text-align: ${align};"><span style="display: inline-block; width: 10px; height: 10px; margin-right: 9px; border-radius: 999px; background: #a5b4fc; vertical-align: 1px;"></span>${label}</p>`
    return `<section style="margin: 0 0 18px; padding: 18px 20px 10px; border: 1px solid #dbe5f2; border-radius: 0; background: rgba(255,255,255,0.82); box-shadow: 0 6px 16px rgba(15,23,42,0.05);">${labelHtml}<section style="display: block; height: 12px; margin: 0; padding: 0; line-height: 0; font-size: 0; overflow: hidden;"></section><section style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', 'Songti SC', SimSun, serif;">${body}</section></section>`
  }
  return `<section style="margin: 0 0 16px; padding: 12px 14px; border: 1px solid ${theme.border || theme.soft}; border-radius: 8px; background: ${theme.surface || theme.background || '#ffffff'};">${body}</section>`
}

export function renderImageCard(lines: string[], theme: Theme) {
  const imageLineIndex = lines.findIndex((line) => /^!\[[^\]]*]\([^)]+\)$/.test(line.trim()))
  if (imageLineIndex < 0) return ''
  const imageMatch = lines[imageLineIndex].trim().match(/^!\[([^\]]*)]\(([^)]+)\)$/)
  if (!imageMatch) return ''

  const [, alt, src] = imageMatch
  const textLines = lines
    .filter((_, index) => index !== imageLineIndex)
    .map((line) => line.trim())
    .filter(Boolean)
  const title = textLines[0] || alt || ''
  const description = textLines.slice(1).join(' ')

  if (theme.variant === 'agentBuilder') {
    const titleHtml = title
      ? `<p style="margin: 0; padding: 0; color: ${theme.text}; font-family: Georgia, 'Times New Roman', 'Songti SC', SimSun, serif; font-size: 16px; line-height: 1.42; font-weight: 800; letter-spacing: 0;">${inlineFormat(
          title,
          theme
        )}</p>`
      : ''
    const descriptionHtml = description
      ? `<p style="margin: 4px 0 0; padding: 0; color: #94a3b8; font-size: 13px; line-height: 1.5; font-weight: 700; letter-spacing: 0;">${inlineFormat(
          description,
          theme
        )}</p>`
      : ''
    return `<section style="margin: 0 0 20px; padding: 16px 18px; border: 2px solid #6366f1; background: #f8fafc; box-shadow: 0 8px 18px rgba(79,70,229,0.08); font-size: 0; line-height: 0;"><img src="${escapeHtml(
      src
    )}" alt="${escapeHtml(
      alt
    )}" style="display: inline-block; width: 70px; height: 70px; margin: 0 16px 0 0; padding: 0; border: 1px solid #e2e8f0; background: #ffffff; box-shadow: 0 5px 12px rgba(15,23,42,0.10); vertical-align: middle; object-fit: contain;" /><section style="display: inline-block; width: calc(100% - 86px); margin: 0; padding: 0; vertical-align: middle;">${titleHtml}${descriptionHtml}</section></section>`
  }

  return `<section style="margin: 0 0 18px; padding: 14px; border: 1px solid ${theme.border || theme.soft}; border-radius: 8px; background: ${theme.surface || theme.background || '#ffffff'}; font-size: 0; line-height: 0;"><img src="${escapeHtml(
    src
  )}" alt="${escapeHtml(
    alt
  )}" style="display: inline-block; width: 64px; height: 64px; margin: 0 14px 0 0; border-radius: 6px; vertical-align: middle; object-fit: cover;" /><section style="display: inline-block; width: calc(100% - 78px); vertical-align: middle;"><p style="margin: 0; color: ${theme.text}; font-size: 16px; line-height: 1.55; font-weight: 700;">${inlineFormat(
    title,
    theme
  )}</p>${
    description
      ? `<p style="margin: 2px 0 0; color: ${theme.muted}; font-size: 13px; line-height: 1.55;">${inlineFormat(
          description,
          theme
        )}</p>`
      : ''
  }</section></section>`
}

function normalizeCodeLanguage(language?: string) {
  const lang = (language || '').trim().toLowerCase()
  const languageMap: Record<string, string> = {
    csharp: 'cs',
    'c#': 'cs',
    cs: 'cs',
    java: 'java',
    javascript: 'js',
    js: 'js',
    typescript: 'ts',
    ts: 'ts',
    python: 'py',
    py: 'py',
    html: 'html',
    xml: 'xml',
    css: 'css',
    json: 'json',
    bash: 'bash',
    shell: 'bash',
    sh: 'bash',
    go: 'go',
    rust: 'rust',
    sql: 'sql'
  }
  return languageMap[lang] || lang || 'plain'
}

function stashCodeToken(placeholders: string[], value: string) {
  placeholders.push(value)
  return `@@SP_CODE_${placeholders.length - 1}@@`
}

function restoreCodeTokens(value: string, placeholders: string[]) {
  placeholders.forEach((placeholder, index) => {
    value = value.replace(`@@SP_CODE_${index}@@`, placeholder)
  })
  return value
}

function highlightCodeLine(line: string, language?: string) {
  const placeholders: string[] = []
  const lang = normalizeCodeLanguage(language)
  let value = escapeHtml(line)

  value = value.replace(/(\/\/.*)$/g, (_match) =>
    stashCodeToken(placeholders, `<span class="code-snippet__comment">${_match}</span>`)
  )
  value = value.replace(/(#.*)$/g, (_match) => {
    if (!['py', 'python', 'bash', 'sh', 'shell'].includes(lang)) return _match
    return stashCodeToken(placeholders, `<span class="code-snippet__comment">${_match}</span>`)
  })
  value = value.replace(/(&quot;(?:\\.|[^&])*?&quot;|'(?:\\.|[^'])*')/g, (_match) =>
    stashCodeToken(placeholders, `<span class="code-snippet__string">${_match}</span>`)
  )
  value = value.replace(
    /\b(console|Math|JSON|Promise|Array|Object|String|Number|Boolean|Date|RegExp|Set|Map|WeakSet|WeakMap|Symbol|BigInt|Reflect|Proxy|Intl|System)\b/g,
    (_match) => stashCodeToken(placeholders, `<span class="code-snippet__built_in">${_match}</span>`)
  )
  value = value.replace(
    /\b(public|private|protected|class|interface|extends|implements|static|void|new|return|if|else|for|while|switch|case|break|continue|try|catch|finally|throw|throws|const|let|var|function|async|await|import|from|export|default|type|interface|enum|def|lambda|with|as|pass|True|False|None|null|undefined|out)\b/g,
    '<span class="code-snippet__keyword">$1</span>'
  )
  value = value.replace(
    /(<span class="code-snippet__keyword">class<\/span>\s+)([A-Za-z_$][\w$]*)/g,
    '$1<span class="code-snippet__title">$2</span>'
  )
  value = value.replace(
    /\b([A-Za-z_$][\w$]*)(?=\s*\()/g,
    '<span class="code-snippet__title">$1</span>'
  )

  return restoreCodeTokens(value, placeholders)
}

export function renderCode(lines: string[], theme: Theme, language?: string) {
  const lang = normalizeCodeLanguage(language)
  const lineHtml = lines
    .map(
      (line) =>
        `<code><span leaf="">${highlightCodeLine(line || ' ', lang)}</span></code>`
    )
    .join('')
  const margin = theme.variant === 'agentBuilder' ? '0 0 18px' : '16px 0'
  return `<section class="code-snippet__js" style="margin: ${margin}; padding: 0;"><pre class="code-snippet__js code-snippet code-snippet_nowrap" data-lang="${escapeHtml(
    lang
  )}">${lineHtml}</pre></section>`
}

export function renderToc(items: TocItem[], theme: Theme) {
  if (!items.length) return ''
  if (theme.variant === 'agentBuilder') {
    const children = items
      .map((item, index) => {
        const indent = item.level === 3 ? 18 : 0
        const marker = item.level === 2 ? String(index + 1).padStart(2, '0') : ''
        const markerHtml =
          item.level === 2
            ? `<span style="display: inline-block; width: 30px; height: 22px; margin-right: 9px; border-radius: 7px; background: #eef2ff; color: ${theme.primary}; font-size: 12px; line-height: 22px; text-align: center; font-weight: 900; vertical-align: middle;">${marker}</span>`
            : `<span style="display: inline-block; width: 7px; height: 7px; margin: 0 12px 0 11px; border-radius: 999px; background: #c7d2fe; vertical-align: middle;"></span>`
        return `<section style="display: block; margin: 0 0 8px; padding: 0 0 0 ${indent}px; font-size: 0; line-height: 0;">${markerHtml}<span style="display: inline-block; width: calc(100% - ${item.level === 2 ? '44px' : '32px'}); margin: 0; padding: 0; color: ${item.level === 2 ? theme.text : theme.muted}; font-size: ${item.level === 2 ? '16px' : '14px'}; line-height: 1.6; font-weight: ${item.level === 2 ? '800' : '650'}; vertical-align: middle;">${inlineFormat(
          item.text,
          theme
        )}</span></section>`
      })
      .join('')
    return `<section style="margin: 0 0 18px; padding: 16px 16px 8px; border: 1px solid ${theme.border}; background: rgba(255,255,255,0.78); box-shadow: 0 6px 16px rgba(15,23,42,0.05);"><p style="margin: 0 0 12px; padding: 0; color: ${theme.primary}; font-size: 12px; line-height: 1.4; font-weight: 900; letter-spacing: 1.8px;"><span style="display: inline-block; width: 9px; height: 9px; margin-right: 8px; border-radius: 2px; background: ${theme.primary}; vertical-align: 0;"></span>TABLE OF CONTENTS</p>${children}</section>`
  }

  const children = items
    .map((item) => {
      const indent = item.level === 3 ? 18 : 0
      return `<section style="margin: 0 0 8px; padding: 0 0 0 ${indent}px; color: ${item.level === 2 ? theme.text : theme.muted}; font-size: ${item.level === 2 ? '16px' : '14px'}; line-height: 1.7; font-weight: ${item.level === 2 ? '700' : '500'};">${item.level === 2 ? '• ' : '– '}${inlineFormat(
        item.text,
        theme
      )}</section>`
    })
    .join('')
  return `<section style="margin: 0 0 18px; padding: 14px 15px 8px; border: 1px solid ${theme.border || theme.soft}; border-radius: 8px; background: ${theme.surface || theme.background || '#ffffff'};">${children}</section>`
}

export function renderMathBlock(lines: string[], theme: Theme) {
  return renderMathSvg(lines.join('\n'), theme, true)
}

export function renderSwipeGallery(
  items: Array<{ alt: string; src: string }>,
  theme: Theme
) {
  if (!items.length) return ''
  const baseImageStyle =
    theme.variant === 'agentBuilder'
      ? `display: inline-block; width: 86%; max-width: 86%; vertical-align: top; box-sizing: border-box; border: 1px solid ${theme.border}; border-radius: 4px; background: #ffffff; box-shadow: 0 12px 28px rgba(15, 23, 42, 0.10), 0 2px 8px rgba(79, 70, 229, 0.08);`
      : 'display: inline-block; width: 86%; max-width: 86%; vertical-align: top; border-radius: 6px;'
  const slides = items
    .map((item, index) => {
      const margin = index === items.length - 1 ? '0' : '0 12px 0 0'
      return `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" style="${baseImageStyle} margin: ${margin};" />`
    })
    .join('')

  const margin = theme.variant === 'agentBuilder' ? '0 0 18px' : '0'
  return `<section style="margin: ${margin}; padding: 0; max-width: 100%; overflow-x: auto; overflow-y: hidden; white-space: nowrap; -webkit-overflow-scrolling: touch;">${slides}</section>`
}

export function renderDivider(theme: Theme) {
  if (theme.variant === 'agentBuilder') {
    return `<section style="margin: 0; padding: 18px 0 20px; line-height: 0; font-size: 0;"><span style="display: block; width: 100%; height: 3px; overflow: hidden; border-radius: 999px; background: linear-gradient(90deg, rgba(99,102,241,0.04) 0%, rgba(99,102,241,0.18) 16%, rgba(99,102,241,0.62) 34%, rgba(129,140,248,0.95) 50%, rgba(16,185,129,0.54) 66%, rgba(99,102,241,0.18) 84%, rgba(99,102,241,0.04) 100%); box-shadow: 0 0 0 1px rgba(99,102,241,0.05), 0 5px 12px rgba(99,102,241,0.1);"></span></section>`
  }
  if (theme.variant === 'analytics') {
    return `<section style="margin: 0; padding: 22px 0; line-height: 0; font-size: 0;"><span style="display: block; width: 100%; height: 1px; background: linear-gradient(90deg, rgba(30,64,175,0), ${theme.primary}, ${theme.accent}, rgba(245,158,11,0));"></span></section>`
  }
  if (theme.variant === 'education') {
    return `<section style="margin: 0; padding: 22px 0; line-height: 0; font-size: 0; text-align: center;"><span style="display: inline-block; width: 18%; height: 6px; border-radius: 999px; background: ${theme.primary}; box-shadow: 30px 0 0 #38bdf8, 60px 0 0 ${theme.accent};"></span></section>`
  }
  if (theme.variant === 'light') {
    return `<section style="margin: 0; padding: 22px 0; line-height: 0; font-size: 0;"><span style="display: block; width: 100%; height: 1px; background: linear-gradient(90deg, rgba(255,255,255,0), ${theme.primary}, ${theme.accent}, rgba(255,255,255,0));"></span></section>`
  }
  return `<section style="margin: 0; padding: 20px 0; line-height: 0; font-size: 0;"><span style="display: block; width: 100%; height: 1px; background: ${theme.soft}; border-top: 1px solid #e2e8f0;"></span></section>`
}

function normalizeListItem(item: string | ListItem): ListItem {
  return typeof item === 'string' ? { text: item, level: 0 } : item
}

function getListMarkers(items: Array<string | ListItem>) {
  const counters: number[] = []
  return items.map((item) => {
    const level = Math.min(Math.max(normalizeListItem(item).level, 0), 4)
    counters[level] = (counters[level] || 0) + 1
    counters.length = level + 1
    return counters[level]
  })
}

function parseTaskListItem(text: string): { checked: boolean; text: string } | null {
  const match = text.match(/^\[([ xX])]\s+(.+)$/)
  if (!match) return null
  return {
    checked: match[1].toLowerCase() === 'x',
    text: match[2].trim()
  }
}

export function renderList(type: 'ul' | 'ol', items: Array<string | ListItem>, theme: Theme) {
  if (!items.length) return ''
  const listMarkers = type === 'ol' ? getListMarkers(items) : []
  if (theme.variant === 'agentBuilder') {
    const children = items
      .map((item, index) => {
        const normalized = normalizeListItem(item)
        const level = Math.min(Math.max(normalized.level, 0), 4)
        const isOrdered = type === 'ol'
        const task = !isOrdered ? parseTaskListItem(normalized.text) : null
        const marker = isOrdered ? String(listMarkers[index]) : ''
        const markerSize = task ? 16 : isOrdered ? 24 : level > 0 ? 5 : 7
        const markerColor = task
          ? task.checked ? theme.primary : '#ffffff'
          : isOrdered ? '#eef2ff' : level > 0 ? '#c7d2fe' : theme.primary
        const markerBoxWidth = task ? 28 : isOrdered ? 28 : 18
        const taskBorder = task
          ? `border: 1.5px solid ${task.checked ? theme.primary : '#c7d2fe'};`
          : ''
        const markerStyle = task
          ? `display: inline-block; width: ${markerSize}px; min-width: ${markerSize}px; max-width: ${markerSize}px; height: ${markerSize}px; min-height: ${markerSize}px; max-height: ${markerSize}px; margin: 0 ${markerBoxWidth - markerSize}px 0 0; border-radius: 4px; background: ${markerColor}; ${taskBorder} color: #ffffff; font-size: 12px; line-height: ${markerSize - 2}px; text-align: center; font-weight: 900; box-sizing: border-box; vertical-align: middle;`
          : isOrdered
            ? `display: inline-block; width: ${markerSize}px; min-width: ${markerSize}px; max-width: ${markerSize}px; height: ${markerSize}px; min-height: ${markerSize}px; max-height: ${markerSize}px; margin-right: 8px; border-radius: 50%; background: ${markerColor}; color: ${theme.primary}; font-size: 13px; line-height: ${markerSize}px; text-align: center; font-weight: 900; box-sizing: border-box; vertical-align: middle;`
            : `display: inline-block; width: ${markerSize}px; min-width: ${markerSize}px; max-width: ${markerSize}px; height: ${markerSize}px; min-height: ${markerSize}px; max-height: ${markerSize}px; margin: 0 ${markerBoxWidth - markerSize}px 0 0; border-radius: 50%; background: ${markerColor}; color: transparent; font-size: 0; line-height: ${markerSize}px; box-sizing: border-box; vertical-align: middle;`
        const text = task ? task.text : normalized.text
        return `<section style="display: block; margin: 0; padding: 0 0 0 ${level * 22}px; font-size: 0; line-height: 0;"><span style="${markerStyle}">${task ? task.checked ? '✓' : '&nbsp;' : isOrdered ? marker : '&nbsp;'}</span><span style="display: inline-block; width: calc(100% - ${markerBoxWidth + 10}px); margin: 0; padding: 0; font-size: 16px; line-height: 1.82; color: ${theme.muted}; font-weight: 500; vertical-align: middle;">${inlineFormat(
          text,
          theme
        )}</span></section>`
      })
      .join('')
    return `<section style="margin: 0 0 16px; padding: 0;">${children}</section>`
  }
  if (theme.variant === 'education') {
    const children = items
      .map((item, index) => {
        const normalized = normalizeListItem(item)
        const marker = type === 'ol' ? String(listMarkers[index]) : ''
        return `<section style="margin: 9px 0; padding: 12px 13px; border: 2px solid ${theme.border}; border-radius: 16px; background: #ffffff; box-shadow: 4px 5px 0 rgba(79,70,229,0.12), inset -2px -2px 8px rgba(79,70,229,0.05);"><span style="display: inline-block; width: 24px; height: 24px; margin-right: 9px; border-radius: 8px; background: ${type === 'ol' ? theme.primary : theme.accent}; color: #ffffff; font-size: 13px; line-height: 24px; text-align: center; font-weight: 800; vertical-align: top;">${marker}</span><span style="display: inline-block; width: calc(100% - 38px); font-size: 16px; line-height: 1.75; color: ${theme.text}; vertical-align: top;">${inlineFormat(
          normalized.text,
          theme
        )}</span></section>`
      })
      .join('')
    return `<section style="margin: 12px 0 18px;">${children}</section>`
  }
  if (theme.variant === 'analytics') {
    const children = items
      .map((item, index) => {
        const normalized = normalizeListItem(item)
        const marker = type === 'ol' ? String(listMarkers[index]).padStart(2, '0') : ''
        return `<section style="margin: 8px 0; padding: 11px 12px; border: 1px solid ${theme.border}; border-radius: 8px; background: ${theme.surface};"><span style="display: inline-block; width: ${type === 'ol' ? '28px' : '8px'}; height: ${type === 'ol' ? '22px' : '8px'}; margin-right: 8px; border-radius: ${type === 'ol' ? '999px' : '999px'}; background: ${type === 'ol' ? theme.soft : theme.primary}; color: ${theme.primary}; font-size: 12px; line-height: ${type === 'ol' ? '22px' : '8px'}; text-align: center; font-weight: 700; vertical-align: middle;">${marker}</span><span style="font-size: 16px; line-height: 1.8; color: ${theme.text}; vertical-align: middle;">${inlineFormat(
          normalized.text,
          theme
        )}</span></section>`
      })
      .join('')
    return `<section style="margin: 12px 0 18px;">${children}</section>`
  }
  if (theme.variant === 'light') {
    const children = items
      .map((item, index) => {
        const normalized = normalizeListItem(item)
        const marker = type === 'ol' ? String(listMarkers[index]) : ''
        return `<section style="margin: 8px 0; padding: 10px 12px; border: 1px solid ${theme.border}; border-radius: 10px; background: ${theme.surface};"><span style="display: inline-block; width: ${type === 'ol' ? '24px' : '8px'}; height: ${type === 'ol' ? '24px' : '8px'}; margin-right: 9px; border-radius: 999px; background: ${theme.primary}; color: #ffffff; font-size: 12px; line-height: ${type === 'ol' ? '24px' : '8px'}; text-align: center; font-weight: 800; vertical-align: middle;">${marker}</span><span style="font-size: 16px; line-height: 1.78; color: ${theme.text}; vertical-align: middle;">${inlineFormat(
          normalized.text,
          theme
        )}</span></section>`
      })
      .join('')
    return `<section style="margin: 12px 0 18px;">${children}</section>`
  }
  const children = items
    .map(
      (item) => {
        const normalized = normalizeListItem(item)
        return (
        `<li style="margin: 8px 0; font-size: 16px; line-height: 1.8; color: ${theme.text};">${inlineFormat(
          normalized.text,
          theme
        )}</li>`
        )
      }
    )
    .join('')
  return `<${type} style="padding-left: 1.25em; margin: 12px 0 18px;">${children}</${type}>`
}

export function renderTable(lines: string[], theme: Theme) {
  const rawRows = lines
    .map((line) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()))
  const normalizeRuleCell = (cell: string) => cell.replace(/\s+/g, '')
  const isTableRuleCell = (cell: string) => /^:?-{3,}:?$/.test(normalizeRuleCell(cell))
  const alignments = (rawRows[1] || []).map((cell) => {
    const rule = normalizeRuleCell(cell)
    if (/^:-{3,}:$/.test(rule)) return 'center'
    if (/^-{3,}:$/.test(rule)) return 'right'
    return 'left'
  })
  const rows = rawRows.filter((cells, rowIndex) => {
    if (rowIndex === 1 && cells.some(isTableRuleCell)) return false
    return !cells.every(isTableRuleCell)
  })
  if (!rows.length) return ''

  const body = rows
    .map((row, rowIndex) => {
      const tag = rowIndex === 0 ? 'th' : 'td'
      const cells = row
        .map((cell, cellIndex) => {
          const align = alignments[cellIndex] || 'left'
          const bg =
            rowIndex === 0
              ? `background: ${
                  theme.variant === 'analytics' || theme.variant === 'agentBuilder'
                    ? theme.primary
                    : theme.soft
                };`
              : theme.variant === 'analytics' || theme.variant === 'education' || theme.variant === 'agentBuilder'
                ? 'background: rgba(255,255,255,0.76);'
                : ''
          const weight = rowIndex === 0 ? 'font-weight: 700;' : ''
          const color =
            (theme.variant === 'analytics' || theme.variant === 'education' || theme.variant === 'agentBuilder') &&
            rowIndex === 0
              ? '#ffffff'
              : theme.text
          const headerBg =
            theme.variant === 'education' && rowIndex === 0
              ? `background: ${theme.primary};`
              : bg
          return `<${tag} style="border: 1px solid #e5e7eb; padding: 8px; line-height: 1.6; text-align: ${align}; color: ${theme.text}; ${bg} ${weight}">${inlineFormat(
            cell,
            theme
          )}</${tag}>`
            .replace(`color: ${theme.text};`, `color: ${color};`)
            .replace(bg, headerBg)
        })
        .join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  const shellStyle =
    theme.variant === 'analytics'
      ? `border: 1px solid ${theme.border}; border-radius: 8px; background: ${theme.background};`
      : theme.variant === 'education'
        ? `border: 2px solid ${theme.border}; border-radius: 16px; background: #ffffff; box-shadow: 4px 5px 0 rgba(79,70,229,0.12);`
        : theme.variant === 'agentBuilder'
          ? `border: 1px solid ${theme.border}; background: rgba(255,255,255,0.82);`
        : theme.variant === 'light'
          ? `border: 1px solid ${theme.border}; border-radius: 10px; background: ${theme.surface};`
          : ''
  const margin = theme.variant === 'agentBuilder' ? '0 0 18px' : '16px 0'
  return `<section style="margin: ${margin}; padding: 0; overflow-x: auto; ${shellStyle}"><table style="margin: 0; padding: 0; width: 100%; border-collapse: collapse; font-size: 14px;">${body}</table></section>`
}

export function renderFooter(lines: string[], theme: Theme) {
  const text = lines.map((item) => item.trim()).filter(Boolean).join(' ')
  if (!text) return ''
  const normalized = text.replace(/^@(?=\d{4}\b)/, '© ')
  const protocol = 'DATA GOVERNANCE PROTOCOL'
  const protocolIndex = normalized.indexOf(protocol)
  const company =
    protocolIndex >= 0 ? normalized.slice(0, protocolIndex).trim() : normalized.trim()
  const protocolText = protocolIndex >= 0 ? protocol : ''

  if (theme.variant === 'agentBuilder') {
    return `<section style="margin: 0; padding: 0; border-top: 1px solid ${theme.border};"><span style="display: block; color: #94a3b8; font-size: 12px; line-height: 1.6; font-weight: 800; letter-spacing: 0.5px;">${escapeHtml(company)}</span>${
      protocolText
        ? `<span style="display: block; margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6; font-weight: 800; letter-spacing: 1px; text-align: right;">${protocolText}</span>`
        : ''
    }</section>`
  }

  return `<section style="margin: 32px 0 0; padding: 16px 0 0; border-top: 1px solid ${theme.soft}; color: ${theme.muted}; font-size: 13px; line-height: 1.7;">${inlineFormat(
    normalized,
    theme
  )}</section>`
}

export function renderCaption(
  label: BlockLabel,
  theme: Theme,
  position: 'before' | 'after' = 'after',
  targetType?: 'image' | 'table' | 'quote' | 'card'
) {
  const text = label.text.trim()
  if (!text) return ''

  if (theme.variant === 'agentBuilder') {
    const margin = position === 'before' ? '8px 0' : '8px 0 14px'
    return `<section style="margin: ${margin}; color: #94a3b8; font-size: 12px; line-height: 1.6; font-weight: 700; letter-spacing: 0.5px; text-align: ${label.align};">${inlineFormat(
      text,
      theme
    )}</section>`
  }

  return `<section style="margin: ${position === 'before' ? '12px 0 8px' : '-2px 0 20px'}; color: ${theme.muted}; font-size: 13px; line-height: 1.7; text-align: ${label.align};">${inlineFormat(
    text,
    theme
  )}</section>`
}
