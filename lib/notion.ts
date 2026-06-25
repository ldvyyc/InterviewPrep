import { Client } from '@notionhq/client'
import { NotionCompatAPI } from 'notion-compat'
import { getPageTitle, idToUuid } from 'notion-utils'
import type { ExtendedRecordMap } from 'notion-types'

// 官方 API client(需要 NOTION_TOKEN 环境变量)
const notion = new NotionCompatAPI(
  new Client({ auth: process.env.NOTION_TOKEN })
)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// 内存缓存:同一页面只抓一次,getStaticPaths 与 getStaticProps 之间共享
const cache = new Map<string, ExtendedRecordMap>()

// 官方 API 限流约 3 req/s。串行 + 间隔,稳妥不被限。
const MIN_INTERVAL_MS = 380
let lastRequestAt = 0
let chain: Promise<any> = Promise.resolve()

function schedule<T>(fn: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestAt))
    if (wait > 0) await sleep(wait)
    lastRequestAt = Date.now()
    return fn()
  }
  const result = chain.then(run, run)
  chain = result.then(() => undefined, () => undefined)
  return result
}

export async function getPage(pageId: string, retries = 5): Promise<ExtendedRecordMap> {
  const normalized = pageId.replace(/-/g, '')
  if (cache.has(normalized)) return cache.get(normalized)!

  let lastErr: any
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const recordMap = await schedule(() => notion.getPage(pageId)) as ExtendedRecordMap
      cache.set(normalized, recordMap)
      return recordMap
    } catch (err: any) {
      lastErr = err
      // 权限类错误(无权访问 / 找不到)重试也没用,直接抛出让上层跳过
      const code = err?.code || err?.body?.code
      if (code === 'object_not_found' || code === 'unauthorized' || code === 'validation_error') {
        throw err
      }
      const is429 = err?.status === 429 || code === 'rate_limited' || err?.message?.includes('429')
      const wait = (is429 ? 2000 : 800) * Math.pow(1.6, attempt - 1) + Math.random() * 500
      console.warn(`getPage ${attempt}/${retries} ${pageId.slice(0,8)} ${is429 ? '429' : 'err'} → wait ${Math.round(wait)}ms`)
      if (attempt < retries) await sleep(wait)
    }
  }
  throw lastErr
}

export { getPageTitle, idToUuid }
