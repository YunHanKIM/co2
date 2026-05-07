'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ActivityCategory, ActivityRecord, EmissionFactorRecord } from '@/types'
import { FACTOR_KEY_CATEGORY } from '@/lib/activity-validation'

type PcfActivityInputPanelProps = {
  factors: EmissionFactorRecord[]
  onRecordsAdded: (records: ActivityRecord[]) => void
}

const CATEGORY_FORM: { value: ActivityCategory; label: string }[] = [
  { value: 'electricity', label: '전기' },
  { value: 'raw_material', label: '원소재' },
  { value: 'transport', label: '운송' },
]

const emptyForm = () => ({
  occurredOn: '',
  category: 'electricity' as ActivityCategory,
  factorKey: '',
  description: '',
  quantity: '',
})

const PcfActivityInputPanel = ({
  factors,
  onRecordsAdded,
}: PcfActivityInputPanelProps) => {
  const [mode, setMode] = useState<'form' | 'csv'>('form')
  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formSave, setFormSave] = useState<'idle' | 'loading'>('idle')
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const [csvText, setCsvText] = useState('')
  const [csvSave, setCsvSave] = useState<'idle' | 'loading'>('idle')
  const [csvErrors, setCsvErrors] = useState<{ line: number; message: string }[]>(
    [],
  )
  const [csvMessage, setCsvMessage] = useState<string | null>(null)

  const factorsForCategory = useMemo(() => {
    return factors.filter((f) => FACTOR_KEY_CATEGORY[f.key] === form.category)
  }, [factors, form.category])

  useEffect(() => {
    if (!form.factorKey && factorsForCategory.length > 0) {
      setForm((prev) => ({
        ...prev,
        factorKey: factorsForCategory[0].key,
      }))
    }
  }, [form.factorKey, factorsForCategory])

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const category = e.target.value as ActivityCategory
      setForm((prev) => {
        const nextFactors = factors.filter(
          (f) => FACTOR_KEY_CATEGORY[f.key] === category,
        )
        const firstKey = nextFactors[0]?.key ?? ''
        return { ...prev, category, factorKey: firstKey }
      })
      setFieldErrors({})
      setFormMessage(null)
    },
    [factors],
  )

  const handleFieldChange = useCallback(
    (key: string, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }))
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      setFormMessage(null)
    },
    [],
  )

  const handleSubmitForm = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setFormMessage(null)
      setFieldErrors({})

      const quantity = Number(form.quantity.replace(/,/g, '').trim())
      const selected = factors.find((f) => f.key === form.factorKey)
      const payload = {
        occurredOn: form.occurredOn.trim(),
        category: form.category,
        description: form.description.trim(),
        quantity,
        unit: selected?.unit,
        factorKey: form.factorKey,
      }

      setFormSave('loading')
      try {
        const res = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          if (data.errors && typeof data.errors === 'object') {
            setFieldErrors(data.errors as Record<string, string>)
            return
          }
          setFormMessage(
            typeof data.error === 'string' ? data.error : '저장에 실패했습니다.',
          )
          return
        }

        onRecordsAdded([data as ActivityRecord])
        const keepCat = form.category
        const nextFk =
          factors.find((f) => FACTOR_KEY_CATEGORY[f.key] === keepCat)?.key ?? ''
        setForm({
          occurredOn: '',
          category: keepCat,
          factorKey: nextFk,
          description: '',
          quantity: '',
        })
        setFormMessage('저장되었습니다. 아래 표·차트에 반영됩니다.')
      } finally {
        setFormSave('idle')
      }
    },
    [form, factors, onRecordsAdded],
  )

  const handleImportCsv = useCallback(async () => {
    setCsvErrors([])
    setCsvMessage(null)
    setCsvSave('loading')
    try {
      const res = await fetch('/api/activities/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (Array.isArray(data.errors)) {
          setCsvErrors(data.errors)
          return
        }
        setCsvMessage(
          typeof data.error === 'string' ? data.error : '가져오기에 실패했습니다.',
        )
        return
      }

      const records = data.records as ActivityRecord[]
      onRecordsAdded(records)
      setCsvMessage(`${data.count ?? records.length}건을 추가했습니다.`)
      setCsvText('')
    } finally {
      setCsvSave('idle')
    }
  }, [csvText, onRecordsAdded])

  return (
    <section
      className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm md:p-5"
      aria-labelledby="pcf-input-title"
    >
      <h2 id="pcf-input-title" className="text-sm font-semibold text-app-text">
        활동 데이터 입력
      </h2>
      <p className="mt-1 text-xs text-app-muted">
        잘못된 값은 필드·행 번호와 함께 메시지로 표시됩니다. CSV는 세미콜론(;)으로
        구분합니다.
      </p>

      <div
        className="mt-4 flex gap-2 border-b border-app-border pb-3"
        role="tablist"
        aria-label="입력 방식"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'form'}
          className={[
            'rounded-lg px-3 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft',
            mode === 'form'
              ? 'bg-app-accent text-white'
              : 'bg-slate-100 text-app-muted hover:bg-slate-200',
          ].join(' ')}
          onClick={() => setMode('form')}
        >
          단일 입력
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'csv'}
          className={[
            'rounded-lg px-3 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft',
            mode === 'csv'
              ? 'bg-app-accent text-white'
              : 'bg-slate-100 text-app-muted hover:bg-slate-200',
          ].join(' ')}
          onClick={() => setMode('csv')}
        >
          CSV 붙여넣기
        </button>
      </div>

      {mode === 'form' ? (
        <form className="mt-4 space-y-4" onSubmit={handleSubmitForm} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="act-date"
                className="text-xs font-medium text-app-muted"
              >
                일자 (YYYY-MM-DD)
              </label>
              <input
                id="act-date"
                type="date"
                className="mt-1 w-full rounded-lg border border-app-border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
                value={form.occurredOn}
                onChange={(e) => handleFieldChange('occurredOn', e.target.value)}
                aria-invalid={Boolean(fieldErrors.occurredOn)}
              />
              {fieldErrors.occurredOn ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.occurredOn}</p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="act-category"
                className="text-xs font-medium text-app-muted"
              >
                활동 유형
              </label>
              <select
                id="act-category"
                className="mt-1 w-full rounded-lg border border-app-border bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
                value={form.category}
                onChange={handleCategoryChange}
                aria-invalid={Boolean(fieldErrors.category)}
              >
                {CATEGORY_FORM.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {fieldErrors.category ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.category}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="act-factor"
              className="text-xs font-medium text-app-muted"
            >
              배출계수 (단위 자동)
            </label>
            <select
              id="act-factor"
              className="mt-1 w-full rounded-lg border border-app-border bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
              value={form.factorKey}
              onChange={(e) => handleFieldChange('factorKey', e.target.value)}
              aria-invalid={Boolean(fieldErrors.factorKey)}
              required
            >
              {factorsForCategory.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label} ({f.unit})
                </option>
              ))}
            </select>
            {factorsForCategory.length === 0 ? (
              <p className="mt-1 text-xs text-red-600">
                이 유형에 맞는 배출계수가 없습니다.
              </p>
            ) : null}
            {fieldErrors.factorKey ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.factorKey}</p>
            ) : null}
            {fieldErrors.unit ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.unit}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="act-desc"
              className="text-xs font-medium text-app-muted"
            >
              설명
            </label>
            <input
              id="act-desc"
              type="text"
              className="mt-1 w-full rounded-lg border border-app-border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
              value={form.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="예: 한국전력, 플라스틱 1"
              aria-invalid={Boolean(fieldErrors.description)}
            />
            {fieldErrors.description ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="act-qty"
              className="text-xs font-medium text-app-muted"
            >
              활동량
            </label>
            <input
              id="act-qty"
              type="text"
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-app-border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
              value={form.quantity}
              onChange={(e) => handleFieldChange('quantity', e.target.value)}
              aria-invalid={Boolean(fieldErrors.quantity)}
            />
            {fieldErrors.quantity ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.quantity}</p>
            ) : null}
          </div>

          {formMessage ? (
            <p className="text-sm text-app-accent" role="status">
              {formMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={formSave === 'loading'}
            className="rounded-lg bg-app-accent px-4 py-2 text-sm font-medium text-white hover:bg-app-accent-hover disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
          >
            {formSave === 'loading' ? '저장 중…' : '활동 추가'}
          </button>
        </form>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-app-muted">
            예:{' '}
            <code className="rounded bg-slate-100 px-1">
              2025-01-01;전기;한국전력;110;kWh
            </code>
            <br />
            원소재는 설명에 플라스틱 1/2를 넣거나 6번째 열에 factorKey(
            <code className="rounded bg-slate-100 px-1">raw-plastic-2</code> 등)를
            적습니다.
          </p>
          <textarea
            className="min-h-[140px] w-full rounded-lg border border-app-border px-3 py-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value)
              setCsvErrors([])
              setCsvMessage(null)
            }}
            aria-label="CSV 데이터"
            placeholder={`2025-01-01;전기;한국전력;110;kWh\n2025-01-01;원소재;플라스틱 1;230;kg`}
          />
          {csvErrors.length > 0 ? (
            <ul
              className="max-h-40 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800"
              role="alert"
            >
              {csvErrors.map((err, i) => (
                <li key={`${err.line}-${i}`}>
                  {err.line}행: {err.message}
                </li>
              ))}
            </ul>
          ) : null}
          {csvMessage ? (
            <p className="text-sm text-app-accent" role="status">
              {csvMessage}
            </p>
          ) : null}
          <button
            type="button"
            disabled={csvSave === 'loading' || !csvText.trim()}
            className="rounded-lg bg-app-accent px-4 py-2 text-sm font-medium text-white hover:bg-app-accent-hover disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
            onClick={handleImportCsv}
          >
            {csvSave === 'loading' ? '처리 중…' : '검증 후 일괄 추가'}
          </button>
        </div>
      )}
    </section>
  )
}

export { PcfActivityInputPanel }
