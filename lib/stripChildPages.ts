import type { ExtendedRecordMap } from 'notion-types'
import { getBlockValue } from 'notion-utils'

// 返回一个新的 recordMap,其中当前页面的正文移除了所有"直接子页面"block
// (子页面改用卡片展示)。不修改原对象,避免污染缓存。
export function stripChildPages(recordMap: ExtendedRecordMap, pageId: string): ExtendedRecordMap {
  const normalized = pageId.replace(/-/g, '')
  const blocks = recordMap.block

  // 定位当前页面 block 在 map 中的 key
  let pageKey: string | undefined
  let pageValue: any
  for (const [key, entry] of Object.entries(blocks)) {
    const b = getBlockValue(entry as any)
    if (b?.id?.replace(/-/g, '') === normalized) {
      pageKey = key
      pageValue = b
      break
    }
  }

  if (!pageKey || !pageValue?.content) return recordMap

  const filtered = pageValue.content.filter((childId: string) => {
    const b = getBlockValue(blocks[childId] as any)
    return b?.type !== 'page'
  })

  // 找到 content 实际所在的层级,生成不可变副本
  const origEntry: any = blocks[pageKey]
  let newEntry: any

  if (origEntry?.value?.value && getBlockValue(origEntry)?.content === pageValue.content) {
    // 双层嵌套: entry.value.value.content
    newEntry = {
      ...origEntry,
      value: {
        ...origEntry.value,
        value: { ...origEntry.value.value, content: filtered },
      },
    }
  } else {
    // 单层: entry.value.content
    newEntry = {
      ...origEntry,
      value: { ...origEntry.value, content: filtered },
    }
  }

  return {
    ...recordMap,
    block: { ...blocks, [pageKey]: newEntry },
  }
}

// 判断页面在移除子页面后,是否还有"实质内容"
// 空白文本块、纯分隔线不算实质内容;有文字/公式/代码/图片/列表等才算
export function pageHasRealContent(recordMap: ExtendedRecordMap, pageId: string): boolean {
  const normalized = pageId.replace(/-/g, '')
  const blocks = recordMap.block

  let pageValue: any
  for (const entry of Object.values(blocks)) {
    const b = getBlockValue(entry as any)
    if (b?.id?.replace(/-/g, '') === normalized) {
      pageValue = b
      break
    }
  }

  if (!pageValue?.content) return false

  for (const childId of pageValue.content) {
    const b = getBlockValue(blocks[childId] as any)
    if (!b) continue
    const type = b.type

    // 这些类型不算实质内容
    if (type === 'page' || type === 'divider') continue

    // 文本块:检查是否有非空白文字
    if (type === 'text') {
      const title = b.properties?.title
      const text = title ? title.map((t: any[]) => t[0]).join('').trim() : ''
      if (text.length > 0) return true
      continue
    }

    // 其它任何类型(heading/code/equation/image/list/quote/callout/table 等)都算内容
    return true
  }

  return false
}
