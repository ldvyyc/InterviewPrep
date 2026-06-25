import { Client } from '@notionhq/client'

const client = new Client({ auth: process.env.NOTION_TOKEN })

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// 复用同样的串行限流思路
const MIN_INTERVAL_MS = 380
let lastAt = 0
let chain: Promise<any> = Promise.resolve()
function schedule<T>(fn: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastAt))
    if (wait > 0) await sleep(wait)
    lastAt = Date.now()
    return fn()
  }
  const r = chain.then(run, run)
  chain = r.then(() => undefined, () => undefined)
  return r
}

export interface DbColumn {
  name: string
  type: string
}

export interface DbRow {
  id: string
  cells: Record<string, string>  // 列名 -> 显示文本
}

export interface RenderedDatabase {
  id: string
  title: string
  columns: DbColumn[]
  rows: DbRow[]
}

// 把 Notion property 值转成显示字符串
function propToText(prop: any): string {
  if (!prop) return ''
  switch (prop.type) {
    case 'title':
      return (prop.title || []).map((t: any) => t.plain_text).join('')
    case 'rich_text':
      return (prop.rich_text || []).map((t: any) => t.plain_text).join('')
    case 'number':
      return prop.number != null ? String(prop.number) : ''
    case 'select':
      return prop.select?.name || ''
    case 'multi_select':
      return (prop.multi_select || []).map((s: any) => s.name).join(', ')
    case 'status':
      return prop.status?.name || ''
    case 'date':
      return prop.date?.start || ''
    case 'checkbox':
      return prop.checkbox ? '✓' : ''
    case 'url':
      return prop.url || ''
    case 'email':
      return prop.email || ''
    case 'phone_number':
      return prop.phone_number || ''
    case 'people':
      return (prop.people || []).map((p: any) => p.name || '').join(', ')
    case 'files':
      return (prop.files || []).map((f: any) => f.name || '').join(', ')
    case 'created_time':
      return prop.created_time?.slice(0, 10) || ''
    case 'last_edited_time':
      return prop.last_edited_time?.slice(0, 10) || ''
    case 'formula':
      return propToText({ type: prop.formula?.type, [prop.formula?.type]: prop.formula?.[prop.formula?.type] })
    default:
      return ''
  }
}

async function listChildren(blockId: string): Promise<any[]> {
  const out: any[] = []
  let cursor: string | undefined = undefined
  do {
    const r: any = await schedule(() =>
      client.blocks.children.list({ block_id: blockId, start_cursor: cursor, page_size: 100 })
    )
    out.push(...r.results)
    cursor = r.has_more ? r.next_cursor : undefined
  } while (cursor)
  return out
}

// 查询单个 database 的全部行
async function queryDatabase(dbId: string): Promise<RenderedDatabase | null> {
  try {
    const meta: any = await schedule(() => client.databases.retrieve({ database_id: dbId }))
    const title = (meta.title || []).map((t: any) => t.plain_text).join('') || 'Untitled'

    // 列定义(保留 Notion 中的属性顺序)
    const propEntries = Object.entries(meta.properties || {})
    const columns: DbColumn[] = propEntries.map(([name, def]: [string, any]) => ({
      name,
      type: def.type,
    }))

    // 查询所有行(分页)
    const rows: DbRow[] = []
    let cursor: string | undefined = undefined
    do {
      const resp: any = await schedule(() =>
        client.databases.query({ database_id: dbId, start_cursor: cursor, page_size: 100 })
      )
      for (const page of resp.results) {
        const cells: Record<string, string> = {}
        for (const [name, prop] of Object.entries(page.properties || {})) {
          cells[name] = propToText(prop)
        }
        rows.push({ id: page.id, cells })
      }
      cursor = resp.has_more ? resp.next_cursor : undefined
    } while (cursor)

    return { id: dbId, title, columns, rows }
  } catch (err) {
    console.warn('queryDatabase failed for', dbId.slice(0, 8), (err as Error).message)
    return null
  }
}

// 找出某个页面下所有 child_database,并查询它们的内容
export async function getDatabasesInPage(pageId: string): Promise<RenderedDatabase[]> {
  let children: any[]
  try {
    children = await listChildren(pageId)
  } catch {
    return []
  }

  const dbs: RenderedDatabase[] = []
  for (const block of children) {
    if (block.type === 'child_database') {
      const db = await queryDatabase(block.id)
      if (db && db.rows.length > 0) dbs.push(db)
    }
  }
  return dbs
}
