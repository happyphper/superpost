import mermaid from 'mermaid'
import type { Theme } from './types'
import { escapeHtml } from './helpers'

let initialized = false
let renderIndex = 0

type FlowNodeShape = 'rect' | 'diamond' | 'round'

type FlowNode = {
  id: string
  label: string
  shape: FlowNodeShape
}

type FlowEdge = {
  from: string
  to: string
  label?: string
}

function initMermaid() {
  if (initialized) return
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'default',
    flowchart: {
      htmlLabels: false
    }
  })
  initialized = true
}

function fallbackMermaid(code: string, theme: Theme) {
  return `<section style="margin: ${theme.variant === 'agentBuilder' ? '0 0 18px' : '0'}; padding: 0; background: ${theme.codeBg}; border: 1px solid ${theme.border || theme.soft}; border-radius: 6px; overflow-x: auto;"><code style="display: block; margin: 0; padding: 12px; font-size: 13px; line-height: 1.7; color: ${theme.codeText}; white-space: pre-wrap;">${escapeHtml(
    code
  )}</code></section>`
}

function textWeight(text: string) {
  return Array.from(text).reduce((sum, char) => sum + (/[\u4e00-\u9fa5]/.test(char) ? 2 : 1), 0)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function parseNodeRef(ref: string): FlowNode | null {
  const value = ref.trim().replace(/;$/, '')
  const idMatch = value.match(/^([A-Za-z0-9_-]+)/)
  if (!idMatch) return null
  const id = idMatch[1]
  const rest = value.slice(id.length).trim()
  let label = id
  let shape: FlowNodeShape = 'rect'

  const quoted = rest.match(/^\["(.+)"\]$/) || rest.match(/^\['(.+)'\]$/)
  const bracket = rest.match(/^\[(.+)\]$/)
  const diamond = rest.match(/^\{(.+)\}$/)
  const round = rest.match(/^\((.+)\)$/)
  const doubleRound = rest.match(/^\(\((.+)\)\)$/)

  if (quoted) {
    label = quoted[1]
  } else if (diamond) {
    label = diamond[1]
    shape = 'diamond'
  } else if (doubleRound) {
    label = doubleRound[1]
    shape = 'round'
  } else if (round) {
    label = round[1]
    shape = 'round'
  } else if (bracket) {
    label = bracket[1]
  }

  return { id, label: label.trim(), shape }
}

function parseEdge(line: string): FlowEdge | null {
  const directWithPipe = line.match(/^(.+?)\s*-->\s*\|(.+?)\|\s*(.+)$/)
  if (directWithPipe) {
    const from = parseNodeRef(directWithPipe[1])
    const to = parseNodeRef(directWithPipe[3])
    if (!from || !to) return null
    return { from: from.id, to: to.id, label: directWithPipe[2].trim() }
  }

  const directWithText = line.match(/^(.+?)\s*--\s*(.+?)\s*-->\s*(.+)$/)
  if (directWithText) {
    const from = parseNodeRef(directWithText[1])
    const to = parseNodeRef(directWithText[3])
    if (!from || !to) return null
    return { from: from.id, to: to.id, label: directWithText[2].trim() }
  }

  const direct = line.match(/^(.+?)\s*-->\s*(.+)$/)
  if (!direct) return null
  const from = parseNodeRef(direct[1])
  const to = parseNodeRef(direct[2])
  if (!from || !to) return null
  return { from: from.id, to: to.id }
}

function parseSimpleFlowchart(source: string) {
  const parts = source
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
  const headerIndex = parts.findIndex((line) => /^(graph|flowchart)\s+(TD|TB|BT|LR|RL)\b/i.test(line))
  if (headerIndex === -1) return null
  const direction = parts[headerIndex].match(/^(?:graph|flowchart)\s+(TD|TB|BT|LR|RL)\b/i)?.[1].toUpperCase() || 'TD'
  const lines = parts.slice(headerIndex + 1)
  if (!lines.length) return null

  const nodes = new Map<string, FlowNode>()
  const edges: FlowEdge[] = []
  const order: string[] = []
  const addNode = (node: FlowNode | null) => {
    if (!node) return
    if (!nodes.has(node.id)) {
      nodes.set(node.id, node)
      order.push(node.id)
      return
    }
    const current = nodes.get(node.id)
    if (current && current.label === node.id && node.label !== node.id) nodes.set(node.id, node)
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/^[-\s]+/, '').trim()
    const edge = parseEdge(line)
    if (edge) {
      const directWithPipe = line.match(/^(.+?)\s*-->\s*\|(.+?)\|\s*(.+)$/)
      const directWithText = line.match(/^(.+?)\s*--\s*(.+?)\s*-->\s*(.+)$/)
      const direct = line.match(/^(.+?)\s*-->\s*(.+)$/)
      const edgeMatch = directWithPipe || directWithText || direct
      addNode(parseNodeRef(edgeMatch?.[1] || ''))
      addNode(parseNodeRef(directWithPipe || directWithText ? edgeMatch?.[3] || '' : direct?.[2] || ''))
      edges.push(edge)
      continue
    }
    addNode(parseNodeRef(line))
  }

  if (!order.length || !edges.length) return null
  return { direction, nodes, edges, order }
}

