import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import FinanceKpiCards from './FinanceKpiCards'
import FinancialTrendChart from './FinancialTrendChart'
import RevenueVsOpexChart from './RevenueVsOpexChart'
import MartFinancialComparisonChart from './MartFinancialComparisonChart'
import BillsAndSalesGrowthChart from './BillsAndSalesGrowthChart'
import FinancialMonitoringTable from './FinancialMonitoringTable'
import TopFinancialMartsPanel from './TopFinancialMartsPanel'
import MartFinancialDetailModal from './MartFinancialDetailModal'
import { getFinanceDashboardData } from '../../../lib/queries/finance'

export default function BusinessFinanceDashboard({ filters, refreshKey }) {
  const [selectedMart, setSelectedMart] = useState(null)
  const [tableSearch, setTableSearch] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadFinanceData() {
      setLoading(true)
      setError('')
      try {
        const result = await getFinanceDashboardData({ dateRange: filters.dateRange })
        if (isMounted) setData(result)
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load financial data.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadFinanceData()
    return () => {
      isMounted = false
    }
  }, [filters.dateRange, refreshKey])

  const filteredMarts = useMemo(() => {
    const allFinancialMarts = data?.financialMarts ?? []
    return allFinancialMarts.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) || m.district.toLowerCase().includes(filters.searchQuery.toLowerCase())
      const matchDistrict = filters.district === 'All Districts' || m.district === filters.district
      const matchMart = filters.ruralMart === 'All Rural Marts' || m.name === filters.ruralMart
      return matchSearch && matchDistrict && matchMart
    })
  }, [data, filters.searchQuery, filters.district, filters.ruralMart])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-text-muted gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading financial data…</span>
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
    <div className="space-y-4 max-w-[1600px] w-full mx-auto">
      <section aria-label="Financial Key Performance Indicators">
        <FinanceKpiCards financialMarts={filteredMarts} trendData={data.trendData} billsGrowthData={data.billsGrowthData} />
      </section>

      <section aria-label="Financial Analytics Charts" className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <FinancialTrendChart trendData={data.trendData} />
        <RevenueVsOpexChart revenueOpexData={data.revenueOpexData} />
        <MartFinancialComparisonChart financialMarts={filteredMarts} />
        <BillsAndSalesGrowthChart billsGrowthData={data.billsGrowthData} />
      </section>

      <section aria-label="Financial Monitoring" className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-8">
          <FinancialMonitoringTable financialMarts={filteredMarts} onSelectMart={setSelectedMart} searchQuery={tableSearch} setSearchQuery={setTableSearch} />
        </div>
        <div className="lg:col-span-4">
          <TopFinancialMartsPanel financialMarts={filteredMarts} onSelectMart={setSelectedMart} />
        </div>
      </section>

      <MartFinancialDetailModal mart={selectedMart} onClose={() => setSelectedMart(null)} />
    </div>
  )
}
