import { useMemo, useState } from 'react'
import RuralMartsKpiCards from './RuralMartsKpiCards'
import RuralMartPerformanceChart from './RuralMartPerformanceChart'
import DistrictWisePerformanceChart from './DistrictWisePerformanceChart'
import MonthlyRuralMartGrowthChart from './MonthlyRuralMartGrowthChart'
import PerformanceScoreRadarChart from './PerformanceScoreRadarChart'
import RuralMartDirectoryTable from './RuralMartDirectoryTable'
import DataUpdateStatusTable from './DataUpdateStatusTable'
import RuralMartDetailModal from './RuralMartDetailModal'
import { getReportsRuralMarts } from '../../../lib/newPages/shared/dataServices'

export default function RuralMartsDashboard({ filters }) {
  const [selectedMart, setSelectedMart] = useState(null)

  const allMarts = useMemo(() => getReportsRuralMarts(), [])

  const filteredMarts = useMemo(() => {
    return allMarts.filter((m) => {
      const matchesDistrict = !filters.district || filters.district === 'All Districts' || m.district.toLowerCase() === filters.district.toLowerCase()
      const matchesMart = !filters.ruralMart || filters.ruralMart === 'All Rural Marts' || m.name.toLowerCase() === filters.ruralMart.toLowerCase()
      return matchesDistrict && matchesMart
    })
  }, [allMarts, filters])

  return (
    <div className="space-y-6 pb-12">
      <section>
        <RuralMartsKpiCards marts={filteredMarts} />
      </section>

      <section>
        <RuralMartDirectoryTable marts={filteredMarts} onSelectMart={(mart) => setSelectedMart(mart)} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RuralMartPerformanceChart marts={filteredMarts} />
        <DistrictWisePerformanceChart />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MonthlyRuralMartGrowthChart />
        <PerformanceScoreRadarChart />
      </section>

      <section>
        <DataUpdateStatusTable />
      </section>

      {selectedMart && <RuralMartDetailModal mart={selectedMart} onClose={() => setSelectedMart(null)} />}
    </div>
  )
}
