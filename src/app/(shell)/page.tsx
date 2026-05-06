import { fetchCompanies, fetchCountries } from '@/lib/api'
import { EmissionsDashboard } from '@/components/dashboard/EmissionsDashboard'

const DashboardHomePage = async () => {
  const [companies, countries] = await Promise.all([
    fetchCompanies(),
    fetchCountries(),
  ])

  return (
    <div className="mx-auto max-w-6xl">
      <EmissionsDashboard companies={companies} countries={countries} />
    </div>
  )
}

export default DashboardHomePage
