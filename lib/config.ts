// ====== 配置区 ======
export const config = {
  // 你的公开 Notion 根页面 ID
  rootNotionPageId: '3899cef30c0f80aaa91cc177f4769993',

  siteName: 'Interview Prep',
  siteTagline: 'Study Hub',
  siteDescription: 'Notes, frameworks, and practice materials — all in one place.',
  author: 'Joe',
}

export type AccentColor = 'blue' | 'green' | 'purple' | 'amber' | 'teal' | 'coral'

// 卡片样式映射:key 是 Notion 子页面的标题(大小写不敏感、忽略首尾空格)。
// 构建时会自动从根页面抓取所有子页面;这里只负责给每个标题配图标/颜色/描述。
// 没在这里配置的子页面会用 fallback 样式(灰色 + 默认图标),仍然可点。
export interface CardStyle {
  icon: string
  accent: AccentColor
  description?: string  // 不填则用 Notion 页面本身(目前留空)
}

export const cardStyles: Record<string, CardStyle> = {
  'actual interview question':  { icon: 'monocle',          accent: 'blue',   description: 'Real questions from past interviews, by company and round.' },
  'actual interview questions': { icon: 'monocle',          accent: 'blue',   description: 'Real questions from past interviews, by company and round.' },
  'resume & behavioral':        { icon: 'user-check',       accent: 'coral',  description: 'STAR stories, resume talking points, behavioral frameworks.' },
  'industry related':           { icon: 'building-bank',    accent: 'purple', description: 'Domain knowledge, market structure, sector-specific notes.' },
  'brain teaser':               { icon: 'bulb',             accent: 'amber',  description: 'Probability puzzles, logic problems, quant brain teasers.' },
  'maths':                      { icon: 'math-symbols',     accent: 'teal',   description: 'Core math review, mental math drills, useful identities.' },
  'stats':                      { icon: 'chart-histogram',  accent: 'blue',   description: 'Probability, distributions, hypothesis testing, regression.' },
  'finance':                    { icon: 'coin',             accent: 'green',  description: 'Pricing, derivatives, portfolio theory, market concepts.' },
  'coding':                     { icon: 'code',             accent: 'purple', description: 'Algorithm patterns, data structures, LeetCode solutions.' },
  'machine learning':           { icon: 'brain',            accent: 'coral',  description: 'ML fundamentals, model concepts, common ML interview Qs.' },
  'companies':                  { icon: 'briefcase',        accent: 'amber',  description: 'Company research, culture notes, key talking points.' },
}

// 给没匹配到的页面用的默认样式
export const fallbackStyle: CardStyle = { icon: 'file-text', accent: 'blue' }

// 卡片顺序:按这个数组的标题顺序排;没列出的排在后面(按 Notion 原顺序)
export const cardOrder: string[] = [
  'actual interview question',
  'actual interview questions',
  'resume & behavioral',
  'industry related',
  'brain teaser',
  'maths',
  'stats',
  'finance',
  'coding',
  'machine learning',
  'companies',
]
