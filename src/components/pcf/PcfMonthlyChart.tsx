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
import type { ActivityCategory } from '@/types'
import type { PcfMonthByCategoryPoint, PcfMonthPoint } from '@/lib/pcf'
import {
  PCF_CATEGORY_COLORS,
  formatYearMonthKo,
  getCategoryLabel,
} from '@/lib/pcf'

type PcfMonthlyChartProps = {
  data: PcfMonthPoint[]
  splitByMonth: PcfMonthByCategoryPoint[]
  categoryFilter: 'all' | ActivityCategory
  titleId: string
}

const handleChartMouseDown = (e: React.MouseEvent) => {
  e.preventDefault()
}

type SplitRow = PcfMonthByCategoryPoint & { label: string }
type TotalRow = PcfMonthPoint & { label: string }

const PcfMonthlyChart = ({
  data,
  splitByMonth,
  categoryFilter,
  titleId,
}: PcfMonthlyChartProps) => {
  const isEmpty =
    categoryFilter === 'all'
      ? splitByMonth.length === 0
      : data.length === 0

  if (isEmpty) {
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

  const showSplit = categoryFilter === 'all'

  const formatKg = (value: unknown) =>
    `${Number(value ?? 0).toLocaleString('ko-KR', { maximumFractionDigits: 1 })} kg`

  const tooltipLabel = (_: unknown, payload: readonly { payload?: { yearMonth?: string } }[]) => {
    const ym = payload?.[0]?.payload?.yearMonth
    return typeof ym === 'string' ? formatYearMonthKo(ym) : ''
  }

  if (showSplit) {
    const chartData: SplitRow[] = splitByMonth.map((d) => ({
      ...d,
      label: formatYearMonthKo(d.yearMonth),
    }))

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
            margin={{ top: 8, right: 8, left: 8, bottom: 28 }}
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
                value: 'kg CO₂e',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#64748b', fontSize: 11 },
              }}
            />
            <Tooltip
              formatter={(value) => [formatKg(value), '배출량']}
              labelFormatter={tooltipLabel}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="line" />
            <Line
              type="monotone"
              dataKey="electricity"
              stroke={PCF_CATEGORY_COLORS.electricity}
              strokeWidth={2}
              dot={{ fill: PCF_CATEGORY_COLORS.electricity, r: 3 }}
              activeDot={{ r: 5 }}
              name={getCategoryLabel('electricity')}
            />
            <Line
              type="monotone"
              dataKey="raw_material"
              stroke={PCF_CATEGORY_COLORS.raw_material}
              strokeWidth={2}
              dot={{ fill: PCF_CATEGORY_COLORS.raw_material, r: 3 }}
              activeDot={{ r: 5 }}
              name={getCategoryLabel('raw_material')}
            />
            <Line
              type="monotone"
              dataKey="transport"
              stroke={PCF_CATEGORY_COLORS.transport}
              strokeWidth={2}
              dot={{ fill: PCF_CATEGORY_COLORS.transport, r: 3 }}
              activeDot={{ r: 5 }}
              name={getCategoryLabel('transport')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const chartData: TotalRow[] = data.map((d) => ({
    ...d,
    label: formatYearMonthKo(d.yearMonth),
  }))

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
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
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
              value: 'kg CO₂e',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#64748b', fontSize: 11 },
            }}
          />
          <Tooltip
            formatter={(value) => [formatKg(value), '배출량']}
            labelFormatter={tooltipLabel}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="kg"
            stroke={PCF_CATEGORY_COLORS[categoryFilter]}
            strokeWidth={2}
            dot={{ fill: PCF_CATEGORY_COLORS[categoryFilter], r: 3 }}
            activeDot={{ r: 5 }}
            name={getCategoryLabel(categoryFilter)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export { PcfMonthlyChart }
