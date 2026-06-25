import Link from 'next/link'
import { AccentColor } from '@/lib/config'

export const accentHex: Record<AccentColor, { bar: string; iconBg: string; iconFg: string }> = {
  blue:   { bar: '#378ADD', iconBg: '#E6F1FB', iconFg: '#185FA5' },
  green:  { bar: '#639922', iconBg: '#EAF3DE', iconFg: '#3B6D11' },
  purple: { bar: '#7F77DD', iconBg: '#EEEDFE', iconFg: '#534AB7' },
  amber:  { bar: '#BA7517', iconBg: '#FAEEDA', iconFg: '#854F0B' },
  teal:   { bar: '#1D9E75', iconBg: '#E1F5EE', iconFg: '#0F6E56' },
  coral:  { bar: '#D85A30', iconBg: '#FAECE7', iconFg: '#993C1D' },
}

// 一组备选 accent,给没有显式配置的卡片按顺序轮流上色
const ACCENT_CYCLE: AccentColor[] = ['blue', 'coral', 'purple', 'amber', 'teal', 'green']

export function accentForIndex(i: number): AccentColor {
  return ACCENT_CYCLE[i % ACCENT_CYCLE.length]
}

export interface CardData {
  title: string
  description: string
  icon: string
  accent: AccentColor
  href: string
  emoji?: string | null  // 来自 Notion 的页面 emoji,作为图标兜底
}

export default function SectionGrid({ cards }: { cards: CardData[] }) {
  return (
    <main className="grid">
      {cards.map((s) => {
        const c = accentHex[s.accent]
        return (
          <Link key={s.href} href={s.href} className="card-link">
            <div className="card">
              <div className="card-bar" style={{ background: c.bar }} />
              <div className="card-icon" style={{ background: c.iconBg }}>
                {s.icon
                  ? <i className={`ti ti-${s.icon}`} style={{ color: c.iconFg }} />
                  : <span className="card-emoji">{s.emoji || '📄'}</span>}
              </div>
              <div className="card-title">{s.title}</div>
              {s.description && <div className="card-desc">{s.description}</div>}
              <div className="card-footer">
                <span className="card-count">Open</span>
                <i className="ti ti-arrow-right card-arrow" style={{ color: c.bar }} />
              </div>
            </div>
          </Link>
        )
      })}
    </main>
  )
}
