// ====== 配置区 ======
export const config = {
  // 你的公开 Notion 根页面 ID
  rootNotionPageId: '3899cef30c0f80aaa91cc177f4769993',

  siteName: 'Quant Interview Prep',
  siteTagline: 'Study Hub',
  siteDescription: 'Notes, frameworks, and practice materials — all in one place.',
  author: 'Frank Yu',
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

// ============================================================
// 本地 HTML 资料配置
// ------------------------------------------------------------
// 把你的 HTML 文件放进  public/docs/  目录,然后在这里登记。
// 每一项会在对应 section 页面底部生成一张卡片,点击在【新标签】打开。
//
// 字段说明:
//   file:    public/docs/ 下的文件名(含 .html)
//   title:   卡片显示的标题
//   section: 归到哪个 section(用 Notion 子页面的标题,大小写不敏感)
//   desc:    可选,卡片描述
//   accent:  可选,卡片颜色(blue/green/purple/amber/teal/coral),不填自动配
//
// 以后加新 HTML:把文件丢进 public/docs/,在这里加一行即可,无需改其它代码。
// ============================================================
export interface HtmlResource {
  file: string
  title: string
  section: string
  desc?: string
  accent?: AccentColor
}

export const htmlResources: HtmlResource[] = [
  // ===== Stats =====
  { file: 'hypothesis_testing.html',     title: 'Hypothesis Testing',      section: 'stats', desc: '假设检验:原假设、p 值、各类检验' },
  { file: 'discrete_distributions.html', title: 'Discrete Distributions',  section: 'stats', desc: '离散分布详解' },
  { file: 'normal_dist_guide.html',      title: 'Normal Distribution',     section: 'stats', desc: '正态分布指南' },
  { file: 'monte_carlo_prep.html',       title: 'Monte Carlo',             section: 'stats', desc: '蒙特卡洛方法' },
  { file: 'MLE_MAP.html',                title: 'MLE & MAP',               section: 'stats', desc: '极大似然与最大后验估计' },
  { file: 'mean_median_analysis.html',   title: 'Mean & Median',           section: 'stats', desc: '均值、中位数分析' },
  { file: 'stochastic_processes.html',   title: 'Stochastic Processes',    section: 'stats', desc: '随机过程' },
  { file: 'stochastic_calculus.html',    title: 'Stochastic Calculus',     section: 'stats', desc: '随机微积分' },

  // ===== Maths =====
  { file: 'LinearAlgebra_Guide.html',    title: 'Linear Algebra',          section: 'maths', desc: '线性代数指南' },
  { file: 'linear_regression.html',      title: 'Linear Regression',       section: 'maths', desc: '线性回归' },
  { file: 'linear_programming.html',     title: 'Linear Programming',      section: 'maths', desc: '线性规划' },
  { file: 'taylor_series_quant.html',    title: 'Taylor Series',           section: 'maths', desc: '泰勒级数' },
  { file: 'prob_inequalities.html',      title: 'Probability Inequalities',section: 'maths', desc: '概率不等式' },
  { file: 'probability_inequalities.html', title: 'Probability Inequalities II', section: 'maths', desc: '概率不等式(补充)' },
  { file: 'broken_stick.html',           title: 'Broken Stick Problem',    section: 'maths', desc: '折棍问题' },

  // ===== Brain Teaser =====
  { file: 'card_games_guide.html',       title: 'Card Games',              section: 'brain teaser', desc: '纸牌游戏概率' },
  { file: 'game_theory_sig.html',        title: 'Game Theory',             section: 'brain teaser', desc: '博弈论与信号' },

  // ===== Finance =====
  { file: 'commodities_futures_prep.html', title: 'Commodities & Futures', section: 'finance', desc: '商品与期货' },
  { file: 'sharpe_guide_updated.html',   title: 'Sharpe Ratio',            section: 'finance', desc: 'Sharpe 比率指南' },
  { file: 'systematic_vol_trading_v2.html', title: 'Vol Trading',          section: 'finance', desc: '系统化波动率交易' },
  { file: 'macro_interview_prep.html',   title: 'Macro',                   section: 'finance', desc: '宏观面试准备' },

  // ===== Coding =====
  { file: 'pandas_numpy_prep.html',      title: 'Pandas & NumPy',          section: 'coding', desc: 'pandas / numpy 准备' },
  { file: 'python_ds_reference.html',    title: 'Python Data Structures',  section: 'coding', desc: 'Python 数据结构参考' },
  { file: 'python_stats_packages.html',  title: 'Python Stats Packages',   section: 'coding', desc: 'Python 统计库' },
  { file: 'qr_leetcode_list.html',       title: 'QR LeetCode List',        section: 'coding', desc: 'LeetCode 高频题单' },
  { file: 'quant_live_coding_prep.html', title: 'Live Coding',             section: 'coding', desc: '实时编程准备' },
]

// 取某个 section 下登记的 HTML 资料(section 名大小写不敏感)
export function htmlResourcesForSection(sectionTitle: string): HtmlResource[] {
  const key = sectionTitle.trim().toLowerCase()
  return htmlResources.filter((r) => r.section.trim().toLowerCase() === key)
}
