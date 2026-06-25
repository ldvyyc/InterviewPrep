import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { NotionRenderer } from 'react-notion-x'
import { getPage, getPageTitle } from '@/lib/notion'
import { getChildPagesOf } from '@/lib/getChildPages'
import { stripChildPages, pageHasRealContent } from '@/lib/stripChildPages'
import { discoverAllPages } from '@/lib/discoverPages'
import { getDatabasesInPage, RenderedDatabase } from '@/lib/getDatabases'
import { config, cardStyles } from '@/lib/config'
import SectionGrid, { CardData, accentForIndex } from '@/components/SectionGrid'
import DatabaseTable from '@/components/DatabaseTable'
import { useCopyButtons } from '@/components/useCopyButtons'
import type { ExtendedRecordMap } from 'notion-types'

const Code = dynamic(() => import('react-notion-x/build/third-party/code').then((m) => m.Code))
const Collection = dynamic(() => import('react-notion-x/build/third-party/collection').then((m) => m.Collection))
const Equation = dynamic(() => import('react-notion-x/build/third-party/equation').then((m) => m.Equation))

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/(^-|-$)/g, '')
}

interface PageProps {
  recordMap: ExtendedRecordMap | null
  title: string
  cards: CardData[] | null
  databases: RenderedDatabase[]
  hasContent: boolean   // 正文里是否有子页面之外的实质内容
}

export default function NotionPage({ recordMap, title, cards, databases, hasContent }: PageProps) {
  // 给代码块注入复制按钮
  useCopyButtons([recordMap])

  if (!recordMap) {
    return (
      <div className="page">
        <nav className="nav">
          <Link href="/" className="nav-logo nav-logo-link">
            <span className="nav-dot" />
            {config.siteName}
          </Link>
        </nav>
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#888' }}>Page not found.</div>
      </div>
    )
  }

  const hasCards = cards && cards.length > 0

  return (
    <>
      <Head><title>{title} · {config.siteName}</title></Head>
      <div className="page notion-page-wrap">
        <nav className="nav">
          <Link href="/" className="nav-logo nav-logo-link">
            <span className="nav-dot" />
            {config.siteName}
          </Link>
          <Link href="/" className="nav-back"><i className="ti ti-arrow-left" /> All sections</Link>
        </nav>

        {/* 有实质正文内容时,渲染文档卡 */}
        {hasContent ? (
          <div className="doc-shell">
            <NotionRenderer
              recordMap={recordMap}
              fullPage={true}
              darkMode={false}
              showTableOfContents={true}
              minTableOfContentsItems={3}
              disableHeader={true}
              components={{ Code, Collection, Equation, nextLink: Link }}
            />
            {databases.length > 0 && (
              <div className="db-section">
                {databases.map((db) => <DatabaseTable key={db.id} db={db} />)}
              </div>
            )}
          </div>
        ) : (
          /* 纯子页面页:只显示一个标题头,不显示空文档卡 */
          <header className="hero hero-sub-page">
            <Link href="/" className="hero-back"><i className="ti ti-arrow-left" /> All sections</Link>
            <h1 className="hero-title hero-title-sm">{title}</h1>
            {hasCards && (
              <div className="meta-row">
                <span className="meta-pill"><i className="ti ti-layout-cards" /> {cards!.length} pages</span>
              </div>
            )}
          </header>
        )}

        {/* 子页面卡片网格 */}
        {hasCards && (
          <div className="subpages-block">
            {hasContent && <div className="section-label">In this section</div>}
            <SectionGrid cards={cards!} />
          </div>
        )}

        {/* 纯子页面页时,database 也要显示(若有) */}
        {!hasContent && databases.length > 0 && (
          <div className="db-section db-section-standalone">
            {databases.map((db) => <DatabaseTable key={db.id} db={db} />)}
          </div>
        )}

        <footer className="footer">{config.author} · Built with Notion + Next.js</footer>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pages = await discoverAllPages(config.rootNotionPageId)
  const paths: { params: { slug: string } }[] = []
  for (const p of pages) {
    try {
      const recordMap = await getPage(p.id)
      const title = getPageTitle(recordMap) || 'untitled'
      paths.push({ params: { slug: `${slugify(title)}-${p.id}` } })
    } catch {
      console.warn(`skipping page ${p.id.slice(0, 8)} (no access)`)
    }
  }
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<PageProps> = async (context) => {
  const slug = context.params?.slug as string
  const match = slug.match(/([a-f0-9]{32})$/i)
  const pageId = match ? match[1] : slug

  try {
    const rawRecordMap = await getPage(pageId)
    const title = getPageTitle(rawRecordMap) || 'Untitled'
    const children = getChildPagesOf(rawRecordMap, pageId)

    let cards: CardData[] | null = null
    if (children.length > 0) {
      cards = children.map((child, i) => {
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
    }

    // 从正文移除子页面块(改用下方卡片展示),保留其它所有内容
    const recordMap = stripChildPages(rawRecordMap, pageId)

    // 检测 strip 后是否还有实质内容(文字/公式/代码/图片等)
    const hasContent = pageHasRealContent(recordMap, pageId)

    const databases = await getDatabasesInPage(pageId)
    return { props: { recordMap, title, cards, databases, hasContent } }
  } catch (err) {
    console.error('Failed to fetch page', pageId, err)
    return { props: { recordMap: null, title: 'Not found', cards: null, databases: [], hasContent: false } }
  }
}
