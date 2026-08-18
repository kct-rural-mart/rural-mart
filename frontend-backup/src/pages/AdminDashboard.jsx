import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import KpiCards from '../components/admin/KpiCards'
import FirstContentRow from '../components/admin/FirstContentRow'
import NetworkPerformanceTrend from '../components/admin/NetworkPerformanceTrend'
import RuralMartPerformance from '../components/admin/RuralMartPerformance'
import MonitoringOverviewTable from '../components/admin/MonitoringOverviewTable'
import AttentionRequiredPanel from '../components/admin/AttentionRequiredPanel'
import MartDetailModal from '../components/admin/MartDetailModal'

export default function AdminDashboard() {
  const { marts, alerts, onReviewAlert, filters } = useOutletContext()
  const [selectedMart, setSelectedMart] = useState(null)

  return (
    <>
      <section aria-label="Key Performance Indicators">
        <KpiCards marts={marts} />
      </section>

      <section aria-label="Network Activity Highlights and Impact">
        <FirstContentRow dateRange={filters.dateRange} marts={marts} />
      </section>

      <section aria-label="Network Trends and Mart Performance" className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <NetworkPerformanceTrend />
        <RuralMartPerformance marts={marts} />
      </section>

      <section aria-label="Monitoring Overview and Attention Required" className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-8">
          <MonitoringOverviewTable marts={marts} onSelectMart={setSelectedMart} />
        </div>

        <div className="lg:col-span-4">
          <AttentionRequiredPanel alerts={alerts} onReviewAlert={onReviewAlert} />
        </div>
      </section>

      <MartDetailModal mart={selectedMart} onClose={() => setSelectedMart(null)} />
    </>
  )
}
