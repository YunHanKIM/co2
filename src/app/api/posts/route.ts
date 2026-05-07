import { NextResponse } from 'next/server'
import {
  createOrUpdatePost,
  fetchPosts,
  type CreateOrUpdatePostInput,
} from '@/lib/api'

export const GET = async () => {
  const posts = await fetchPosts()
  return NextResponse.json(posts)
}

export const POST = async (request: Request) => {
  let body: CreateOrUpdatePostInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    const post = await createOrUpdatePost(body)
    return NextResponse.json(post)
  } catch {
    return NextResponse.json(
      { error: 'Save failed', message: '가짜 API가 저장에 실패했습니다.' },
      { status: 500 },
    )
  }
}
