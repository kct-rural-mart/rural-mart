import { useMemo, useState } from 'react'
import FinanceKpiCards from './FinanceKpiCards'
import FinancialTrendChart from './FinancialTrendChart'
import RevenueVsOpexChart from './RevenueVsOpexChart'
import MartFinancialComparisonChart from './MartFinancialComparisonChart'
import BillsAndSalesGrowthChart from './BillsAndSalesGrowthChart'
import FinancialMonitoringTable from './FinancialMonitoringTable'
import TopFinancialMartsPanel from './TopFinancialMartsPanel'
import MartFinancialDetailModal from './MartFinancialDetailModal'
import { getFinancialMarts } from '../../../lib/newPages/shared/dataServices'

export default function BusinessFinanceDashboard({ filters }) {
  const [selectedMart, setSelectedMart] = useState(null)
  const [tableSearch, setTableSearch] = useState('')

  const allFinancialMarts = useMemo(() => getFinancialMarts(), [])

  const filteredMarts = useMemo(() => {
    return allFinancialMarts.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) || m.district.toLowerCase().includes(filters.searchQuery.toLowerCase())
      const matchDistrict = filters.district === 'All Districts' || m.district === filters.district
      const matchMart = filters.ruralMart === 'All Rural Marts' || m.name === filters.ruralMart
      return matchSearch && matchDistrict && matchMart
    })
  }, [allFinancialMarts, filters.searchQuery, filters.district, filters.ruralMart])

  return (
    <div className="space-y-4 max-w-[1600px] w-full mx-auto">
      <section aria-label="Financial Key Performance Indicators">
        <FinanceKpiCards financialMarts={filteredMarts} />
      </section>

      <section aria-label="Financial Analytics Charts" className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <FinancialTrendChart />
        <RevenueVsOpexChart />
        <MartFinancialComparisonChart financialMarts={filteredMarts} />
        <BillsAndSalesGrowthChart />
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
