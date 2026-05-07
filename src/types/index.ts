// 국가 코드 
export type Country = {
  code: string
  name: string
}

export type GhgEmission = {
    yearMonth: string; // "2025-01", "2025-02", "2025-03"
    source: string; // gasoline, lpg, diesel, etc
    emissions: number; // tons of CO2 equivalent
};

export type Company = {
  id: string
  name: string
  country: string // country.code
  emissions: GhgEmission[]
}

export type Post = {
  id: string
  title: string
  resourceUid: string //company.id
  dateTime: string
  content: string
}

// 활동 유형 (전기 / 원소재 / 운송)
export type ActivityCategory = 'electricity' | 'raw_material' | 'transport'

// 일자, 활동 유형, 설명, 량, 단위
export type ActivityRecord = {
  id: string
  occurredOn: string
  category: ActivityCategory
  description: string
  quantity: number
  unit: 'kWh' | 'kg' | 'ton-km'
  factorKey: string
}

//배출계수
export type EmissionFactorRecord = {
  key: string
  label: string
  factorKgCo2ePerUnit: number
  unit: 'kWh' | 'kg' | 'ton-km'
  version: string
  effectiveFrom: string
}
