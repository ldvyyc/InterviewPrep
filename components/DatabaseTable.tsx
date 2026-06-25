import { useMemo, useState } from 'react'
import type { RenderedDatabase } from '@/lib/getDatabases'

export default function DatabaseTable({ db }: { db: RenderedDatabase }) {
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() => {
    let rows = db.rows
    if (filter.trim()) {
      const q = filter.trim().toLowerCase()
      rows = rows.filter((r) =>
        Object.values(r.cells).some((v) => v.toLowerCase().includes(q))
      )
    }
    if (sortCol) {
      rows = [...rows].sort((a, b) => {
        const av = a.cells[sortCol] || ''
        const bv = b.cells[sortCol] || ''
        // 数字优先按数值排
        const an = parseFloat(av), bn = parseFloat(bv)
        let cmp: number
        if (!isNaN(an) && !isNaN(bn)) cmp = an - bn
        else cmp = av.localeCompare(bv, 'zh')
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [db.rows, filter, sortCol, sortDir])

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  return (
    <div className="db-table-wrap">
      <div className="db-table-head">
        <span className="db-table-title">{db.title}</span>
        <input
          className="db-table-filter"
          placeholder="筛选…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <span className="db-table-count">{filtered.length} / {db.rows.length}</span>
      </div>
      <div className="db-table-scroll">
        <table className="db-table">
          <thead>
            <tr>
              {db.columns.map((col) => (
                <th key={col.name} onClick={() => handleSort(col.name)}>
                  <span className="db-th-inner">
                    {col.name}
                    <span className="db-sort-icon">
                      {sortCol === col.name ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                {db.columns.map((col) => (
                  <td key={col.name}>{row.cells[col.name] || ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
