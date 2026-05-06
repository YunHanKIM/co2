'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SourcePoint } from '@/lib/emissions'

type EmissionsBySourceChartProps = {
  data: SourcePoint[]
  titleId: string
}

const EmissionsBySourceChart = ({
  data,
  titleId,
}: EmissionsBySourceChartProps) => {
  if (data.length === 0) {
    return (
      <div
        className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-app-border bg-slate-50/80 text-sm text-app-muted"
        role="img"
        aria-labelledby={titleId}
      >
        표시할 배출원 데이터가 없습니다.
      </div>
    )
  }

  return (
    <div className="h-[280px] w-full min-w-0" role="presentation">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            label={{
              value: 't CO₂e',
              position: 'insideBottom',
              offset: -4,
              style: { fill: '#64748b', fontSize: 11 },
            }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={88}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value) => [`${Number(value ?? 0)} t`, '배출량']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="tons" fill="#0f766e" radius={[0, 4, 4, 0]} name="배출량" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { EmissionsBySourceChart }
