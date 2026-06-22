import type { BlockLabel, FormatOptions, FormatResult, LabelAlign, ListItem, TocItem } from './types'
import { isSafeInlineHtml, parseFrontMatter } from './helpers'
import { themes } from './themes'
import { renderCaption, renderCard, renderCode, renderDivider, renderFooter, renderHeader, renderHeading, renderImageCard, renderList, renderMathBlock, renderParagraph, renderQuote, renderSwipeGallery, renderTable, renderTitleBlock, renderToc } from './renderers'
import { inlineFormat } from './inline'
import { renderMermaidSvg } from './mermaid'

type LabelTargetType = 'quote' | 'image' | 'table' | 'card'

export async function formatMarkdownForWechat(
  markdown: string,
  themeName = 'classic',
  options: FormatOptions = {}
): Promise<FormatResult> {
  const theme = themes[themeName] || themes.classic
  const html: string[] = []
  const paragraph: string[] = []
  let listType: 'ul' | 'ol' | null = null
  let listItems: ListItem[] = []
  let headingSectionIndex = 0
  let pendingLabel: BlockLabel | undefined
  let lastLabelTargetType: LabelTargetType | null = null
  let lastLabelTargetIndex = -1
  let lastLabelTargetNumber = 0
  let figureIndex = 0
  let tableIndex = 0
  let pendingAutoCaption:
    | {
        targetType: LabelTargetType
        targetNumber: number
      }
    | undefined
  const { content } = parseFrontMatter(markdown)
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const tocItems = collectTocItems(lines)

  const pushHtml = (
    value: string,
    labelTargetType: LabelTargetType | null = null,
    labelTargetNumber = 0
  ) => {
    if (!value) return
    html.push(value)
    lastLabelTargetType = labelTargetType
    lastLabelTargetIndex = labelTargetType ? html.length - 1 : -1
    lastLabelTargetNumber = labelTargetType ? labelTargetNumber : 0
  }

  const flushParagraph = () => {
    const rendered = renderParagraph(paragraph, theme)
    if (rendered) pushHtml(rendered)
    paragraph.length = 0
  }
  const flushList = () => {
    if (listType) pushHtml(renderList(listType, listItems, theme))
    listType = null
    listItems = []
  }

  const isImageLine = (value: string) => /^!\[[^\]]*]\([^)]+\)$/.test(value.trim())
  const isSwipeGalleryLine = (value: string) => /^<\s*!\[[\s\S]+>\s*$/.test(value.trim())
  const isQuoteLine = (value: string) => value.trim().startsWith('>')
  const isCardLine = (value: string) => value.trim() === ':::card'
  const isTitleLine = (value: string) => value.trim() === ':::title'
  const isImageCardLine = (value: string) => value.trim() === ':::img:card'
  const isTableStart = (lineIndex: number) =>
    lines[lineIndex]?.includes('|') &&
    lineIndex + 1 < lines.length &&
    /\|\s*:?-{3,}:?\s*\|/.test(lines[lineIndex + 1])
  const isPrimaryHeadingLine = (value: string) => /^#\s+/.test(value.trim())

  const isLabelTargetStart = (lineIndex: number) => {
    const value = lines[lineIndex]?.trim() || ''
    return isQuoteLine(value) || isImageLine(value) || isSwipeGalleryLine(value) || isTableStart(lineIndex) || isPrimaryHeadingLine(value) || isTitleLine(value) || isCardLine(value) || isImageCardLine(value)
  }
  const getLabelTargetTypeAtLine = (lineIndex: number): LabelTargetType | 'heading' | null => {
    const value = lines[lineIndex]?.trim() || ''
    if (isPrimaryHeadingLine(value) || isTitleLine(value)) return 'heading'
    if (isCardLine(value) || isImageCardLine(value)) return 'card'
    if (isQuoteLine(value)) return 'quote'
    if (isImageLine(value) || isSwipeGalleryLine(value)) return 'image'
    if (isTableStart(lineIndex)) return 'table'
    return null
  }

  const parseSwipeGallery = (value: string) => {
    const body = value.trim().replace(/^<\s*/, '').replace(/\s*>$/, '')
    const items: Array<{ alt: string; src: string }> = []
    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g
    let match: RegExpExecArray | null
    while ((match = imagePattern.exec(body))) {
      items.push({
        alt: match[1] || '',
        src: match[2] || ''
      })
    }
    return items
  }

  const findNextContentLine = (lineIndex: number) => {
    for (let nextIndex = lineIndex; nextIndex < lines.length; nextIndex += 1) {
      if (lines[nextIndex].trim()) return nextIndex
    }
    return -1
  }

  const parseLabelAlign = (value: string): LabelAlign => {
    const normalized = value.trim().toLowerCase()
    if (normalized === ':right') return 'right'
    if (normalized === ':left') return 'left'
    return 'center'
  }

  const readLabelBlock = (openLine: string, startIndex: number) => {
    const align = parseLabelAlign(openLine.replace(/^:::label/, ''))
    const labelLines: string[] = []
    let endIndex = startIndex + 1
    while (endIndex < lines.length && lines[endIndex].trim() !== ':::') {
      labelLines.push(lines[endIndex])
      endIndex += 1
    }
    return {
      label: {
        text: labelLines.map((item) => item.trim()).filter(Boolean).join(' '),
        align
      },
      endIndex
    }
  }

  const normalizeFigureLabel = (
    label: BlockLabel | undefined,
    targetType: LabelTargetType,
    targetNumber: number
  ): BlockLabel | undefined => {
    if (targetType !== 'image' && targetType !== 'table') return label
    const prefix = targetType === 'image' ? '图' : '表'
    const fallbackAlign: LabelAlign = 'center'
    const rawText = label?.text.trim() || ''
    const textWithoutNumber = rawText
      .replace(/^[图表]\s*[0-9０-９一二三四五六七八九十百千万]+\s*[：:、.\-\s]*/, '')
      .trim()
    if (!options.showFigureNumbers) {
      if (!label) return undefined
      return textWithoutNumber
        ? {
            text: textWithoutNumber,
            align: label.align
          }
        : undefined
    }
    return {
      text: `${prefix}${targetNumber}${textWithoutNumber ? ` ${textWithoutNumber}` : ''}`,
      align: label?.align || fallbackAlign
    }
  }

  const renderTargetCaption = (
    label: BlockLabel | undefined,
    targetType: LabelTargetType,
    targetNumber: number,
    position: 'before' | 'after'
  ) => {
    const normalizedLabel = normalizeFigureLabel(label, targetType, targetNumber)
    if (!normalizedLabel) return ''
    return renderCaption(normalizedLabel, theme, position, targetType)
  }

  const attachLabelToPreviousTarget = (label: BlockLabel) => {
    if (!lastLabelTargetType || lastLabelTargetIndex !== html.length - 1) return false
    pushHtml(renderTargetCaption(label, lastLabelTargetType, lastLabelTargetNumber, 'after'))
    pendingAutoCaption = undefined
    return true
  }

  const flushPendingAutoCaption = () => {
    if (!pendingAutoCaption) return
    pushHtml(
      renderTargetCaption(undefined, pendingAutoCaption.targetType, pendingAutoCaption.targetNumber, 'after')
    )
    pendingAutoCaption = undefined
  }

  const flushPendingLabelAsCaption = () => {
    if (!pendingLabel) return
    pushHtml(renderCaption(pendingLabel, theme, 'after'))
    pendingLabel = undefined
  }

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index]
    const line = raw.trim()

    if (!line) {
      flushParagraph()
      flushList()
      flushPendingAutoCaption()
      continue
    }

    if (!/^:::label(?::(?:left|center|right))?$/.test(line)) flushPendingAutoCaption()

    if (/^\[toc]$/i.test(line)) {
      flushParagraph()
      flushList()
      pushHtml(renderToc(tocItems, theme))
      continue
    }

    if (/^:::label(?::(?:left|center|right))?$/.test(line)) {
      flushParagraph()
      flushList()
      const { label, endIndex } = readLabelBlock(line, index)
      if (label.text) {
        const nextContentIndex = findNextContentLine(endIndex + 1)
        const nextTargetType =
          nextContentIndex >= 0 ? getLabelTargetTypeAtLine(nextContentIndex) : null
        if (nextTargetType === 'heading') {
          pendingLabel = label
        } else if (!attachLabelToPreviousTarget(label)) {
          pendingLabel = nextTargetType ? label : undefined
        }
      }
      index = endIndex
      continue
    }

    if (line === ':::footer') {
      flushParagraph()
      flushList()
      const footerLines: string[] = []
      index += 1
      while (index < lines.length && lines[index].trim() !== ':::') {
        footerLines.push(lines[index])
        index += 1
      }
      pushHtml(renderFooter(footerLines, theme))
      continue
    }

    if (line === ':::header') {
      flushParagraph()
      flushList()
      const headerLines: string[] = []
      index += 1
      while (index < lines.length && lines[index].trim() !== ':::') {
        headerLines.push(lines[index])
        index += 1
      }
      pushHtml(renderHeader(headerLines, theme))
      pendingLabel = undefined
      continue
    }

    if (line === ':::title') {
      flushParagraph()
      flushList()
      const titleLines: string[] = []
      index += 1
      while (index < lines.length && lines[index].trim() !== ':::') {
        titleLines.push(lines[index])
        index += 1
      }
      pushHtml(renderTitleBlock(titleLines, theme, pendingLabel))
      pendingLabel = undefined
      continue
    }

    if (line === ':::card') {
      flushParagraph()
      flushList()
      const cardLines: string[] = []
      index += 1
      while (index < lines.length && lines[index].trim() !== ':::') {
        cardLines.push(lines[index])
        index += 1
      }
      pushHtml(renderCard(cardLines, theme, pendingLabel), 'card')
      pendingLabel = undefined
      continue
    }

    if (line === ':::img:card') {
      flushParagraph()
      flushList()
      const imageCardLines: string[] = []
      index += 1
      while (index < lines.length && lines[index].trim() !== ':::') {
        imageCardLines.push(lines[index])
        index += 1
      }
      pushHtml(renderImageCard(imageCardLines, theme), 'card')
      pendingLabel = undefined
      continue
    }

    if (pendingLabel && !isLabelTargetStart(index)) flushPendingLabelAsCaption()

    if (line.startsWith('```')) {
      flushParagraph()
      flushList()
      const language = line.replace(/^```/, '').trim().toLowerCase()
      const code: string[] = []
      index += 1
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        code.push(lines[index])
        index += 1
      }
      pushHtml(language === 'mermaid' ? await renderMermaidSvg(code.join('\n'), theme) : renderCode(code, theme, language))
      continue
    }

    if (line.startsWith('$$')) {
      flushParagraph()
      flushList()
      const mathLines: string[] = []
      const firstFormula = line.replace(/^\$\$\s*/, '')
      if (firstFormula.endsWith('$$') && firstFormula.length > 2) {
        mathLines.push(firstFormula.replace(/\s*\$\$$/, ''))
      } else {
        if (firstFormula) mathLines.push(firstFormula)
        index += 1
        while (index < lines.length && !lines[index].trim().endsWith('$$')) {
          mathLines.push(lines[index])
          index += 1
        }
        if (index < lines.length) {
          const closingLine = lines[index].trim().replace(/\s*\$\$$/, '')
          if (closingLine) mathLines.push(closingLine)
        }
      }
      pushHtml(renderMathBlock(mathLines, theme))
      continue
    }

    if (line.includes('|') && index + 1 < lines.length && /\|\s*:?-{3,}:?\s*\|/.test(lines[index + 1])) {
      flushParagraph()
      flushList()
      tableIndex += 1
      const hasCaptionBefore = Boolean(pendingLabel)
      if (pendingLabel) {
        pushHtml(renderTargetCaption(pendingLabel, 'table', tableIndex, 'before'))
        pendingLabel = undefined
      }
      const tableLines = [line, lines[index + 1]]
      index += 2
      while (index < lines.length && lines[index].includes('|')) {
        tableLines.push(lines[index])
        index += 1
      }
      index -= 1
      pushHtml(renderTable(tableLines, theme), 'table', tableIndex)
      if (options.showFigureNumbers && !hasCaptionBefore) {
        pendingAutoCaption = { targetType: 'table', targetNumber: tableIndex }
      }
      continue
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushParagraph()
      flushList()
      pushHtml(renderDivider(theme))
      continue
    }

    if (/^#{1,6}\s+/.test(line)) {
      flushParagraph()
      flushList()
      if (theme.variant === 'agentBuilder' && /^##\s+/.test(line)) headingSectionIndex += 1
      const headingLabel = /^#\s+/.test(line) ? pendingLabel : undefined
      pushHtml(
        renderHeading(
          line,
          theme,
          headingSectionIndex,
          {},
          headingLabel,
          Boolean(options.showSectionNumbers)
        )
      )
      if (headingLabel) pendingLabel = undefined
      continue
    }

    if (line.startsWith('>')) {
      flushParagraph()
      flushList()
      const quoteLines = [line]
      index += 1
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quoteLines.push(lines[index].trim())
        index += 1
      }
      index -= 1
      pushHtml(renderQuote(quoteLines, theme, pendingLabel), 'quote')
      pendingLabel = undefined
      continue
    }

    const unordered = raw.match(/^(\s*)[-*+]\s+(.+)$/)
    const ordered = raw.match(/^(\s*)\d+[.)]\s+(.+)$/)
    if (unordered || ordered) {
      flushParagraph()
      const nextType = ordered ? 'ol' : 'ul'
      if (listType && listType !== nextType) flushList()
      listType = nextType
      const match = ordered || unordered
      const indent = match?.[1]?.replace(/\t/g, '  ').length || 0
      listItems.push({
        text: match?.[2] || '',
        level: Math.max(0, Math.floor(indent / 2))
      })
      continue
    }

    if (/^!\[[^\]]*]\([^)]+\)$/.test(line)) {
      flushParagraph()
      flushList()
      figureIndex += 1
      const hasCaptionBefore = Boolean(pendingLabel)
      if (pendingLabel) {
        pushHtml(renderTargetCaption(pendingLabel, 'image', figureIndex, 'before'))
        pendingLabel = undefined
      }
      pushHtml(inlineFormat(line, theme), 'image', figureIndex)
      if (options.showFigureNumbers && !hasCaptionBefore) {
        pendingAutoCaption = { targetType: 'image', targetNumber: figureIndex }
      }
      continue
    }

    if (isSwipeGalleryLine(line)) {
      flushParagraph()
      flushList()
      const slides = parseSwipeGallery(line)
      if (slides.length) {
        figureIndex += 1
        const hasCaptionBefore = Boolean(pendingLabel)
        if (pendingLabel) {
          pushHtml(renderTargetCaption(pendingLabel, 'image', figureIndex, 'before'))
          pendingLabel = undefined
        }
        pushHtml(renderSwipeGallery(slides, theme), 'image', figureIndex)
        if (options.showFigureNumbers && !hasCaptionBefore) {
          pendingAutoCaption = { targetType: 'image', targetNumber: figureIndex }
        }
        continue
      }
    }

    if (isSafeInlineHtml(line)) {
      flushParagraph()
      flushList()
      pushHtml(line)
      continue
    }

    paragraph.push(line)
  }

  flushParagraph()
  flushList()
  flushPendingAutoCaption()
  flushPendingLabelAsCaption()

  const body = html.join('')
  const agentFooter =
    ''
  const agentGridBackground = options.showGridBackground !== false
    ? 'background-image: linear-gradient(#edf2f7 1px, transparent 1px), linear-gradient(90deg, #edf2f7 1px, transparent 1px); background-size: 24px 24px;'
    : ''
  const agentFrameBorder = options.showGridBackground !== false
    ? `border: 1px solid ${theme.border};`
    : 'border: 0;'
  const bodyStyle =
    theme.variant === 'analytics'
      ? `max-width: 100%; margin: 0 auto; padding: 12px 10px; box-sizing: border-box; border-radius: 8px; background: ${theme.background}; font-family: Fira Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`
      : theme.variant === 'education'
        ? `max-width: 100%; margin: 0 auto; padding: 12px 10px; box-sizing: border-box; border-radius: 18px; background: ${theme.background}; font-family: Nunito, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`
        : theme.variant === 'agentBuilder'
          ? `max-width: 100%; margin: 0 auto; padding: 26px 22px 24px; box-sizing: border-box; ${agentFrameBorder} background-color: #ffffff; ${agentGridBackground} font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`
        : theme.variant === 'light'
          ? `max-width: 100%; margin: 0 auto; padding: 10px 8px; box-sizing: border-box; background: ${theme.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`
          : "max-width: 100%; margin: 0 auto; padding: 0 4px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;"
  const result = `<section style="${bodyStyle}">${body}${agentFooter}</section>`
  return {
    html: result,
    plainText: body.replace(/<[^>]+>/g, ''),
    theme: themeName
  }
}

function collectTocItems(lines: string[]): TocItem[] {
  const items: TocItem[] = []
  let inCodeBlock = false
  for (const raw of lines) {
    const line = raw.trim()
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (!match) continue
    items.push({
      level: match[1].length as 2 | 3,
      text: match[2].trim()
    })
  }
  return items
}

export function applyWechatFontSize(html: string, fontSize: number) {
  return html.replace(/font-size:\s*16px/g, `font-size: ${fontSize}px`)
}
