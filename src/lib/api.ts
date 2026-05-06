import type {
  ActivityRecord,
  Company,
  Country,
  EmissionFactorRecord,
  Post,
} from '@/types'

import {
  activityRecords as seedActivityRecords,
  companies as seedCompanies,
  countries as seedCountries,
  emissionFactors as seedEmissionFactors,
  posts as seedPosts,
} from '@/data/seed'

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))

//네트워크 지연 시뮬레이션: 200~800ms
const jitter = () => 200 + Math.random() * 600

//쓰기 실패 확률 ~15%
const maybeFailWrite = () => Math.random() < 0.15

const cloneCountry = (c: Country): Country => ({ ...c })

const cloneCompany = (c: Company): Company => ({
  ...c,
  emissions: c.emissions.map((e) => ({ ...e })),
})

const clonePost = (p: Post): Post => ({ ...p })

const cloneActivity = (a: ActivityRecord): ActivityRecord => ({ ...a })

const cloneFactor = (f: EmissionFactorRecord): EmissionFactorRecord => ({
  ...f,
})

let _countries = seedCountries.map(cloneCountry)
let _companies = seedCompanies.map(cloneCompany)
let _posts = seedPosts.map(clonePost)
let _activityRecords = seedActivityRecords.map(cloneActivity)
let _emissionFactors = seedEmissionFactors.map(cloneFactor)

//테스트/개발용: 시드 상태로 되돌림
export const resetFakeBackend = () => {
  _countries = seedCountries.map(cloneCountry)
  _companies = seedCompanies.map(cloneCompany)
  _posts = seedPosts.map(clonePost)
  _activityRecords = seedActivityRecords.map(cloneActivity)
  _emissionFactors = seedEmissionFactors.map(cloneFactor)
}

export const fetchCountries = async (): Promise<Country[]> => {
  await delay(jitter())
  return [..._countries]
}

export const fetchCompanies = async (): Promise<Company[]> => {
  await delay(jitter())
  return _companies.map(cloneCompany)
}

export const fetchPosts = async (): Promise<Post[]> => {
  await delay(jitter())
  return _posts.map(clonePost)
}

//PCF 원본 활동 데이터
export const fetchActivityRecords = async (): Promise<ActivityRecord[]> => {
  await delay(jitter())
  return _activityRecords.map(cloneActivity)
}

//배출계수 (버전 이력용 시드)
export const fetchEmissionFactors = async (): Promise<EmissionFactorRecord[]> => {
  await delay(jitter())
  return _emissionFactors.map(cloneFactor)
}

export type CreateOrUpdatePostInput = Omit<Post, 'id'> & { id?: string }

export const createOrUpdatePost = async (
  p: CreateOrUpdatePostInput,
): Promise<Post> => {
  await delay(jitter())
  if (maybeFailWrite()) {
    throw new Error('Save failed')
  }

  if (p.id) {
    const next: Post = {
      id: p.id,
      title: p.title,
      resourceUid: p.resourceUid,
      dateTime: p.dateTime,
      content: p.content,
    }
    _posts = _posts.map((x) => (x.id === p.id ? next : x))
    return next
  }

  const created: Post = {
    ...p,
    id: crypto.randomUUID(),
  }
  _posts = [..._posts, created]
  return created
}
