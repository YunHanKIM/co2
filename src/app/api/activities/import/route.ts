import { NextResponse } from 'next/server'
import { emissionFactors } from '@/data/seed'
import { importActivityRecords } from '@/lib/api'
import {
  parseActivityCsv,
  validateCreateActivity,
  type CreateActivityInput,
} from '@/lib/activity-validation'

type ImportBody = {
  csvText?: string
  records?: unknown[]
}

export const POST = async (request: Request) => {
  let body: ImportBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  let toImport: CreateActivityInput[] = []

  if (Array.isArray(body.records)) {
    const rowErrors: { line: number; message: string }[] = []
    const validated: CreateActivityInput[] = []
    for (let i = 0; i < body.records.length; i++) {
      const v = validateCreateActivity(
        body.records[i] as Partial<CreateActivityInput>,
        emissionFactors,
      )
      if (!v.ok) {
        rowErrors.push({
          line: i + 1,
          message: Object.values(v.errors).join(' · '),
        })
      } else {
        validated.push(v.data)
      }
    }
    if (rowErrors.length > 0) {
      return NextResponse.json({ errors: rowErrors }, { status: 400 })
    }
    toImport = validated
  } else {
    const csvText = typeof body.csvText === 'string' ? body.csvText : ''
    const parsed = parseActivityCsv(csvText, emissionFactors)
    if (!parsed.ok) {
      return NextResponse.json({ errors: parsed.errors }, { status: 400 })
    }
    toImport = parsed.records
  }

  if (toImport.length === 0) {
    return NextResponse.json(
      { errors: [{ line: 0, message: '유효한 데이터 행이 없습니다' }] },
      { status: 400 },
    )
  }

  try {
    const records = await importActivityRecords(toImport)
    return NextResponse.json({ records, count: records.length })
  } catch {
    return NextResponse.json({ error: '일괄 저장에 실패했습니다.' }, { status: 500 })
  }
}
