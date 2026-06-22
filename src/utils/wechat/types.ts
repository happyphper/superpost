export interface FormatResult {
  html: string
  plainText: string
  theme: string
}

export interface FormatOptions {
  fontSize?: number
  showSectionNumbers?: boolean
  showFigureNumbers?: boolean
  showGridBackground?: boolean
}

export type Theme = {
  label?: string
  text: string
  muted: string
  primary: string
  soft: string
  codeBg: string
  codeText: string
  accent?: string
  background?: string
  border?: string
  surface?: string
  style?: string
  variant?: 'analytics' | 'education' | 'light' | 'agentBuilder'
}

export type LabelAlign = 'left' | 'center' | 'right'

export type BlockLabel = {
  text: string
  align: LabelAlign
}

export type QuoteTone = 'default' | 'primary' | 'success' | 'info' | 'warning' | 'danger'

export type ListItem = {
  text: string
  level: number
}

export type TocItem = {
  level: 2 | 3
  text: string
}

export type FrontMatter = {
  title?: string
  date?: Date
  author?: string
  titleHide?: boolean
}
