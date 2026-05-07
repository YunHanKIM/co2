'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PcfMonthPoint } from '@/lib/pcf'
import { formatYearMonthKo } from '@/lib/pcf'

type PcfMonthlyChartProps = {
  data: PcfMonthPoint[]
  titleId: string
}

const PcfMonthlyChart = ({ data, titleId }: PcfMonthlyChartProps) => {
  if (data.length === 0) {
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

  const chartData = data.map((d) => ({
    ...d,
    label: formatYearMonthKo(d.yearMonth),
  }))

  return (
    <div className="h-[280px] w-full min-w-0" role="presentation">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
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
            formatter={(value) => [
              `${Number(value ?? 0).toLocaleString('ko-KR', { maximumFractionDigits: 1 })} kg`,
              '배출량',
            ]}
            labelFormatter={(_, payload) => {
              const ym = payload?.[0]?.payload?.yearMonth
              return typeof ym === 'string' ? formatYearMonthKo(ym) : ''
            }}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="kg"
            stroke="#0f766e"
            strokeWidth={2}
            dot={{ fill: '#0f766e', r: 3 }}
            activeDot={{ r: 5 }}
            name="배출량"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export { PcfMonthlyChart }
