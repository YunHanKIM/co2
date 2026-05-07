import type {
  ActivityCategory,
  ActivityRecord,
  EmissionFactorRecord,
} from '@/types'

export type PcfComputedRow = {
  id: string
  occurredOn: string
  yearMonth: string
  category: ActivityCategory
  categoryLabel: string
  description: string
  quantity: number
  unit: ActivityRecord['unit']
  factorKey: string
  factorLabel: string
  factorVersion: string
  factorKgCo2ePerUnit: number
  emissionsKgCo2e: number
}

export type PcfFilters = {
  category: 'all' | ActivityCategory
}

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  electricity: '전기',
  raw_material: '원소재',
  transport: '운송',
}

export const getCategoryLabel = (c: ActivityCategory) => CATEGORY_LABELS[c]

/** 차트(유형별 막대·월별 다중 라인) 공통 색 */
export const PCF_CATEGORY_COLORS: Record<ActivityCategory, string> = {
  electricity: '#2563eb',
  raw_material: '#d97706',
  transport: '#7c3aed',
}

export const toYearMonth = (isoDate: string) => {
  const d = isoDate.slice(0, 10)
  const [y, m] = d.split('-')
  if (!y || !m) {
    return isoDate
  }
  return `${y}-${m.padStart(2, '0')}`
}

export const formatYearMonthKo = (ym: string) => {
  const [y, m] = ym.split('-')
  if (!y || !m) {
    return ym
  }
  return `${y}년 ${Number(m)}월`
}

const buildFactorMap = (factors: EmissionFactorRecord[]) => {
  const map = new Map<string, EmissionFactorRecord>()
  for (const f of factors) {
    map.set(f.key, f)
  }
  return map
}

export const computePcfRows = (
  activities: ActivityRecord[],
  factors: EmissionFactorRecord[],
): PcfComputedRow[] => {
  const map = buildFactorMap(factors)
  const rows: PcfComputedRow[] = []

  for (const a of activities) {
    const factor = map.get(a.factorKey)
    if (!factor) {
      continue
    }
    if (factor.unit !== a.unit) {
      continue
    }
    const emissionsKgCo2e = a.quantity * factor.factorKgCo2ePerUnit
    rows.push({
      id: a.id,
      occurredOn: a.occurredOn,
      yearMonth: toYearMonth(a.occurredOn),
      category: a.category,
      categoryLabel: getCategoryLabel(a.category),
      description: a.description,
      quantity: a.quantity,
      unit: a.unit,
      factorKey: factor.key,
      factorLabel: factor.label,
      factorVersion: factor.version,
      factorKgCo2ePerUnit: factor.factorKgCo2ePerUnit,
      emissionsKgCo2e,
    })
  }

  return rows
}

export const filterPcfRows = (
  rows: PcfComputedRow[],
  filters: PcfFilters,
): PcfComputedRow[] => {
  if (filters.category === 'all') {
    return rows
  }
  return rows.filter((r) => r.category === filters.category)
}

export type PcfMonthPoint = { yearMonth: string; kg: number }

export type PcfMonthByCategoryPoint = {
  yearMonth: string
  electricity: number
  raw_material: number
  transport: number
}

export const aggregatePcfByMonthByCategory = (
  rows: PcfComputedRow[],
): PcfMonthByCategoryPoint[] => {
  const m = new Map<
    string,
    { electricity: number; raw_material: number; transport: number }
  >()
  for (const r of rows) {
    const ym = r.yearMonth
    let b = m.get(ym)
    if (!b) {
      b = { electricity: 0, raw_material: 0, transport: 0 }
      m.set(ym, b)
    }
    b[r.category] += r.emissionsKgCo2e
  }
  return [...m.entries()]
    .map(([yearMonth, v]) => ({ yearMonth, ...v }))
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
}

export const aggregatePcfByMonth = (rows: PcfComputedRow[]): PcfMonthPoint[] => {
  const m = new Map<string, number>()
  for (const r of rows) {
    m.set(r.yearMonth, (m.get(r.yearMonth) ?? 0) + r.emissionsKgCo2e)
  }
  return [...m.entries()]
    .map(([yearMonth, kg]) => ({ yearMonth, kg }))
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
}

export type PcfCategoryPoint = {
  category: ActivityCategory
  label: string
  kg: number
}

export const aggregatePcfByCategory = (
  rows: PcfComputedRow[],
): PcfCategoryPoint[] => {
  const m = new Map<ActivityCategory, number>()
  for (const r of rows) {
    m.set(r.category, (m.get(r.category) ?? 0) + r.emissionsKgCo2e)
  }
  return (['electricity', 'raw_material', 'transport'] as const)
    .map((category) => ({
      category,
      label: getCategoryLabel(category),
      kg: m.get(category) ?? 0,
    }))
    .filter((x) => x.kg > 0)
}

export const totalKgCo2e = (rows: PcfComputedRow[]) =>
  rows.reduce((s, r) => s + r.emissionsKgCo2e, 0)
