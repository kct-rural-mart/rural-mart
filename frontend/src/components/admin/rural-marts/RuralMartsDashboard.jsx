import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import RuralMartsKpiCards from './RuralMartsKpiCards'
import RuralMartPerformanceChart from './RuralMartPerformanceChart'
import DistrictWisePerformanceChart from './DistrictWisePerformanceChart'
import MonthlyRuralMartGrowthChart from './MonthlyRuralMartGrowthChart'
import RuralMartDirectoryTable from './RuralMartDirectoryTable'
import DataUpdateStatusTable from './DataUpdateStatusTable'
import RuralMartDetailModal from './RuralMartDetailModal'
import { getRuralMartsDashboardData } from '../../../lib/queries/ruralMarts'

export default function RuralMartsDashboard({ filters, refreshKey }) {
  const [selectedMart, setSelectedMart] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadRuralMartsData() {
      setLoading(true)
      setError('')
      try {
        const result = await getRuralMartsDashboardData({ dateRange: filters.dateRange })
        if (isMounted) setData(result)
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load Rural Marts data.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadRuralMartsData()
    return () => {
      isMounted = false
    }
  }, [filters.dateRange, refreshKey])

  const filteredMarts = useMemo(() => {
    const allMarts = data?.marts ?? []
    return allMarts.filter((m) => {
      const matchesDistrict = !filters.district || filters.district === 'All Districts' || m.district.toLowerCase() === filters.district.toLowerCase()
      const matchesMart = !filters.ruralMart || filters.ruralMart === 'All Rural Marts' || m.name.toLowerCase() === filters.ruralMart.toLowerCase()
      return matchesDistrict && matchesMart
    })
  }, [data, filters.district, filters.ruralMart])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-text-muted gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading Rural Marts data…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-brand-danger-light border border-brand-danger-border text-brand-danger text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

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
        <DistrictWisePerformanceChart marts={filteredMarts} />
      </section>

      <section>
        <MonthlyRuralMartGrowthChart trendData={data.trendData} billsGrowthData={data.billsGrowthData} />
      </section>

      <section>
        <DataUpdateStatusTable marts={filteredMarts} />
      </section>

      {selectedMart && <RuralMartDetailModal mart={selectedMart} onClose={() => setSelectedMart(null)} />}
    </div>
  )
}
