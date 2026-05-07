import { describe, it, expect } from 'vitest'
import {
  aggregatePcfByMonth,
  aggregatePcfByMonthByCategory,
  computePcfRows,
  totalKgCo2e,
} from '@/lib/pcf'
import type { ActivityRecord, EmissionFactorRecord } from '@/types'

const factors: EmissionFactorRecord[] = [
  {
    key: 'electricity-kepco-default',
    label: '전기',
    factorKgCo2ePerUnit: 0.5,
    unit: 'kWh',
    version: 'v1',
    effectiveFrom: '2025-01-01',
  },
]

const baseActivity: ActivityRecord = {
  id: 'a1',
  occurredOn: '2025-05-07',
  category: 'electricity',
  description: 'test',
  quantity: 100,
  unit: 'kWh',
  factorKey: 'electricity-kepco-default',
}

describe('computePcfRows', () => {
  it('multiplies quantity by factor when units match', () => {
    const rows = computePcfRows([baseActivity], factors)
    expect(rows).toHaveLength(1)
    expect(rows[0].emissionsKgCo2e).toBe(50)
    expect(rows[0].yearMonth).toBe('2025-05')
  })

  it('omits rows when activity unit does not match factor unit', () => {
    const bad: ActivityRecord = { ...baseActivity, unit: 'kg' }
    expect(computePcfRows([bad], factors)).toHaveLength(0)
  })

  it('omits rows when factor key is unknown', () => {
    const bad: ActivityRecord = { ...baseActivity, factorKey: 'missing-key' }
    expect(computePcfRows([bad], factors)).toHaveLength(0)
  })
})

describe('aggregatePcfByMonth', () => {
  it('sums emissions for the same year-month', () => {
    const rows = computePcfRows(
      [baseActivity, { ...baseActivity, id: 'a2', quantity: 20 }],
      factors,
    )
    const months = aggregatePcfByMonth(rows)
    expect(months).toEqual([{ yearMonth: '2025-05', kg: 60 }])
  })
})

describe('aggregatePcfByMonthByCategory', () => {
  it('keeps category buckets per month', () => {
    const multiFactors: EmissionFactorRecord[] = [
      ...factors,
      {
        key: 'raw-plastic-1',
        label: '플라스틱',
        factorKgCo2ePerUnit: 2,
        unit: 'kg',
        version: 'v1',
        effectiveFrom: '2025-01-01',
      },
    ]
    const rows = computePcfRows(
      [
        baseActivity,
        {
          id: 'r1',
          occurredOn: '2025-05-10',
          category: 'raw_material',
          description: '플라스틱 1',
          quantity: 10,
          unit: 'kg',
          factorKey: 'raw-plastic-1',
        },
      ],
      multiFactors,
    )
    const split = aggregatePcfByMonthByCategory(rows)
    expect(split).toEqual([
      {
        yearMonth: '2025-05',
        electricity: 50,
        raw_material: 20,
        transport: 0,
      },
    ])
  })
})

describe('totalKgCo2e', () => {
  it('sums row emissions', () => {
    const rows = computePcfRows(
      [baseActivity, { ...baseActivity, id: 'a2', quantity: 20 }],
      factors,
    )
    expect(totalKgCo2e(rows)).toBe(60)
  })
})
