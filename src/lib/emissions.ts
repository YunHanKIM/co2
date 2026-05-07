import type { Company } from '@/types'

export type EmissionRow = {
  companyId: string
  companyName: string
  countryCode: string
  yearMonth: string
  source: string
  emissionsTons: number
}

export type DashboardFilters = {
  countryCode: 'all' | string
  companyId: 'all' | string
}

const SOURCE_LABELS: Record<string, string> = {
  diesel: '디젤',
  lpg: 'LPG',
  natural_gas: '천연가스',
  electricity: '전력',
  gasoline: '휘발유',
}

export const getSourceLabel = (source: string) =>
  SOURCE_LABELS[source] ?? source

/** 경영 대시보드 차트 — 배출원(소스)별 색 */
export const EMISSION_SOURCE_COLORS: Record<string, string> = {
  diesel: '#1e40af',
  lpg: '#c2410c',
  natural_gas: '#ca8a04',
  electricity: '#2563eb',
  gasoline: '#6b7280',
}

export const getEmissionSourceColor = (source: string) =>
  EMISSION_SOURCE_COLORS[source] ?? '#64748b'

export const formatYearMonthKo = (ym: string) => {
  const [y, m] = ym.split('-')
  if (!y || !m) {
    return ym
  }
  return `${y}년 ${Number(m)}월`
}

export const toEmissionRows = (companies: Company[]): EmissionRow[] => {
  const rows: EmissionRow[] = []
  for (const c of companies) {
    for (const e of c.emissions) {
      rows.push({
        companyId: c.id,
        companyName: c.name,
        countryCode: c.country,
        yearMonth: e.yearMonth,
        source: e.source,
        emissionsTons: e.emissions,
      })
    }
  }
  return rows
}

export const filterRows = (
  rows: EmissionRow[],
  filters: DashboardFilters,
): EmissionRow[] =>
  rows.filter((r) => {
    if (filters.countryCode !== 'all' && r.countryCode !== filters.countryCode) {
      return false
    }
    if (filters.companyId !== 'all' && r.companyId !== filters.companyId) {
      return false
    }
    return true
  })

export type MonthPoint = { yearMonth: string; tons: number }

export const aggregateByMonth = (rows: EmissionRow[]): MonthPoint[] => {
  const map = new Map<string, number>()
  for (const r of rows) {
    map.set(r.yearMonth, (map.get(r.yearMonth) ?? 0) + r.emissionsTons)
  }
  return [...map.entries()]
    .map(([yearMonth, tons]) => ({ yearMonth, tons }))
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
}

/** 월별 × 배출원 — 차트용 (각 월에 sourceKeys만큼 필드) */
export type MonthBySourcePoint = {
  yearMonth: string
  [source: string]: number | string
}

export const collectSourceKeys = (rows: EmissionRow[]): string[] =>
  [...new Set(rows.map((r) => r.source))].sort()

export const aggregateByMonthBySource = (
  rows: EmissionRow[],
  sourceKeys: string[],
): MonthBySourcePoint[] => {
  if (sourceKeys.length === 0) {
    return []
  }
  const byMonth = new Map<string, Map<string, number>>()
  for (const r of rows) {
    if (!byMonth.has(r.yearMonth)) {
      byMonth.set(r.yearMonth, new Map())
    }
    const m = byMonth.get(r.yearMonth)!
    m.set(r.source, (m.get(r.source) ?? 0) + r.emissionsTons)
  }
  return [...byMonth.entries()]
    .map(([yearMonth, srcMap]) => {
      const point: MonthBySourcePoint = { yearMonth }
      for (const k of sourceKeys) {
        point[k] = srcMap.get(k) ?? 0
      }
      return point
    })
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
}

export type SourcePoint = { source: string; label: string; tons: number }

export const aggregateBySource = (rows: EmissionRow[]): SourcePoint[] => {
  const map = new Map<string, number>()
  for (const r of rows) {
    map.set(r.source, (map.get(r.source) ?? 0) + r.emissionsTons)
  }
  return [...map.entries()]
    .map(([source, tons]) => ({
      source,
      label: getSourceLabel(source),
      tons,
    }))
    .sort((a, b) => b.tons - a.tons)
}

export const totalTons = (rows: EmissionRow[]) =>
  rows.reduce((sum, r) => sum + r.emissionsTons, 0)
