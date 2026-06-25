import { Client } from '@notionhq/client'

const client = new Client({ auth: process.env.NOTION_TOKEN })

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// 串行限流(和 notion.ts 同源思路,独立一份避免循环依赖)
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

async function listChildren(blockId: string): Promise<any[]> {
  const results: any[] = []
  let cursor: string | undefined = undefined
  do {
    const resp: any = await schedule(() =>
      client.blocks.children.list({ block_id: blockId, start_cursor: cursor, page_size: 100 })
    )
    results.push(...resp.results)
    cursor = resp.has_more ? resp.next_cursor : undefined
  } while (cursor)
  return results
}

export interface DiscoveredPage {
  id: string  // 32位无连字符
}

// 从根页面递归发现所有 child_page(任意层级)
export async function discoverAllPages(rootId: string): Promise<DiscoveredPage[]> {
  const found = new Map<string, DiscoveredPage>()
  const visited = new Set<string>()

  async function walk(pageId: string) {
    const norm = pageId.replace(/-/g, '')
    if (visited.has(norm)) return
    visited.add(norm)

    let children: any[]
    try {
      children = await listChildren(pageId)
    } catch (err) {
      console.warn('discover: failed to list children of', pageId.slice(0, 8), (err as Error).message)
      return
    }

    for (const block of children) {
      if (block.type === 'child_page') {
        const childId = block.id.replace(/-/g, '')
        if (!found.has(childId)) {
          found.set(childId, { id: childId })
        }
        await walk(block.id) // 递归进入子页面
      }
    }
  }

  await walk(rootId)
  return Array.from(found.values())
}
