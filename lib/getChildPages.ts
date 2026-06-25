import type { ExtendedRecordMap } from 'notion-types'
import { getBlockValue } from 'notion-utils'

export interface ChildPage {
  pageId: string
  title: string
  emoji?: string | null
}

// 提取某个页面(by id)下的直接子页面,保持 Notion 顺序
export function getChildPagesOf(recordMap: ExtendedRecordMap, pageId: string): ChildPage[] {
  const blocks = recordMap.block
  const normalized = pageId.replace(/-/g, '')

  let parentBlock: any
  for (const entry of Object.values(blocks)) {
    const b = getBlockValue(entry as any)
    if (b?.id?.replace(/-/g, '') === normalized) {
      parentBlock = b
      break
    }
  }

  if (!parentBlock?.content) return []

  const children: ChildPage[] = []
  for (const childId of parentBlock.content) {
    const b = getBlockValue(blocks[childId] as any)
    if (b?.type === 'page') {
      const title = (b.properties?.title?.[0]?.[0] as string) || 'Untitled'
      const emoji = b.format?.page_icon
      children.push({
        pageId: childId.replace(/-/g, ''),
        title,
        emoji: emoji && !emoji.startsWith('http') ? emoji : null,
      })
    }
  }
  return children
}

// 兼容旧调用名
export function extractChildPages(recordMap: ExtendedRecordMap, rootId: string): ChildPage[] {
  return getChildPagesOf(recordMap, rootId)
}
