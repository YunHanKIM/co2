import { fetchActivityRecords, fetchEmissionFactors } from '@/lib/api'
import { PcfDashboard } from '@/components/pcf/PcfDashboard'

const PcfPage = async () => {
  const [activities, factors] = await Promise.all([
    fetchActivityRecords(),
    fetchEmissionFactors(),
  ])

  return (
    <div className="mx-auto max-w-6xl">
      <PcfDashboard activities={activities} factors={factors} />
    </div>
  )
}

export default PcfPage
