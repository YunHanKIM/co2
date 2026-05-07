'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonthBySourcePoint } from '@/lib/emissions'
import {
  formatYearMonthKo,
  getEmissionSourceColor,
  getSourceLabel,
} from '@/lib/emissions'

type EmissionsTrendChartProps = {
  splitByMonth: MonthBySourcePoint[]
  sourceKeys: string[]
  titleId: string
}

const handleChartMouseDown = (e: React.MouseEvent) => {
  e.preventDefault()
}

type SplitRow = MonthBySourcePoint & { label: string }

const EmissionsTrendChart = ({
  splitByMonth,
  sourceKeys,
  titleId,
}: EmissionsTrendChartProps) => {
  if (splitByMonth.length === 0 || sourceKeys.length === 0) {
    return (
      <div
        className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-app-border bg-slate-50/80 text-sm text-app-muted"
        role="img"
        aria-labelledby={titleId}
      >
        표시할 월별 데이터가 없습니다.
      </div>
    )
  }

  const chartData: SplitRow[] = splitByMonth.map((d) => ({
    ...d,
    label: formatYearMonthKo(d.yearMonth),
  }))

  const formatTons = (value: unknown) =>
    `${Number(value ?? 0).toLocaleString('ko-KR', { maximumFractionDigits: 2 })} t`

  const tooltipLabel = (
    _: unknown,
    payload: readonly { payload?: { yearMonth?: string } }[],
  ) => {
    const ym = payload?.[0]?.payload?.yearMonth
    return typeof ym === 'string' ? formatYearMonthKo(ym) : ''
  }

  const showLegend = sourceKeys.length > 1

  return (
    <div
      className="chart-root h-[280px] w-full min-w-0 outline-none"
      role="presentation"
      tabIndex={-1}
      onMouseDown={handleChartMouseDown}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 8, bottom: showLegend ? 28 : 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            label={{
              value: 't CO₂e',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#64748b', fontSize: 11 },
            }}
          />
          <Tooltip
            formatter={(value) => [formatTons(value), '배출량']}
            labelFormatter={tooltipLabel}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
            }}
          />
          {showLegend ? (
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="line" />
          ) : null}
          {sourceKeys.map((key) => {
            const color = getEmissionSourceColor(key)
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 3 }}
                activeDot={{ r: 5 }}
                name={getSourceLabel(key)}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export { EmissionsTrendChart }
