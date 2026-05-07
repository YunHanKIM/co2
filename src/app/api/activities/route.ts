import { NextResponse } from 'next/server'
import { emissionFactors } from '@/data/seed'
import { createActivityRecord } from '@/lib/api'
import {
  validateCreateActivity,
  type CreateActivityInput,
} from '@/lib/activity-validation'

export const POST = async (request: Request) => {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const v = validateCreateActivity(
    body as Partial<CreateActivityInput>,
    emissionFactors,
  )
  if (!v.ok) {
    return NextResponse.json({ errors: v.errors }, { status: 400 })
  }

  try {
    const rec = await createActivityRecord(v.data)
    return NextResponse.json(rec)
  } catch {
    return NextResponse.json({ error: '저장에 실패했습니다.' }, { status: 500 })
  }
}
