'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState, useCallback } from 'react'
import type { Company, Country } from '@/types'
import {
  aggregateByMonth,
  aggregateBySource,
  filterRows,
  formatYearMonthKo,
  getSourceLabel,
  toEmissionRows,
  totalTons,
} from '@/lib/emissions'

const ChartSkeleton = () => (
  <div
    className="flex h-[280px] items-center justify-center rounded-lg bg-slate-100/80 text-xs text-app-muted"
    aria-hidden
  >
    차트 로딩…
  </div>
)

const EmissionsTrendChart = dynamic(
  () =>
    import('@/components/dashboard/EmissionsTrendChart').then(
      (m) => m.EmissionsTrendChart,
    ),
  { ssr: false, loading: ChartSkeleton },
)

const EmissionsBySourceChart = dynamic(
  () =>
    import('@/components/dashboard/EmissionsBySourceChart').then(
      (m) => m.EmissionsBySourceChart,
    ),
  { ssr: false, loading: ChartSkeleton },
)

type EmissionsDashboardProps = {
  companies: Company[]
  countries: Country[]
}

const EmissionsDashboard = ({ companies, countries }: EmissionsDashboardProps) => {
  const [countryCode, setCountryCode] = useState<'all' | string>('all')
  const [companyId, setCompanyId] = useState<'all' | string>('all')

  const allRows = useMemo(() => toEmissionRows(companies), [companies])

  const filteredRows = useMemo(
    () => filterRows(allRows, { countryCode, companyId }),
    [allRows, countryCode, companyId],
  )

  const monthData = useMemo(() => aggregateByMonth(filteredRows), [filteredRows])
  const sourceData = useMemo(() => aggregateBySource(filteredRows), [filteredRows])
  const sumTons = useMemo(() => totalTons(filteredRows), [filteredRows])

  const companyCountInFilter = useMemo(() => {
    const ids = new Set(filteredRows.map((r) => r.companyId))
    return ids.size
  }, [filteredRows])

  const handleCountryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value
      setCountryCode(v === 'all' ? 'all' : v)
      setCompanyId('all')
    },
    [],
  )

  const handleCompanyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value
      setCompanyId(v === 'all' ? 'all' : v)
    },
    [],
  )

  const companiesForCountry =
    countryCode === 'all'
      ? companies
      : companies.filter((c) => c.country === countryCode)

  const trendTitleId = 'chart-monthly-trend-title'
  const sourceTitleId = 'chart-by-source-title'

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-app-text">
          경영 대시보드
        </h1>
        <p className="max-w-2xl text-sm text-app-muted">
          회사·국가·월별 온실가스 배출(t CO₂e)을 요약합니다. 필터는 브라우저
          상태로만 유지되며, 데이터는 가짜 API에서 불러온 시드입니다.
        </p>
      </header>

      <section
        className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm md:p-5"
        aria-label="필터"
      >
        <h2 className="text-sm font-medium text-app-text">필터</h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <div className="flex min-w-[200px] flex-1 flex-col gap-1">
            <label
              htmlFor="filter-country"
              className="text-xs font-medium text-app-muted"
            >
              국가
            </label>
            <select
              id="filter-country"
              className="rounded-lg border border-app-border bg-white px-3 py-2 text-sm text-app-text outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
              value={countryCode}
              onChange={handleCountryChange}
            >
              <option value="all">전체</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-w-[200px] flex-1 flex-col gap-1">
            <label
              htmlFor="filter-company"
              className="text-xs font-medium text-app-muted"
            >
              회사
            </label>
            <select
              id="filter-company"
              className="rounded-lg border border-app-border bg-white px-3 py-2 text-sm text-app-text outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
              value={companyId}
              onChange={handleCompanyChange}
            >
              <option value="all">전체</option>
              {companiesForCountry.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section aria-label="요약 지표">
        <ul className="grid gap-4 sm:grid-cols-3">
          <li className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm">
            <p className="text-xs font-medium text-app-muted">필터 구간 합계</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-app-text">
              {sumTons.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}
              <span className="ml-1 text-sm font-normal text-app-muted">
                t CO₂e
              </span>
            </p>
          </li>
          <li className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm">
            <p className="text-xs font-medium text-app-muted">포함 회사 수</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-app-text">
              {companyCountInFilter}
            </p>
          </li>
          <li className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm">
            <p className="text-xs font-medium text-app-muted">데이터 포인트</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-app-text">
              {filteredRows.length}
            </p>
          </li>
        </ul>
      </section>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <section
          className="min-w-0 rounded-xl border border-app-border bg-app-surface p-4 shadow-sm md:p-5"
          aria-labelledby={trendTitleId}
        >
          <h2 id={trendTitleId} className="text-sm font-semibold text-app-text">
            월별 배출 추이
          </h2>
          <p className="mt-1 text-xs text-app-muted">
            선택한 필터 기준 월별 t CO₂e 합계
          </p>
          <div className="mt-4">
            <EmissionsTrendChart data={monthData} titleId={trendTitleId} />
          </div>
        </section>

        <section
          className="min-w-0 rounded-xl border border-app-border bg-app-surface p-4 shadow-sm md:p-5"
          aria-labelledby={sourceTitleId}
        >
          <h2 id={sourceTitleId} className="text-sm font-semibold text-app-text">
            배출원별 비중
          </h2>
          <p className="mt-1 text-xs text-app-muted">
            에너지·연료 소스별 합계 (가로 막대)
          </p>
          <div className="mt-4">
            <EmissionsBySourceChart data={sourceData} titleId={sourceTitleId} />
          </div>
        </section>
      </div>

      <section
        className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm md:p-5"
        aria-labelledby="detail-table-title"
      >
        <h2 id="detail-table-title" className="text-sm font-semibold text-app-text">
          상세 행
        </h2>
        <p className="mt-1 text-xs text-app-muted">
          필터가 적용된 원본 레코드 (회사·월·소스)
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-app-border text-xs text-app-muted">
                <th scope="col" className="py-2 pr-4 font-medium">
                  회사
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  국가
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  월
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  배출원
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  배출 (t CO₂e)
                </th>
              </tr>
            </thead>
            <tbody>
              {[...filteredRows]
                .sort((a, b) => {
                  const m = b.yearMonth.localeCompare(a.yearMonth)
                  if (m !== 0) {
                    return m
                  }
                  return a.companyName.localeCompare(b.companyName)
                })
                .map((row) => (
                  <tr
                    key={`${row.companyId}-${row.yearMonth}-${row.source}`}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-2 pr-4 text-app-text">{row.companyName}</td>
                    <td className="py-2 pr-4 tabular-nums text-app-muted">
                      {row.countryCode}
                    </td>
                    <td className="py-2 pr-4 text-app-text">
                      {formatYearMonthKo(row.yearMonth)}
                    </td>
                    <td className="py-2 pr-4 text-app-text">
                      {getSourceLabel(row.source)}
                    </td>
                    <td className="py-2 text-right tabular-nums text-app-text">
                      {row.emissionsTons.toLocaleString('ko-KR', {
                        maximumFractionDigits: 1,
                      })}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {filteredRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-app-muted">
              조건에 맞는 행이 없습니다.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export { EmissionsDashboard }
