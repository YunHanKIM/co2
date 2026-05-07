'use client'

import { useCallback, useMemo, useState } from 'react'
import type { Company, Post } from '@/types'

type PostsBoardProps = {
  initialPosts: Post[]
  companies: Company[]
}

type FormState = {
  id: string | undefined
  title: string
  resourceUid: string
  dateTime: string
  content: string
}

const emptyForm = (): FormState => ({
  id: undefined,
  title: '',
  resourceUid: '',
  dateTime: '',
  content: '',
})

const MONTH_PATTERN = /^\d{4}-\d{2}$/

const PostsBoard = ({ initialPosts, companies }: PostsBoardProps) => {
  const [posts, setPosts] = useState<Post[]>(() =>
    [...initialPosts].sort((a, b) => b.dateTime.localeCompare(a.dateTime)),
  )
  const [form, setForm] = useState<FormState>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  )
  const [saveState, setSaveState] = useState<'idle' | 'loading'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

  const companyNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of companies) {
      m.set(c.id, c.name)
    }
    return m
  }, [companies])

  const validate = useCallback((f: FormState) => {
    const err: Partial<Record<keyof FormState, string>> = {}
    if (!f.title.trim()) {
      err.title = '제목을 입력하세요'
    }
    if (!f.resourceUid) {
      err.resourceUid = '연결할 회사를 선택하세요'
    }
    if (!f.dateTime.trim()) {
      err.dateTime = '월(YYYY-MM)을 입력하세요'
    } else if (!MONTH_PATTERN.test(f.dateTime.trim())) {
      err.dateTime = '형식은 YYYY-MM 이어야 합니다 (예: 2024-02)'
    }
    if (!f.content.trim()) {
      err.content = '내용을 입력하세요'
    }
    return err
  }, [])

  const handleNewClick = useCallback(() => {
    setForm(emptyForm())
    setFieldErrors({})
    setSaveError(null)
  }, [])

  const handleEditClick = useCallback((post: Post) => {
    setForm({
      id: post.id,
      title: post.title,
      resourceUid: post.resourceUid,
      dateTime: post.dateTime,
      content: post.content,
    })
    setFieldErrors({})
    setSaveError(null)
  }, [])

  const handleFieldChange = useCallback(
    (key: keyof FormState, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }))
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
      setSaveError(null)
    },
    [],
  )

  const persistForm = useCallback(async () => {
    const err = validate(form)
    setFieldErrors(err)
    if (Object.keys(err).length > 0) {
      return
    }

    setSaveState('loading')
    setSaveError(null)

    const payload = {
      id: form.id,
      title: form.title.trim(),
      resourceUid: form.resourceUid,
      dateTime: form.dateTime.trim(),
      content: form.content.trim(),
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          typeof data.message === 'string'
            ? data.message
            : '저장에 실패했습니다. 네트워크 또는 서버 오류일 수 있습니다.',
        )
      }

      const saved = data as Post
      setPosts((prev) => {
        const without = prev.filter((p) => p.id !== saved.id)
        return [...without, saved].sort((a, b) =>
          b.dateTime.localeCompare(a.dateTime),
        )
      })
      setForm(emptyForm())
    } catch (cause) {
      setSaveError(
        cause instanceof Error ? cause.message : '저장에 실패했습니다.',
      )
    } finally {
      setSaveState('idle')
    }
  }, [form, validate])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      void persistForm()
    },
    [persistForm],
  )

  const handleRetry = useCallback(() => {
    void persistForm()
  }, [persistForm])

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-app-text">
          게시글
        </h1>
        <p className="max-w-2xl text-sm text-app-muted">
          회사(<code className="rounded bg-slate-100 px-1">resourceUid</code>)와
          월·제목·본문을 연결합니다. 저장은 가짜 API이며 약 15% 확률로
          실패합니다 — 재시도와 검증 메시지를 확인하세요.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <section
          className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm md:p-5"
          aria-labelledby="posts-list-title"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 id="posts-list-title" className="text-sm font-semibold text-app-text">
              목록
            </h2>
            <button
              type="button"
              className="rounded-lg border border-app-border bg-white px-3 py-1.5 text-xs font-medium text-app-text hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
              onClick={handleNewClick}
            >
              새 글
            </button>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {posts.map((p) => (
              <li key={p.id} className="py-3 first:pt-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-app-text">{p.title}</p>
                    <p className="mt-0.5 text-xs text-app-muted">
                      {companyNameById.get(p.resourceUid) ?? p.resourceUid} ·{' '}
                      {p.dateTime}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-app-muted">
                      {p.content}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg border border-app-border px-2 py-1 text-xs text-app-text hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
                    onClick={() => handleEditClick(p)}
                  >
                    수정
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {posts.length === 0 ? (
            <p className="py-6 text-center text-sm text-app-muted">
              게시글이 없습니다. 오른쪽에서 새 글을 작성하세요.
            </p>
          ) : null}
        </section>

        <section
          className="rounded-xl border border-app-border bg-app-surface p-4 shadow-sm md:p-5"
          aria-labelledby="posts-form-title"
        >
          <h2 id="posts-form-title" className="text-sm font-semibold text-app-text">
            {form.id ? '글 수정' : '새 글 작성'}
          </h2>

          <div
            className="mt-3 min-h-[1.25rem] text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {saveError ? (
              <span>
                {saveError}{' '}
                <button
                  type="button"
                  className="underline underline-offset-2 hover:text-red-700"
                  onClick={handleRetry}
                  disabled={saveState === 'loading'}
                >
                  다시 시도
                </button>
              </span>
            ) : null}
          </div>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="post-title"
                className="text-xs font-medium text-app-muted"
              >
                제목
              </label>
              <input
                id="post-title"
                type="text"
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-app-border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
                value={form.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={
                  fieldErrors.title ? 'post-title-error' : undefined
                }
              />
              {fieldErrors.title ? (
                <p id="post-title-error" className="mt-1 text-xs text-red-600">
                  {fieldErrors.title}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="post-company"
                className="text-xs font-medium text-app-muted"
              >
                회사 (resourceUid)
              </label>
              <select
                id="post-company"
                className="mt-1 w-full rounded-lg border border-app-border bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
                value={form.resourceUid}
                onChange={(e) => handleFieldChange('resourceUid', e.target.value)}
                aria-invalid={Boolean(fieldErrors.resourceUid)}
                aria-describedby={
                  fieldErrors.resourceUid ? 'post-company-error' : undefined
                }
              >
                <option value="">선택…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
              {fieldErrors.resourceUid ? (
                <p id="post-company-error" className="mt-1 text-xs text-red-600">
                  {fieldErrors.resourceUid}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="post-month"
                className="text-xs font-medium text-app-muted"
              >
                월 (YYYY-MM)
              </label>
              <input
                id="post-month"
                type="text"
                inputMode="numeric"
                placeholder="2024-02"
                className="mt-1 w-full rounded-lg border border-app-border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
                value={form.dateTime}
                onChange={(e) => handleFieldChange('dateTime', e.target.value)}
                aria-invalid={Boolean(fieldErrors.dateTime)}
                aria-describedby={
                  fieldErrors.dateTime ? 'post-month-error' : undefined
                }
              />
              {fieldErrors.dateTime ? (
                <p id="post-month-error" className="mt-1 text-xs text-red-600">
                  {fieldErrors.dateTime}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="post-content"
                className="text-xs font-medium text-app-muted"
              >
                내용
              </label>
              <textarea
                id="post-content"
                rows={4}
                className="mt-1 w-full resize-y rounded-lg border border-app-border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
                value={form.content}
                onChange={(e) => handleFieldChange('content', e.target.value)}
                aria-invalid={Boolean(fieldErrors.content)}
                aria-describedby={
                  fieldErrors.content ? 'post-content-error' : undefined
                }
              />
              {fieldErrors.content ? (
                <p id="post-content-error" className="mt-1 text-xs text-red-600">
                  {fieldErrors.content}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saveState === 'loading'}
                className="inline-flex items-center justify-center rounded-lg bg-app-accent px-4 py-2 text-sm font-medium text-white hover:bg-app-accent-hover disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft focus-visible:ring-offset-2"
              >
                {saveState === 'loading' ? '저장 중…' : '저장'}
              </button>
              <button
                type="button"
                className="text-sm text-app-muted underline-offset-2 hover:underline"
                onClick={handleNewClick}
                disabled={saveState === 'loading'}
              >
                폼 비우기
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

export { PostsBoard }