function renderSimpleFlowchart(source: string) {
  const parsed = parseSimpleFlowchart(source)
  if (!parsed) return ''
  const isHorizontal = parsed.direction === 'LR' || parsed.direction === 'RL'
  const horizontalGap = 118
  const labeledEdgeGap = 72
  const plainEdgeGap = 42
  const padding = 36
  const maxNodeWeight = Math.max(
    ...parsed.order.map((id) => textWeight(parsed.nodes.get(id)?.label || id)),
    6
  )
  const nodeWidth = clamp(maxNodeWeight * 8 + 52, 92, 220)
  const nodeHeight = 50
  const diamondWidth = clamp(nodeWidth + 28, 132, 230)
  const diamondHeight = 98
  const columnGap = Math.max(176, nodeWidth + 44)
  const getNodeSize = (id: string) => {
    const shape = parsed.nodes.get(id)?.shape || 'rect'
    return {
      shape,
      w: shape === 'diamond' ? diamondWidth : nodeWidth,
      h: shape === 'diamond' ? diamondHeight : nodeHeight
    }
  }
  const positions = new Map<string, { x: number; y: number; w: number; h: number; shape: FlowNodeShape }>()
  let width = 420
  let height = 190
  const centerY = height / 2

  if (isHorizontal) {
    width = padding * 2 + (parsed.order.length - 1) * horizontalGap + diamondWidth
    parsed.order.forEach((id, index) => {
      const { shape, w, h } = getNodeSize(id)
      const x = padding + index * horizontalGap + w / 2
      positions.set(id, { x, y: centerY, w, h, shape })
    })
  } else {
    const adjacency = new Map<string, string[]>()
    const indegree = new Map<string, number>()
    parsed.order.forEach((id) => {
      adjacency.set(id, [])
      indegree.set(id, 0)
    })
    parsed.edges.forEach((edge) => {
      adjacency.get(edge.from)?.push(edge.to)
      indegree.set(edge.to, (indegree.get(edge.to) || 0) + 1)
    })

    const rankMap = new Map<string, number>()
    const queue = parsed.order.filter((id) => (indegree.get(id) || 0) === 0)
    if (!queue.length) queue.push(parsed.order[0])
    queue.forEach((id) => rankMap.set(id, 0))

    const remainingIndegree = new Map(indegree)
    for (let index = 0; index < queue.length; index += 1) {
      const from = queue[index]
      const fromRank = rankMap.get(from) || 0
      adjacency.get(from)?.forEach((to) => {
        rankMap.set(to, Math.max(rankMap.get(to) || 0, fromRank + 1))
        remainingIndegree.set(to, (remainingIndegree.get(to) || 0) - 1)
        if ((remainingIndegree.get(to) || 0) <= 0 && !queue.includes(to)) queue.push(to)
      })
    }

    parsed.order.forEach((id, index) => {
      if (!rankMap.has(id)) rankMap.set(id, index)
    })

    const rankValues = Array.from(new Set(Array.from(rankMap.values()))).sort((a, b) => a - b)
    const rows = rankValues.map((rank) => parsed.order.filter((id) => rankMap.get(id) === rank))
    const rowHeights = rows.map((row) => Math.max(...row.map((id) => getNodeSize(id).h)))
    const maxRowCount = Math.max(...rows.map((row) => row.length), 1)
    const maxNodeWidth = Math.max(nodeWidth, diamondWidth)
    width = Math.max(420, padding * 2 + maxNodeWidth + (maxRowCount - 1) * columnGap)
    const centerX = width / 2

    const rowGap = (rowIndex: number) => {
      const currentRow = new Set(rows[rowIndex])
      const nextRow = new Set(rows[rowIndex + 1] || [])
      const hasLabel = parsed.edges.some(
        (edge) => currentRow.has(edge.from) && nextRow.has(edge.to) && edge.label
      )
      return hasLabel ? labeledEdgeGap : plainEdgeGap
    }

    let y = padding
    rows.forEach((row, rowIndex) => {
      const rowHeight = rowHeights[rowIndex]
      const rowCenterY = y + rowHeight / 2
      row.forEach((id, columnIndex) => {
        const { shape, w, h } = getNodeSize(id)
        const x = centerX + (columnIndex - (row.length - 1) / 2) * columnGap
        positions.set(id, { x, y: rowCenterY, w, h, shape })
      })
      y += rowHeight + (rowIndex < rows.length - 1 ? rowGap(rowIndex) : 0)
    })
    height = y + padding
  }

  const nodeSvg = parsed.order
    .map((id) => {
      const node = parsed.nodes.get(id)
      const pos = positions.get(id)
      if (!node || !pos) return ''
      const label = escapeHtml(node.label)
      const text = `<text x="${pos.x}" y="${pos.y}" dominant-baseline="middle" text-anchor="middle" style="fill: #111827; font-size: 15px; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${label}</text>`
      if (pos.shape === 'diamond') {
        return `<polygon points="${pos.x},${pos.y - pos.h / 2} ${pos.x + pos.w / 2},${pos.y} ${pos.x},${pos.y + pos.h / 2} ${pos.x - pos.w / 2},${pos.y}" style="fill: #eef2ff; stroke: #818cf8; stroke-width: 1.5;" />${text}`
      }
      const radius = pos.shape === 'round' ? 999 : 2
      return `<rect x="${pos.x - pos.w / 2}" y="${pos.y - pos.h / 2}" width="${pos.w}" height="${pos.h}" rx="${radius}" ry="${radius}" style="fill: #eef2ff; stroke: #818cf8; stroke-width: 1.5;" />${text}`
    })
    .join('')

  const edgeSvg = parsed.edges
    .map((edge) => {
      const from = positions.get(edge.from)
      const to = positions.get(edge.to)
      if (!from || !to) return ''
      const startX = from.x
      const startY = from.y + from.h / 2
      const endX = to.x
      const endY = to.y - to.h / 2
      const labelX = (startX + endX) / 2
      const labelY = (startY + endY) / 2
      const labelWeight = textWeight(edge.label || '')
      const labelWidth = clamp(labelWeight * 7 + 18, 0, 142)
      const isMergingEdge = !edge.label && Math.abs(startX - endX) > 1
      const path = isMergingEdge
        ? `M ${startX} ${startY} C ${startX} ${startY + 30}, ${endX} ${endY - 30}, ${endX} ${endY}`
        : `M ${startX} ${startY} L ${endX} ${endY}`
      const label = edge.label
        ? `<rect x="${labelX - labelWidth / 2}" y="${labelY - 10}" width="${labelWidth}" height="20" rx="0" ry="0" style="fill: rgba(255,255,255,0.92); stroke: none;" /><text x="${labelX}" y="${labelY}" dominant-baseline="middle" text-anchor="middle" style="fill: #475569; font-size: 12px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(
            edge.label
          )}</text>`
        : ''
      return `<path d="${path}" style="fill: none; stroke: #6366f1; stroke-width: 1.5;" marker-end="url(#sp-mermaid-arrow)" />${label}`
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="display: block; width: 100%; height: auto; max-width: 100%; margin: 0; padding: 0; background: transparent;" role="img"><defs><marker id="sp-mermaid-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M 0 0 L 10 5 L 0 10 z" style="fill: #6366f1;" /></marker></defs>${edgeSvg}${nodeSvg}</svg>`
}

function applyStyleToTag(markup: string, tag: string, className: string, style: string) {
  const pattern = new RegExp(`<${tag}([^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*)>`, 'g')
  return markup.replace(pattern, (_match, attrs: string) => {
    if (/style="/.test(attrs)) {
      return `<${tag}${attrs.replace(/style="/, `style="${style} `)}>`
    }
    return `<${tag}${attrs} style="${style}">`
  })
}

function inlineMermaidSvgStyles(svg: string) {
  let result = svg
  result = result.replace(/<style[\s\S]*?<\/style>/g, '')
  result = applyStyleToTag(
    result,
    'rect',
    'label-container',
    'fill: #eef2ff; stroke: #818cf8; stroke-width: 1px;'
  )
  result = applyStyleToTag(
    result,
    'polygon',
    'label-container',
    'fill: #eef2ff; stroke: #818cf8; stroke-width: 1px;'
  )
  result = applyStyleToTag(
    result,
    'path',
    'flowchart-link',
    'fill: none; stroke: #6366f1; stroke-width: 1.5px;'
  )
  result = applyStyleToTag(
    result,
    'path',
    'arrowMarkerPath',
    'fill: #6366f1; stroke: #6366f1; stroke-width: 1px;'
  )
  result = applyStyleToTag(
    result,
    'polygon',
    'arrowMarkerPath',
    'fill: #6366f1; stroke: #6366f1; stroke-width: 1px;'
  )
  result = applyStyleToTag(
    result,
    'circle',
    'arrowMarkerPath',
    'fill: #ffffff; stroke: #6366f1; stroke-width: 1px;'
  )
  result = result.replace(/<rect><\/rect>/g, '<rect style="fill: transparent; stroke: none;"></rect>')
  result = result.replace(/<rect([^>]*)style=""([^>]*)><\/rect>/g, '<rect$1style="fill: transparent; stroke: none;"$2></rect>')
  result = result.replace(/<text([^>]*)style="/g, '<text$1style="fill: #111827; ')
  result = result.replace(/<text((?:(?!style=)[^>])*)>/g, '<text$1 style="fill: #111827;">')
  result = result.replace(/<tspan([^>]*)style="/g, '<tspan$1style="fill: #111827; ')
  result = result.replace(/<tspan((?:(?!style=)[^>])*)>/g, '<tspan$1 style="fill: #111827;">')
  return result
}

export async function renderMermaidSvg(code: string, theme: Theme) {
  const source = code.trim()
  if (!source) return ''
  const simpleFlowchart = renderSimpleFlowchart(source)
  if (simpleFlowchart) {
    return `<section style="margin: ${theme.variant === 'agentBuilder' ? '0 0 18px' : '0'}; padding: 0; max-width: 100%; overflow-x: auto; text-align: center; color: ${theme.text};">${simpleFlowchart}</section>`
  }
  try {
    initMermaid()
    const id = `sp-mermaid-${Date.now()}-${renderIndex++}`
    const { svg } = await mermaid.render(id, source)
    return `<section style="margin: ${theme.variant === 'agentBuilder' ? '0 0 18px' : '0'}; padding: 0; max-width: 100%; overflow-x: auto; text-align: center; color: ${theme.text};">${inlineMermaidSvgStyles(
      svg
    )}</section>`
  } catch {
    return fallbackMermaid(source, theme)
  }
}
