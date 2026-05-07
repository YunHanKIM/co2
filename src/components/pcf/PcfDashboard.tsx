'use client'

import dynamic from 'next/dynamic'
import { useCallback, useMemo, useState } from 'react'
import type { ActivityCategory, ActivityRecord, EmissionFactorRecord } from '@/types'
import {
  aggregatePcfByCategory,
  aggregatePcfByMonth,
  computePcfRows,
  filterPcfRows,
  totalKgCo2e,
} from '@/lib/pcf'

const ChartSkeleton = () => (
  <div
    className="flex h-[280px] items-center justify-center rounded-lg bg-slate-100/80 text-xs text-app-muted"
    aria-hidden
  >
    차트 로딩…
  </div>
)

const PcfMonthlyChart = dynamic(
  () =>
    import('@/components/pcf/PcfMonthlyChart').then((m) => m.PcfMonthlyChart),
  { ssr: false, loading: ChartSkeleton },
)

const PcfCategoryChart = dynamic(
  () =>
    import('@/components/pcf/PcfCategoryChart').then((m) => m.PcfCategoryChart),
  { ssr: false, loading: ChartSkeleton },
)

type PcfDashboardProps = {
  activities: ActivityRecord[]
  factors: EmissionFactorRecord[]
}

const CATEGORY_OPTIONS: { value: 'all' | ActivityCategory; label: string }[] = [
  { value: 'all', label: '전체 (활동 유형)' },
  { value: 'electricity', label: '전기 (Scope 2 성격 예시)' },
  { value: 'raw_material', label: '원소재 (Scope 3)' },
  { value: 'transport', label: '운송 (Scope 3)' },
]

