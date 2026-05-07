import { describe, it, expect } from 'vitest'
import { validateCreateActivity } from '@/lib/activity-validation'
import type { EmissionFactorRecord } from '@/types'

const factors: EmissionFactorRecord[] = [
  {
    key: 'electricity-kepco-default',
    label: '전기 (한국전력 기본값)',
    factorKgCo2ePerUnit: 0.456,
    unit: 'kWh',
    version: '2025-01',
    effectiveFrom: '2025-01-01',
  },
]

describe('validateCreateActivity', () => {
  it('accepts a valid electricity row', () => {
    const v = validateCreateActivity(
      {
        occurredOn: '2025-01-01',
        category: 'electricity',
        description: '한국전력',
        quantity: 10,
        unit: 'kWh',
        factorKey: 'electricity-kepco-default',
      },
      factors,
    )
    expect(v.ok).toBe(true)
    if (v.ok) {
      expect(v.data.quantity).toBe(10)
    }
  })

  it('rejects non YYYY-MM-DD dates', () => {
    const v = validateCreateActivity(
      {
        occurredOn: '01-01-2025',
        category: 'electricity',
        description: 'x',
        quantity: 1,
        unit: 'kWh',
        factorKey: 'electricity-kepco-default',
      },
      factors,
    )
    expect(v.ok).toBe(false)
    if (!v.ok) {
      expect(v.errors.occurredOn).toBeTruthy()
    }
  })

  it('rejects category inconsistent with factor key', () => {
    const v = validateCreateActivity(
      {
        occurredOn: '2025-01-01',
        category: 'transport',
        description: 'x',
        quantity: 1,
        unit: 'kWh',
        factorKey: 'electricity-kepco-default',
      },
      factors,
    )
    expect(v.ok).toBe(false)
    if (!v.ok) {
      expect(v.errors.factorKey).toBeTruthy()
    }
  })
})
