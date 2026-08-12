import { useMemo, useState } from 'react'
import FarmersKpiCards from './FarmersKpiCards'
import FarmerOutreachSummaryTable from './FarmerOutreachSummaryTable'
import FarmerDatabasePreviewTable from './FarmerDatabasePreviewTable'
import FarmerGrowthAndRetentionChart from './FarmerGrowthAndRetentionChart'
import NewVsRepeatDonutChart from './NewVsRepeatDonutChart'
import OutreachPerformanceBarChart from './OutreachPerformanceBarChart'
import FarmerDetailModal from './FarmerDetailModal'
import FarmerPurchaseHistoryModal from './FarmerPurchaseHistoryModal'
import MartOutreachDetailModal from './MartOutreachDetailModal'
import { getFarmers, getRuralMarts, getFarmerOutreachMarts } from '../../../lib/newPages/shared/dataServices'

export default function FarmersOutreachDashboard({ selectedDistrict, selectedMart }) {
  const [selectedMartModal, setSelectedMartModal] = useState(null)
  const [selectedFarmerModal, setSelectedFarmerModal] = useState(null)
  const [selectedPurchaseHistoryFarmer, setSelectedPurchaseHistoryFarmer] = useState(null)
  const [martTableSearch, setMartTableSearch] = useState('')

  const allFarmers = useMemo(() => {
    const canonicalFarmers = getFarmers()
    const canonicalMarts = getRuralMarts()

    return canonicalFarmers.map((cf) => {
      const mart = canonicalMarts.find((m) => m.ruralMartId === cf.ruralMartId)
      let martDisplayName = cf.ruralMartId || 'Rural Mart'
      if (mart) {
        martDisplayName = mart.ruralMartName.replace(' Rural Mart', '').replace(' Agro Mart', '').replace(' Farmers Hub', '')
      }
      return {
        id: cf.id,
        name: cf.name,
        village: cf.village,
        district: cf.district || (mart ? mart.district : 'Erode'),
        ruralMart: martDisplayName,
        category: cf.category,
        animalHeadCount: cf.animalHeadCount,
        lastVisit: cf.lastVisit,
        status: cf.status,
        phone: cf.phone,
        totalPurchasesVal: cf.totalPurchasesVal,
        joinedDate: cf.joinedDate,
        itemsPurchased: cf.itemsPurchased || 'None',
        purchaseDate: cf.lastVisit,
      }
    })
  }, [])

  const allOutreachMarts = useMemo(() => getFarmerOutreachMarts(), [])

  const filteredOutreachMarts = useMemo(() => {
    return allOutreachMarts.filter((m) => {
      const matchDistrict = selectedDistrict === 'All Districts' || m.district.toLowerCase() === selectedDistrict.toLowerCase()
      const matchMart = selectedMart === 'All Rural Marts' || m.name.toLowerCase() === selectedMart.toLowerCase()
      return matchDistrict && matchMart
    })
  }, [allOutreachMarts, selectedDistrict, selectedMart])

  const filteredFarmerRecords = useMemo(() => {
    return allFarmers.filter((f) => {
      const matchDistrict = selectedDistrict === 'All Districts' || f.district.toLowerCase() === selectedDistrict.toLowerCase()
      const matchMart = selectedMart === 'All Rural Marts' || f.ruralMart.toLowerCase() === selectedMart.toLowerCase()
      return matchDistrict && matchMart
    })
  }, [allFarmers, selectedDistrict, selectedMart])

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
          <FarmerGrowthAndRetentionChart />
        </div>
        <NewVsRepeatDonutChart />
      </section>

      <section>
        <OutreachPerformanceBarChart />
      </section>

      <FarmerDetailModal farmer={selectedFarmerModal} onClose={() => setSelectedFarmerModal(null)} />
      <FarmerPurchaseHistoryModal farmer={selectedPurchaseHistoryFarmer} onClose={() => setSelectedPurchaseHistoryFarmer(null)} />
      <MartOutreachDetailModal mart={selectedMartModal} onClose={() => setSelectedMartModal(null)} />
    </div>
  )
}
