import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import FarmersKpiCards from './FarmersKpiCards'
import FarmerOutreachSummaryTable from './FarmerOutreachSummaryTable'
import FarmerDatabasePreviewTable from './FarmerDatabasePreviewTable'
import FarmerGrowthAndRetentionChart from './FarmerGrowthAndRetentionChart'
import NewVsRepeatDonutChart from './NewVsRepeatDonutChart'
import OutreachPerformanceBarChart from './OutreachPerformanceBarChart'
import FarmerDetailModal from './FarmerDetailModal'
import FarmerPurchaseHistoryModal from './FarmerPurchaseHistoryModal'
import MartOutreachDetailModal from './MartOutreachDetailModal'
import { getFarmersOutreachData } from '../../../lib/queries/farmersOutreach'

export default function FarmersOutreachDashboard({ selectedDistrict, selectedMart, dateRange, refreshKey }) {
  const [selectedMartModal, setSelectedMartModal] = useState(null)
  const [selectedFarmerModal, setSelectedFarmerModal] = useState(null)
  const [selectedPurchaseHistoryFarmer, setSelectedPurchaseHistoryFarmer] = useState(null)
  const [martTableSearch, setMartTableSearch] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadFarmersOutreachData() {
      setLoading(true)
      setError('')
      try {
        const result = await getFarmersOutreachData({ dateRange })
        if (isMounted) setData(result)
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load Farmers & Outreach data.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadFarmersOutreachData()
    return () => {
      isMounted = false
    }
  }, [dateRange, refreshKey])

  const filteredOutreachMarts = useMemo(() => {
    const allOutreachMarts = data?.outreachMarts ?? []
    return allOutreachMarts.filter((m) => {
      const matchDistrict = selectedDistrict === 'All Districts' || m.district.toLowerCase() === selectedDistrict.toLowerCase()
      const matchMart = selectedMart === 'All Rural Marts' || m.name.toLowerCase() === selectedMart.toLowerCase()
      return matchDistrict && matchMart
    })
  }, [data, selectedDistrict, selectedMart])

  const filteredFarmerRecords = useMemo(() => {
    const allFarmers = data?.farmers ?? []
    return allFarmers.filter((f) => {
      const matchDistrict = selectedDistrict === 'All Districts' || f.district.toLowerCase() === selectedDistrict.toLowerCase()
      const matchMart = selectedMart === 'All Rural Marts' || f.ruralMart.toLowerCase() === selectedMart.toLowerCase()
      return matchDistrict && matchMart
    })
  }, [data, selectedDistrict, selectedMart])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-text-muted gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading Farmers &amp; Outreach data…</span>
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
    <div className="space-y-5">
      <section>
        <FarmersKpiCards outreachMarts={filteredOutreachMarts} />
      </section>

      <section className="w-full">
        <FarmerOutreachSummaryTable outreachMarts={filteredOutreachMarts} onSelectMart={setSelectedMartModal} searchQuery={martTableSearch} setSearchQuery={setMartTableSearch} />
      </section>

      <section className="w-full">
        <FarmerDatabasePreviewTable
          farmers={filteredFarmerRecords}
          onSelectFarmer={(farmer) => setSelectedFarmerModal(farmer)}
          onSelectPurchaseHistory={(farmer) => setSelectedPurchaseHistoryFarmer(farmer)}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <FarmerGrowthAndRetentionChart trendData={data.growthTrend} />
        </div>
        <NewVsRepeatDonutChart donutData={data.newVsRepeatDonut} />
      </section>

      <section>
        <OutreachPerformanceBarChart trendData={data.outreachTrend} />
      </section>

      <FarmerDetailModal farmer={selectedFarmerModal} onClose={() => setSelectedFarmerModal(null)} />
      <FarmerPurchaseHistoryModal farmer={selectedPurchaseHistoryFarmer} onClose={() => setSelectedPurchaseHistoryFarmer(null)} />
      <MartOutreachDetailModal mart={selectedMartModal} onClose={() => setSelectedMartModal(null)} />
    </div>
  )
}
