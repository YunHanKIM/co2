import { fetchCompanies } from '@/lib/api'

const HomePage = async () => {
  const companies = await fetchCompanies()

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-8"
      aria-labelledby="home-heading"
    >
      <h1 id="home-heading" className="text-2xl font-semibold tracking-tight">
        Emissions Dashboard
      </h1>
      <p className="max-w-md text-center text-sm text-slate-600">
        가짜 백엔드(<code className="rounded bg-slate-200 px-1">fetchCompanies</code>)로
        불러온 회사 {companies.length}곳:{' '}
        {companies.map((c) => c.name).join(', ')}
      </p>
    </main>
  )
}

export default HomePage
