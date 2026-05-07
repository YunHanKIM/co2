import type {
  ActivityCategory,
  ActivityRecord,
  EmissionFactorRecord,
} from '@/types'

export type CreateActivityInput = Omit<ActivityRecord, 'id'>

/** 배출계수 키 → 활동 유형 (시드와 정합) */
export const FACTOR_KEY_CATEGORY: Record<string, ActivityCategory> = {
  'electricity-kepco-default': 'electricity',
  'raw-plastic-1': 'raw_material',
  'raw-plastic-2': 'raw_material',
  'transport-truck': 'transport',
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Excel 붙여넣기: 2025-01-01, 2025/1/1, 2025.1.1, 05/07/26(MM/DD/YY) 등 → YYYY-MM-DD */
export const normalizeOccurredOn = (raw: string): string | null => {
  const s = raw.trim()
  if (DATE_RE.test(s)) {
    return s
  }
  const norm = s.replace(/\./g, '/').replace(/-/g, '/')
  const chunks = norm.split('/').map((x) => x.trim())
  if (chunks.length !== 3) {
    return null
  }
  const [a, b, c] = chunks
  if (!a || !b || !c) {
    return null
  }
  if (a.length === 4) {
    return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`
  }
  // MM/DD/YY (엑셀 미국식 표시, 예: 05-07-26 → 2026-05-07)
  if ((c.length === 2 || c.length === 4) && /^\d+$/.test(a) && /^\d+$/.test(b)) {
    const month = Number(a)
    const day = Number(b)
    let year = Number(c)
    if (c.length === 2) {
      year = year >= 70 ? 1900 + year : 2000 + year
    }
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
      return null
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  return null
}

/** 탭(Excel 복사) · 세미콜론 · 쉼표(CSV, 따옴표 허용) */
export const splitLineIntoColumns = (line: string): string[] => {
  if (line.includes('\t')) {
    return line.split(/\t/).map((cell) => cell.trim())
  }
  if (line.includes(';')) {
    return line.split(';').map((cell) => cell.trim())
  }
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur.trim())
  return out
}

const isLikelyHeaderRow = (parts: string[]): boolean => {
  if (parts.length < 2) {
    return false
  }
  const c0 = (parts[0] ?? '').toLowerCase()
  const c1 = (parts[1] ?? '').toLowerCase()
  if (c0.includes('일자') || c0 === 'date') {
    return true
  }
  if (c1.includes('활동') && c1.includes('유형')) {
    return true
  }
  if (parts.some((p) => p.includes('배출계수'))) {
    return true
  }
  return false
}

const CATEGORY_KO: Record<string, ActivityCategory> = {
  전기: 'electricity',
  원소재: 'raw_material',
  운송: 'transport',
}

export const normalizeUnit = (
  raw: string,
): ActivityRecord['unit'] | null => {
  const t = raw
    .trim()
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/[–—−]/g, '-')
  if (t === 'kwh') {
    return 'kWh'
  }
  if (t === 'kg') {
    return 'kg'
  }
  if (t === 'ton-km' || t === 'tonkm') {
    return 'ton-km'
  }
  return null
}

export const parseCategoryToken = (token: string): ActivityCategory | null => {
  const s = token.trim()
  if (s in CATEGORY_KO) {
    return CATEGORY_KO[s]
  }
  if (s === 'electricity' || s === 'raw_material' || s === 'transport') {
    return s
  }
  return null
}

export const inferFactorKey = (
  category: ActivityCategory,
  description: string,
  unit: ActivityRecord['unit'],
): string | null => {
  if (category === 'electricity' && unit === 'kWh') {
    return 'electricity-kepco-default'
  }
  if (category === 'transport' && unit === 'ton-km') {
    return 'transport-truck'
  }
  if (category === 'raw_material' && unit === 'kg') {
    if (/플라스틱\s*2|plastic\s*2/i.test(description)) {
      return 'raw-plastic-2'
    }
    return 'raw-plastic-1'
  }
  return null
}

const coerceQuantity = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value === 'string') {
    const n = Number(value.replace(/,/g, '').trim())
    return Number.isFinite(n) ? n : null
  }
  return null
}

export const validateCreateActivity = (
  input: Partial<CreateActivityInput>,
  factors: EmissionFactorRecord[],
):
  | { ok: true; data: CreateActivityInput }
  | { ok: false; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}

  const occurredOn = input.occurredOn?.trim() ?? ''
  if (!occurredOn) {
    errors.occurredOn = '일자는 필수입니다 (YYYY-MM-DD)'
  } else if (!DATE_RE.test(occurredOn)) {
    errors.occurredOn = '일자는 YYYY-MM-DD 형식이어야 합니다'
  }

  if (!input.category) {
    errors.category = '활동 유형을 선택하세요'
  } else if (
    input.category !== 'electricity' &&
    input.category !== 'raw_material' &&
    input.category !== 'transport'
  ) {
    errors.category = '활동 유형이 올바르지 않습니다'
  }

  const description = input.description?.trim() ?? ''
  if (!description) {
    errors.description = '설명을 입력하세요'
  }

  const qty = coerceQuantity(input.quantity)
  if (qty === null) {
    errors.quantity = '활동량은 숫자여야 합니다'
  } else if (qty <= 0) {
    errors.quantity = '활동량은 0보다 커야 합니다'
  }

  if (!input.unit) {
    errors.unit = '단위를 선택하세요'
  }

  const factorKey = input.factorKey?.trim() ?? ''
  if (!factorKey) {
    errors.factorKey = '배출계수(행)을 선택하세요'
  } else {
    const f = factors.find((x) => x.key === factorKey)
    if (!f) {
      errors.factorKey = '등록되지 않은 배출계수 키입니다'
    } else {
      if (input.unit && f.unit !== input.unit) {
        errors.unit = `이 계수의 단위는 ${f.unit} 입니다`
      }
      const expected = FACTOR_KEY_CATEGORY[factorKey]
      if (expected && input.category && expected !== input.category) {
        errors.factorKey = '활동 유형과 선택한 배출계수가 맞지 않습니다'
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      occurredOn,
      category: input.category as ActivityCategory,
      description,
      quantity: qty as number,
      unit: input.unit as ActivityRecord['unit'],
      factorKey,
    },
  }
}

export type CsvImportRowError = { line: number; message: string }

/**
 * 2차원 셀 배열 → 검증된 활동 행 (Excel·붙여넣기 공통)
 * 열: 일자 | 활동 유형 | 설명 | 양 | 단위 [, factorKey]
 */
export const parseActivityMatrix = (
  matrix: string[][],
  factors: EmissionFactorRecord[],
):
  | { ok: true; records: CreateActivityInput[] }
  | { ok: false; errors: CsvImportRowError[] } => {
  if (matrix.length === 0) {
    return { ok: false, errors: [{ line: 1, message: '데이터가 비어 있습니다' }] }
  }

  const rowErrors: CsvImportRowError[] = []
  const records: CreateActivityInput[] = []

  let i = 0
  const headParts = (matrix[0] ?? []).map((c) => String(c ?? '').trim())
  if (isLikelyHeaderRow(headParts)) {
    i = 1
  }

  for (; i < matrix.length; i++) {
    const lineNum = i + 1
    const rawParts = (matrix[i] ?? []).map((c) => String(c ?? '').trim())
    const hasContent = rawParts.some((p) => p.length > 0)
    if (!hasContent) {
      continue
    }

    const parts = rawParts.filter((p, idx) => {
      if (idx < 5) {
        return true
      }
      return p.length > 0
    })

    if (parts.length < 5) {
      rowErrors.push({
        line: lineNum,
        message:
          '열 5개 필요: 일자, 활동유형(전기/원소재/운송), 설명, 양, 단위',
      })
      continue
    }

    const dRaw = parts[0] ?? ''
    const catTok = parts[1] ?? ''
    const desc = parts[2] ?? ''
    const qtyRaw = parts[3] ?? ''
    const unitTok = parts[4] ?? ''
    const factorOpt = parts[5]?.trim() ?? ''

    const d = normalizeOccurredOn(dRaw)
    if (!d) {
      rowErrors.push({
        line: lineNum,
        message: `일자를 해석할 수 없습니다: ${dRaw} (YYYY-MM-DD 또는 YYYY/M/D)`,
      })
      continue
    }
    const cat = parseCategoryToken(catTok)
    if (!cat) {
      rowErrors.push({
        line: lineNum,
        message: `활동 유형을 알 수 없습니다: ${catTok} (전기/원소재/운송)`,
      })
      continue
    }

    const unit = normalizeUnit(unitTok)
    if (!unit) {
      rowErrors.push({
        line: lineNum,
        message: `단위 오류: ${unitTok} (kWh, kg, ton-km)`,
      })
      continue
    }

    const qty = coerceQuantity(qtyRaw)
    if (qty === null || qty <= 0) {
      rowErrors.push({
        line: lineNum,
        message: '활동량은 0보다 큰 숫자여야 합니다',
      })
      continue
    }

    if (!desc) {
      rowErrors.push({ line: lineNum, message: '설명이 비어 있습니다' })
      continue
    }

    let factorKey = factorOpt
    if (!factorKey) {
      const inferred = inferFactorKey(cat, desc, unit)
      if (!inferred) {
        rowErrors.push({
          line: lineNum,
          message:
            'factorKey를 6번째 열에 넣거나, 원소재는 설명에 플라스틱 1/2를 적으세요',
        })
        continue
      }
      factorKey = inferred
    }

    const draft: Partial<CreateActivityInput> = {
      occurredOn: d,
      category: cat,
      description: desc,
      quantity: qty,
      unit,
      factorKey,
    }

    const v = validateCreateActivity(draft, factors)
    if (!v.ok) {
      rowErrors.push({
        line: lineNum,
        message: Object.values(v.errors).join(' · '),
      })
      continue
    }
    records.push(v.data)
  }

  if (rowErrors.length > 0) {
    return { ok: false, errors: rowErrors }
  }

  if (records.length === 0) {
    return { ok: false, errors: [{ line: 1, message: '유효한 데이터 행이 없습니다' }] }
  }

  return { ok: true, records }
}

/**
 * 텍스트 붙여넣기: 탭(Excel) · 세미콜론 · 쉼표(CSV)
 */
export const parseActivityCsv = (
  text: string,
  factors: EmissionFactorRecord[],
):
  | { ok: true; records: CreateActivityInput[] }
  | { ok: false; errors: CsvImportRowError[] } => {
  const stripped = text.replace(/^\uFEFF/, '')
  const rawLines = stripped.split(/\r?\n/).map((l) => l.trimEnd())
  const lines = rawLines.filter((l) => l.length > 0)
  if (lines.length === 0) {
    return { ok: false, errors: [{ line: 1, message: '붙여넣을 내용이 비어 있습니다' }] }
  }

  const matrix = lines.map((line) => splitLineIntoColumns(line))
  return parseActivityMatrix(matrix, factors)
}
