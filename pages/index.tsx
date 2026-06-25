import Head from 'next/head'
import { GetStaticProps } from 'next'
import { config, cardStyles, cardOrder } from '@/lib/config'
import { getPage } from '@/lib/notion'
import { getChildPagesOf } from '@/lib/getChildPages'
import SectionGrid, { CardData, accentForIndex } from '@/components/SectionGrid'

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function Home({ cards }: { cards: CardData[] }) {
  return (
    <>
      <Head>
        <title>{config.siteName}</title>
        <meta name="description" content={config.siteDescription} />
      </Head>

      <div className="page">
        <nav className="nav">
          <div className="nav-logo">
            <span className="nav-dot" />
            {config.siteName}
          </div>
        </nav>

        <header className="hero">
          <div className="hero-label">{config.siteTagline}</div>
          <h1 className="hero-title">{config.siteName}</h1>
          <p className="hero-sub">{config.siteDescription}</p>
          <div className="meta-row">
            <span className="meta-pill"><i className="ti ti-layout-cards" /> {cards.length} sections</span>
            <span className="meta-pill"><i className="ti ti-calendar" /> Updated regularly</span>
          </div>
        </header>

        <div className="section-label">Sections</div>
        <SectionGrid cards={cards} />

        <footer className="footer">
          {config.author} · Built with Notion + Next.js
        </footer>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const recordMap = await getPage(config.rootNotionPageId)
  const children = getChildPagesOf(recordMap, config.rootNotionPageId)

  const orderIndex = (title: string) => {
    const idx = cardOrder.indexOf(title.trim().toLowerCase())
    return idx === -1 ? 999 : idx
  }
  children.sort((a, b) => orderIndex(a.title) - orderIndex(b.title))

  const cards: CardData[] = children.map((child, i) => {
    const key = child.title.trim().toLowerCase()
    const style = cardStyles[key]
    return {
      title: child.title,
      description: style?.description || '',
      icon: style?.icon || '',
      accent: style?.accent || accentForIndex(i),
      emoji: child.emoji ?? null,
      href: `/${slugify(child.title)}-${child.pageId}/`,
    }
  })

  return { props: { cards } }
}