const PcfDashboard = ({ activities, factors }: PcfDashboardProps) => {
  const [category, setCategory] = useState<'all' | ActivityCategory>('all')

  const computedAll = useMemo(
    () => computePcfRows(activities, factors),
    [activities, factors],
  )

  const filtered = useMemo(
    () => filterPcfRows(computedAll, { category }),
    [computedAll, category],
  )

  const monthData = useMemo(() => aggregatePcfByMonth(filtered), [filtered])
  const categoryData = useMemo(
    () => aggregatePcfByCategory(filtered),
    [filtered],
  )
  const sumKg = useMemo(() => totalKgCo2e(filtered), [filtered])
  const sumT = sumKg / 1000

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value as 'all' | ActivityCategory
      setCategory(v)
    },
    [],
  )

  const monthlyTitleId = 'pcf-chart-monthly'
  const categoryTitleId = 'pcf-chart-category'

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-app-text">
          PCF 활동 데이터
        </h1>
        <p className="max-w-2xl text-sm text-app-muted">
          원본 활동(전기·원소재·운송)에 배출계수(kg CO₂e/단위)를 곱해 행별
          배출량을 산출합니다.{' '}
        </p>
      </header>

      <section
        className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm md:p-5"
        aria-label="필터"
      >
        <h2 className="text-sm font-medium text-app-text">활동 유형</h2>
        <div className="mt-4 max-w-md">
          <label
            htmlFor="filter-pcf-category"
            className="text-xs font-medium text-app-muted"
          >
            범주
          </label>
          <select
            id="filter-pcf-category"
            className="mt-1 w-full rounded-lg border border-app-border bg-white px-3 py-2 text-sm text-app-text outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
            value={category}
            onChange={handleCategoryChange}
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section aria-label="요약">
        <ul className="grid gap-4 sm:grid-cols-3">
          <li className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm">
            <p className="text-xs font-medium text-app-muted">합계 (kg CO₂e)</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-app-text">
              {sumKg.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
            </p>
          </li>
          <li className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm">
            <p className="text-xs font-medium text-app-muted">합계 (t CO₂e)</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-app-text">
              {sumT.toLocaleString('ko-KR', { maximumFractionDigits: 3 })}
            </p>
          </li>
          <li className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm">
            <p className="text-xs font-medium text-app-muted">활동 행 수</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-app-text">
              {filtered.length}
            </p>
          </li>
        </ul>
      </section>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <section
          className="min-w-0 rounded-xl border border-app-border bg-app-surface p-4 shadow-sm md:p-5"
          aria-labelledby={monthlyTitleId}
        >
          <h2 id={monthlyTitleId} className="text-sm font-semibold text-app-text">
            월별 배출 (활동일 기준)
          </h2>
          <p className="mt-1 text-xs text-app-muted">
            같은 달 여러 행의 kg CO₂e 합계
          </p>
          <div className="mt-4">
            <PcfMonthlyChart data={monthData} titleId={monthlyTitleId} />
          </div>
        </section>

        <section
          className="min-w-0 rounded-xl border border-app-border bg-app-surface p-4 shadow-sm md:p-5"
          aria-labelledby={categoryTitleId}
        >
          <h2 id={categoryTitleId} className="text-sm font-semibold text-app-text">
            활동 유형별 배출
          </h2>
          <p className="mt-1 text-xs text-app-muted">
            전기 / 원소재 / 운송 합계 (필터 적용 후)
          </p>
          <div className="mt-4">
            <PcfCategoryChart data={categoryData} titleId={categoryTitleId} />
          </div>
        </section>
      </div>

      <section
        className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm md:p-5"
        aria-labelledby="pcf-factors-title"
      >
        <h2 id="pcf-factors-title" className="text-sm font-semibold text-app-text">
          적용 배출계수 (시드 버전)
        </h2>
        <p className="mt-1 text-xs text-app-muted">
          별도 테이블·버전 이력 설계 — version / effectiveFrom
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-app-border text-xs text-app-muted">
                <th scope="col" className="py-2 pr-4 font-medium">
                  라벨
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  계수 (kg CO₂e)
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  단위
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  버전
                </th>
                <th scope="col" className="py-2 font-medium">
                  적용 시작
                </th>
              </tr>
            </thead>
            <tbody>
              {factors.map((f) => (
                <tr
                  key={f.key}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-2 pr-4 text-app-text">{f.label}</td>
                  <td className="py-2 pr-4 tabular-nums text-app-text">
                    {f.factorKgCo2ePerUnit}
                  </td>
                  <td className="py-2 pr-4 text-app-muted">{f.unit}</td>
                  <td className="py-2 pr-4 tabular-nums text-app-muted">
                    {f.version}
                  </td>
                  <td className="py-2 tabular-nums text-app-muted">
                    {f.effectiveFrom}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm md:p-5"
        aria-labelledby="pcf-rows-title"
      >
        <h2 id="pcf-rows-title" className="text-sm font-semibold text-app-text">
          산출 상세 (행별)
        </h2>
        <p className="mt-1 text-xs text-app-muted">
          활동량 × 계수 = kg CO₂e (필터 적용)
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-app-border text-xs text-app-muted">
                <th scope="col" className="py-2 pr-3 font-medium">
                  일자
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  유형
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  설명
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">
                  활동량
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  단위
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  계수 라벨
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  kg CO₂e
                </th>
              </tr>
            </thead>
            <tbody>
              {[...filtered]
                .sort((a, b) => {
                  const d = b.occurredOn.localeCompare(a.occurredOn)
                  if (d !== 0) {
                    return d
                  }
                  return a.id.localeCompare(b.id)
                })
                .map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-2 pr-3 whitespace-nowrap text-app-text">
                      {row.occurredOn}
                    </td>
                    <td className="py-2 pr-3 text-app-text">
                      {row.categoryLabel}
                    </td>
                    <td className="py-2 pr-3 text-app-text">{row.description}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-app-text">
                      {row.quantity.toLocaleString('ko-KR')}
                    </td>
                    <td className="py-2 pr-3 text-app-muted">{row.unit}</td>
                    <td className="py-2 pr-3 text-xs text-app-muted">
                      {row.factorLabel}
                    </td>
                    <td className="py-2 text-right tabular-nums text-app-text">
                      {row.emissionsKgCo2e.toLocaleString('ko-KR', {
                        maximumFractionDigits: 1,
                      })}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-app-muted">
              조건에 맞는 활동이 없습니다.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export { PcfDashboard }
