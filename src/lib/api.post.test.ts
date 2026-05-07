import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createOrUpdatePost, resetFakeBackend } from '@/lib/api'

describe('createOrUpdatePost (simulated network + random failure)', () => {
  beforeEach(() => {
    resetFakeBackend()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('persists a new post when write simulation succeeds', async () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.99)

    const promise = createOrUpdatePost({
      title: 'New title',
      resourceUid: 'c1',
      dateTime: '2024-03',
      content: 'Body',
    })
    await vi.runAllTimersAsync()
    const post = await promise

    expect(post.title).toBe('New title')
    expect(post.id).toBeTruthy()
  })

  it('throws when write simulation fails (retry UX in UI)', async () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.01)

    const promise = createOrUpdatePost({
      title: 'New title',
      resourceUid: 'c1',
      dateTime: '2024-03',
      content: 'Body',
    })
    const failing = expect(promise).rejects.toThrow('Save failed')
    await vi.runAllTimersAsync()
    await failing
  })
})
