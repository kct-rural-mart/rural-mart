import {
  Users,
  Receipt,
  Megaphone,
  AlertCircle,
  Award,
  TrendingUp,
  MapPin,
  Heart,
  Tent,
  UserCheck,
} from 'lucide-react'
import {
  getReportsRuralMarts,
  getFinancialRecords,
  getFarmerOutreachMarts,
  getOutreachPrograms,
  getAlerts,
} from '../../lib/newPages/shared/dataServices'

export default function FirstContentRow({ dateRange = 'Last 30 Days', marts }) {
  const activeMarts = marts && marts.length > 0 ? marts : getReportsRuralMarts()
  const financials = getFinancialRecords()
  const outreachMarts = getFarmerOutreachMarts()
  const outreachPrograms = getOutreachPrograms()
  const alerts = getAlerts()

  const footfall = activeMarts.reduce((sum, m) => sum + (m.farmerFootfall || 0), 0)
  const billsCount = financials.reduce((sum, f) => sum + (f.totalBills || 0), 0)
  const programsCount = outreachPrograms.length
  const activeAlertsCount = alerts.filter((a) => a.status !== 'Resolved').length

  const sortedMarts = [...activeMarts].filter((m) => m.score > 0).sort((a, b) => b.score - a.score)
  const bestMart = sortedMarts[0]

  const sortedOutreach = [...activeMarts].filter((m) => m.farmersReached > 0).sort((a, b) => b.farmersReached - a.farmersReached)
  const highestOutreachMart = sortedOutreach[0]

  const sortedGrowth = [...financials]
    .filter((f) => (f.salesGrowthPercent || 0) > 0)
    .sort((a, b) => (b.salesGrowthPercent || 0) - (a.salesGrowthPercent || 0))
  const fastestMartRecord = sortedGrowth[0]

  const villages = outreachMarts.reduce((sum, m) => sum + (m.villagesCovered || 0), 0)
  const cattle = outreachMarts.reduce((sum, m) => sum + (m.animalPopulationCovered || 0), 0)
  const camps = outreachMarts.reduce((sum, m) => sum + (m.medicalCamps || 0), 0)
  const converted = outreachMarts.reduce((sum, m) => sum + (m.newFarmers || 0), 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* 1. Network Activity Card */}
      <div className="bg-brand-surface border border-brand-border rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-brand-primary/40 transition-all duration-200 cursor-pointer flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-success inline-block" />
            Network Activity
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center py-1">
          <div className="bg-brand-bg-subtle p-2 rounded-lg border border-brand-border/70">
            <div className="flex items-center justify-center gap-1 text-[10px] text-brand-text-muted font-medium">
              <Users className="w-3 h-3 text-brand-primary" />
              <span>Footfall</span>
            </div>
            <p className="text-base font-bold text-brand-text mt-1">{footfall.toLocaleString('en-IN')}</p>
            <div className="w-full bg-brand-border h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-brand-primary h-full rounded-full" style={{ width: footfall > 0 ? '75%' : '0%' }} />
            </div>
          </div>

          <div className="bg-brand-bg-subtle p-2 rounded-lg border border-brand-border/70">
            <div className="flex items-center justify-center gap-1 text-[10px] text-brand-text-muted font-medium">
              <Receipt className="w-3 h-3 text-brand-primary" />
              <span>Bills</span>
            </div>
            <p className="text-base font-bold text-brand-text mt-1">{billsCount.toLocaleString('en-IN')}</p>
            <div className="w-full bg-brand-border h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-brand-accent h-full rounded-full" style={{ width: billsCount > 0 ? '80%' : '0%' }} />
            </div>
          </div>

          <div className="bg-brand-bg-subtle p-2 rounded-lg border border-brand-border/70">
            <div className="flex items-center justify-center gap-1 text-[10px] text-brand-text-muted font-medium">
              <Megaphone className="w-3 h-3 text-brand-accent-muted" />
              <span>Programs</span>
            </div>
            <p className="text-base font-bold text-brand-text mt-1">{programsCount}</p>
            <div className="w-full bg-brand-border h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-brand-accent-muted h-full rounded-full" style={{ width: programsCount > 0 ? '66%' : '0%' }} />
            </div>
          </div>

          <div className="bg-brand-danger-light/60 p-2 rounded-lg border border-brand-danger-border">
            <div className="flex items-center justify-center gap-1 text-[10px] text-brand-danger font-medium">
              <AlertCircle className="w-3 h-3 text-brand-danger" />
              <span>Alerts</span>
            </div>
            <p className="text-base font-bold text-brand-danger mt-1">{activeAlertsCount}</p>
            <div className="w-full bg-brand-danger-border h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-brand-danger h-full rounded-full" style={{ width: activeAlertsCount > 0 ? '50%' : '0%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Performance Highlights Card */}
      <div className="bg-brand-surface border border-brand-border rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-brand-primary/40 transition-all duration-200 cursor-pointer flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-brand-warning" />
            Performance Highlights
          </h3>
          <span className="text-[10px] text-brand-text-muted font-medium">{dateRange}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-0.5">
          <div className="bg-brand-primary-light p-2 rounded-lg border border-brand-primary/15 flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-brand-primary-dark">Best Performing</span>
            <p className="text-sm font-bold text-brand-text mt-1 truncate">
              {bestMart ? bestMart.name.replace(' Rural Mart', '').replace(' Agro Mart', '') : 'N/A'}
            </p>
            <span className="text-[10px] text-brand-accent font-bold mt-1">
              {bestMart ? `Score: ${bestMart.score}` : 'No data'}
            </span>
          </div>

          <div className="bg-brand-bg-subtle p-2 rounded-lg border border-brand-border flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-brand-accent-muted">Highest Outreach</span>
            <p className="text-sm font-bold text-brand-text mt-1 truncate">
              {highestOutreachMart ? highestOutreachMart.name.replace(' Rural Mart', '').replace(' Agro Mart', '') : 'N/A'}
            </p>
            <span className="text-[10px] text-brand-accent font-bold mt-1">
              {highestOutreachMart ? `${highestOutreachMart.farmersReached} Farmers` : 'No data'}
            </span>
          </div>

          <div className="bg-brand-warning-light/60 p-2 rounded-lg border border-brand-warning-border flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-brand-warning-dark">Fastest Growing</span>
            <p className="text-sm font-bold text-brand-text mt-1 truncate">
              {fastestMartRecord ? fastestMartRecord.name.replace(' Rural Mart', '').replace(' Agro Mart', '') : 'N/A'}
            </p>
            <span className="text-[10px] text-brand-warning font-bold mt-1 flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5 inline" />
              {fastestMartRecord ? `+${fastestMartRecord.salesGrowthPercent}% MoM` : 'No data'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Network Impact Snapshot Card */}
      <div className="bg-brand-surface border border-brand-border rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-brand-primary/40 transition-all duration-200 cursor-pointer flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-brand-danger" />
            Network Impact Snapshot
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center py-1">
          <div className="bg-brand-bg-subtle p-2 rounded-lg border border-brand-border/70">
            <div className="flex items-center justify-center gap-1 text-[10px] text-brand-text-muted font-medium">
              <MapPin className="w-3 h-3 text-brand-primary" />
              <span>Villages</span>
            </div>
            <p className="text-base font-bold text-brand-text mt-1">{villages.toString()}</p>
          </div>

          <div className="bg-brand-bg-subtle p-2 rounded-lg border border-brand-border/70">
            <div className="flex items-center justify-center gap-1 text-[10px] text-brand-text-muted font-medium">
              <Heart className="w-3 h-3 text-brand-danger" />
              <span>Cattle</span>
            </div>
            <p className="text-base font-bold text-brand-text mt-1">{cattle.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-brand-bg-subtle p-2 rounded-lg border border-brand-border/70">
            <div className="flex items-center justify-center gap-1 text-[10px] text-brand-text-muted font-medium">
              <Tent className="w-3 h-3 text-brand-warning" />
              <span>Camps</span>
            </div>
            <p className="text-base font-bold text-brand-text mt-1">{camps.toString()}</p>
          </div>

          <div className="bg-brand-bg-subtle p-2 rounded-lg border border-brand-border/70">
            <div className="flex items-center justify-center gap-1 text-[10px] text-brand-text-muted font-medium">
              <UserCheck className="w-3 h-3 text-brand-info" />
              <span>Converted</span>
            </div>
            <p className="text-base font-bold text-brand-text mt-1">{converted.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
