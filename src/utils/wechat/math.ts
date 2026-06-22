import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'
import type { Theme } from './types'
import { escapeHtml } from './helpers'

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)

const tex = new TeX({
  packages: AllPackages
})
const svg = new SVG({
  fontCache: 'none'
})
const html = mathjax.document('', {
  InputJax: tex,
  OutputJax: svg
})

function extractSvg(markup: string) {
  return markup.match(/<svg[\s\S]*<\/svg>/)?.[0] || ''
}

function addSvgStyle(svgMarkup: string, display: boolean) {
  const extraStyle = display
    ? 'display: inline-block; max-width: 100%; height: auto;'
    : 'display: inline-block; max-width: 100%; height: auto;'

  if (/style="/.test(svgMarkup)) {
    return svgMarkup.replace(/<svg([^>]*)style="/, `<svg$1style="${extraStyle} `)
  }
  return svgMarkup.replace('<svg', `<svg style="${extraStyle}"`)
}

export function renderMathSvg(source: string, theme: Theme, display = false) {
  const formula = source.trim()
  if (!formula) return ''

  try {
    const node = html.convert(formula, { display })
    const svgMarkup = addSvgStyle(extractSvg(adaptor.outerHTML(node)), display)
    if (!svgMarkup) throw new Error('MathJax did not return SVG output')

    if (display) {
      return `<section style="margin: ${theme.variant === 'agentBuilder' ? '0 0 18px' : '0'}; padding: 0; overflow-x: auto; text-align: center; color: ${theme.text};">${svgMarkup}</section>`
    }
    return `<span style="display: inline-block; max-width: 100%; vertical-align: -0.15em; color: ${theme.text};">${svgMarkup}</span>`
  } catch {
    const fallback = display ? `$$${formula}$$` : `$${formula}$`
    return `<code style="font-size: 13px; padding: 2px 5px; border-radius: 4px; background: ${theme.soft}; color: ${theme.primary};">${escapeHtml(
      fallback
    )}</code>`
  }
}
