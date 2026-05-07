import { NextResponse } from 'next/server'
import { emissionFactors } from '@/data/seed'
import { importActivityRecords } from '@/lib/api'
import { parseActivityCsv } from '@/lib/activity-validation'

export const POST = async (request: Request) => {
  let body: { csvText?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const csvText = typeof body.csvText === 'string' ? body.csvText : ''
  const parsed = parseActivityCsv(csvText, emissionFactors)
  if (!parsed.ok) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 })
  }

  if (parsed.records.length === 0) {
    return NextResponse.json(
      { errors: [{ line: 0, message: '유효한 데이터 행이 없습니다' }] },
      { status: 400 },
    )
  }

  try {
    const records = await importActivityRecords(parsed.records)
    return NextResponse.json({ records, count: records.length })
  } catch {
    return NextResponse.json({ error: '일괄 저장에 실패했습니다.' }, { status: 500 })
  }
}
