import { describe, it, expect } from 'vitest'
import {
  aggregateByMonthBySource,
  collectSourceKeys,
} from '@/lib/emissions'
import type { EmissionRow } from '@/lib/emissions'

const rows: EmissionRow[] = [
  {
    companyId: 'c1',
    companyName: 'A',
    countryCode: 'US',
    yearMonth: '2024-01',
    source: 'diesel',
    emissionsTons: 10,
  },
  {
    companyId: 'c1',
    companyName: 'A',
    countryCode: 'US',
    yearMonth: '2024-01',
    source: 'electricity',
    emissionsTons: 5,
  },
  {
    companyId: 'c1',
    companyName: 'A',
    countryCode: 'US',
    yearMonth: '2024-02',
    source: 'diesel',
    emissionsTons: 3,
  },
]

describe('aggregateByMonthBySource', () => {
  it('pivots sources per month', () => {
    const keys = collectSourceKeys(rows)
    expect(keys).toEqual(['diesel', 'electricity'])
    const pivoted = aggregateByMonthBySource(rows, keys)
    expect(pivoted).toEqual([
      { yearMonth: '2024-01', diesel: 10, electricity: 5 },
      { yearMonth: '2024-02', diesel: 3, electricity: 0 },
    ])
  })
})
