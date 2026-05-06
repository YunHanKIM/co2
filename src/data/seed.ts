import type {
  ActivityRecord,
  Company,
  Country,
  EmissionFactorRecord,
  Post,
} from '@/types'


export const countries: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'DE', name: 'Germany' },
  { code: 'KR', name: 'South Korea' },
]

// 회사별 월 배출량
export const companies: Company[] = [
  {
    id: 'c1',
    name: 'Acme Corp',
    country: 'US',
    emissions: [
      { yearMonth: '2024-01', source: 'diesel', emissions: 120 },
      { yearMonth: '2024-02', source: 'diesel', emissions: 110 },
      { yearMonth: '2024-03', source: 'lpg', emissions: 95 },
    ],
  },
  {
    id: 'c2',
    name: 'Globex',
    country: 'DE',
    emissions: [
      { yearMonth: '2024-01', source: 'natural_gas', emissions: 80 },
      { yearMonth: '2024-02', source: 'natural_gas', emissions: 105 },
      { yearMonth: '2024-03', source: 'electricity', emissions: 120 },
    ],
  },
]

export const posts: Post[] = [
  {
    id: 'p1',
    title: 'Sustainability Report',
    resourceUid: 'c1',
    dateTime: '2024-02',
    content: 'Quarterly CO2 update',
  },
]

//배출계수
export const emissionFactors: EmissionFactorRecord[] = [
  {
    key: 'electricity-kepco-default',
    label: '전기 (한국전력 기본값)',
    factorKgCo2ePerUnit: 0.456,
    unit: 'kWh',
    version: '2025-01',
    effectiveFrom: '2025-01-01',
  },
  {
    key: 'raw-plastic-1',
    label: '원소재 (플라스틱 1)',
    factorKgCo2ePerUnit: 2.3,
    unit: 'kg',
    version: '2025-01',
    effectiveFrom: '2025-01-01',
  },
  {
    key: 'raw-plastic-2',
    label: '원소재 (플라스틱 2)',
    factorKgCo2ePerUnit: 3.2,
    unit: 'kg',
    version: '2025-01',
    effectiveFrom: '2025-01-01',
  },
  {
    key: 'transport-truck',
    label: '운송 (트럭)',
    factorKgCo2ePerUnit: 3.5,
    unit: 'ton-km',
    version: '2025-01',
    effectiveFrom: '2025-01-01',
  },
]

let activityId = 0
const nextActivityId = () => `act-${++activityId}`

//CT-045 원본 활동 데이터 
export const activityRecords: ActivityRecord[] = [
  ...(
    [
      ['2025-01-01', 110],
      ['2025-02-01', 112],
      ['2025-03-01', 115],
      ['2025-04-01', 130],
      ['2025-05-01', 120],
      ['2025-06-01', 110],
      ['2025-07-01', 120],
      ['2025-08-01', 111],
      ['2025-05-01', 101],
    ] as const
  ).map(([occurredOn, quantity]) => ({
    id: nextActivityId(),
    occurredOn,
    category: 'electricity' as const,
    description: '한국전력',
    quantity,
    unit: 'kWh' as const,
    factorKey: 'electricity-kepco-default',
  })),
  ...(
    [
      ['2025-01-01', 230, 'raw-plastic-1' as const],
      ['2025-02-01', 340, 'raw-plastic-1' as const],
      ['2025-03-01', 23, 'raw-plastic-2' as const],
      ['2025-03-01', 430, 'raw-plastic-1' as const],
      ['2025-04-01', 510, 'raw-plastic-1' as const],
      ['2025-05-01', 424, 'raw-plastic-1' as const],
      ['2025-05-01', 40, 'raw-plastic-2' as const],
      ['2025-06-01', 450, 'raw-plastic-1' as const],
      ['2025-07-01', 340, 'raw-plastic-1' as const],
      ['2025-07-01', 43, 'raw-plastic-2' as const],
      ['2025-08-01', 230, 'raw-plastic-1' as const],
      ['2025-05-01', 232, 'raw-plastic-1' as const],
    ] as const
  ).map(([occurredOn, quantity, factorKey]) => ({
    id: nextActivityId(),
    occurredOn,
    category: 'raw_material' as const,
    description: factorKey === 'raw-plastic-1' ? '플라스틱 1' : '플라스틱 2',
    quantity,
    unit: 'kg' as const,
    factorKey,
  })),
  ...(
    [
      ['2025-01-01', 41],
      ['2025-02-01', 211],
      ['2025-03-01', 123],
      ['2025-04-01', 42],
      ['2025-05-01', 123],
      ['2025-06-01', 123],
      ['2025-07-01', 41],
      ['2025-08-01', 123],
      ['2025-05-01', 12],
    ] as const
  ).map(([occurredOn, quantity]) => ({
    id: nextActivityId(),
    occurredOn,
    category: 'transport' as const,
    description: '트럭',
    quantity,
    unit: 'ton-km' as const,
    factorKey: 'transport-truck',
  })),
]
