/**
 * HanaLoop Frontend 과제(Emissions Dashboard) + 2026 PCF 대시보드 과제 공통 도메인 타입
 * - 회사·월별 GHG: PDF Data model 섹션
 * - 게시글(Post): Company.id 연결(resourceUid)
 * - 원본 활동 데이터·배출계수: 2026 과제 Excel/PDF "과제용 데이터"
 */

/** 국가 코드 (Company.country, fetchCountries 스텁과 정합) */
export type Country = {
  code: string
  name: string
}

/**
 * 월별 온실가스 배출 (t CO₂e)
 * PDF: yearMonth "2025-01", source "gasoline, lpg, diesel" 등
 */
export type GhgEmission = {
  yearMonth: string
  source: string
  emissions: number
}

export type Company = {
  id: string
  name: string
  country: string
  emissions: GhgEmission[]
}

export type Post = {
  id: string
  title: string
  /** Company.id — PDF 필드명 resourceUid */
  resourceUid: string
  dateTime: string
  content: string
}

/** 2026 과제 활동 유형 (전기 / 원소재 / 운송) */
export type ActivityCategory = 'electricity' | 'raw_material' | 'transport'

/** 원본 활동 1행 — 일자, 유형, 설명, 량, 단위 */
export type ActivityRecord = {
  id: string
  occurredOn: string
  category: ActivityCategory
  description: string
  quantity: number
  unit: 'kWh' | 'kg' | 'ton-km'
  /**
   * 배출계수 레코드와 매핑 (동일 활동·소스에 대해 계수 버전 전환 가능)
   * 예: electricity-kepco-default, raw-plastic-1, transport-truck
   */
  factorKey: string
}

/**
 * 배출계수 (지원자 참고용 표와 동일 수치)
 * PDF 권고: DB 별도 테이블 + 버전 이력 — 여기서는 version/effectiveFrom으로 시드 표현
 */
export type EmissionFactorRecord = {
  key: string
  label: string
  factorKgCo2ePerUnit: number
  unit: 'kWh' | 'kg' | 'ton-km'
  version: string
  effectiveFrom: string
}
