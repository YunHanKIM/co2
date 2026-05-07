import * as XLSX from 'xlsx'
import type { EmissionFactorRecord } from '@/types'
import {
  parseActivityMatrix,
  type CreateActivityInput,
  type CsvImportRowError,
} from '@/lib/activity-validation'

type ParseResult =
  | { ok: true; records: CreateActivityInput[] }
  | { ok: false; errors: CsvImportRowError[] }

const formatYmd = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

const formatExcelCell = (cell: unknown, colIndex: number): string => {
  if (cell == null || cell === '') {
    return ''
  }
  if (typeof cell === 'boolean') {
    return cell ? 'TRUE' : 'FALSE'
  }
  if (cell instanceof Date && !isNaN(cell.getTime())) {
    return formatYmd(
      cell.getFullYear(),
      cell.getMonth() + 1,
      cell.getDate(),
    )
  }
  if (typeof cell === 'number' && colIndex === 0) {
    if (cell > 2000 && cell < 1000000) {
      const dt = XLSX.SSF.parse_date_code(cell)
      if (dt && dt.y >= 1900 && dt.y <= 2100) {
        return formatYmd(dt.y, dt.m, dt.d)
      }
    }
  }
  if (typeof cell === 'number') {
    return Number.isInteger(cell) ? String(cell) : String(cell)
  }
  return String(cell).trim()
}

/** 첫 시트, 열 순서: 일자 · 활동 유형 · 설명 · 양 · 단위 (과제 시트와 동일) */
export const parseActivityExcelBuffer = (
  buffer: ArrayBuffer,
  factors: EmissionFactorRecord[],
): ParseResult => {
  let wb: XLSX.WorkBook
  try {
    // cellDates: true 는 numdate() 기반 Date로 바꾸며 TZ/DST 에서 하루 밀릴 수 있음.
    // 시리얼 숫자 + parse_date_code 로만 일자를 쓰면 엑셀 캘린더 날짜와 일치함.
    wb = XLSX.read(buffer, { type: 'array', cellDates: false })
  } catch {
    return {
      ok: false,
      errors: [
        {
          line: 0,
          message:
            '엑셀 파일을 읽을 수 없습니다. .xlsx 또는 .xls 형식인지 확인하세요.',
        },
      ],
    }
  }

  const sheetName = wb.SheetNames[0]
  if (!sheetName) {
    return { ok: false, errors: [{ line: 0, message: '워크북에 시트가 없습니다' }] }
  }

  const sheet = wb.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: true,
  }) as unknown[][]

  const matrix: string[][] = rows.map((row) => {
    const arr = Array.isArray(row) ? row : []
    return arr.map((cell, cIdx) => formatExcelCell(cell, cIdx))
  })

  return parseActivityMatrix(matrix, factors)
}
