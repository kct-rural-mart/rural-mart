import { useState } from 'react'
import { Users, UserPlus, RotateCw, Target, CalendarCheck, HeartHandshake, Info } from 'lucide-react'

export default function FarmersKpiCards({ outreachMarts }) {
  const [activeTooltip, setActiveTooltip] = useState(null)

  const totalRegistered = outreachMarts.reduce((acc, m) => acc + (m.totalRegisteredFarmers || 0), 0)
  const totalNew = outreachMarts.reduce((acc, m) => acc + (m.newFarmers || 0), 0)
  const totalRepeat = outreachMarts.reduce((acc, m) => acc + (m.repeatFarmers || 0), 0)
  const totalReached = outreachMarts.reduce((acc, m) => acc + (m.farmersReached || 0), 0)
  const totalPrograms = outreachMarts.reduce((acc, m) => acc + (m.outreachProgramsConducted || 0), 0)
  const totalAnimalPop = outreachMarts.reduce((acc, m) => acc + (m.animalPopulationCovered || 0), 0)

  const kpis = [
    { id: 'reg-farmers', label: 'Total Registered Farmers', value: totalRegistered.toLocaleString('en-IN'), icon: Users, tooltip: 'Total cumulative farmers registered across all active Rural Marts.' },
    { id: 'new-farmers', label: 'New Farmers', value: totalNew.toLocaleString('en-IN'), icon: UserPlus, tooltip: 'First-time registered farmers onboarded during current reporting cycle.' },
    { id: 'repeat-farmers', label: 'Repeat Farmers', value: totalRepeat.toLocaleString('en-IN'), icon: RotateCw, tooltip: 'Farmers with 2 or more transactions or visits to Rural Marts.' },
    { id: 'farmers-reached', label: 'Farmers Reached', value: totalReached.toLocaleString('en-IN'), icon: Target, tooltip: 'Farmers directly participating in health camps, training workshops, and melas.' },
    { id: 'outreach-programs', label: 'Outreach Programs', value: totalPrograms.toString(), icon: CalendarCheck, tooltip: 'Veterinary camps, soil testing drives, and organic farming workshops held.' },
    { id: 'animal-pop', label: 'Animal Population Covered', value: totalAnimalPop.toLocaleString('en-IN'), icon: HeartHandshake, tooltip: 'Total cattle, dairy, and livestock head count provided with health and nutrition inputs.' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        const isTooltipOpen = activeTooltip === kpi.id

        return (
          <div
            key={kpi.id}
            className="bg-brand-surface border border-brand-border rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-brand-primary/40 transition-all duration-200 cursor-pointer relative flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider truncate">{kpi.label}</span>
              <div className="relative flex items-center">
                <button
                  onMouseEnter={() => setActiveTooltip(kpi.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(isTooltipOpen ? null : kpi.id)}
                  className="text-brand-text-subtle hover:text-brand-primary transition-colors p-0.5"
                  title="More information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {isTooltipOpen && (
                  <div className="absolute right-0 top-6 w-48 bg-brand-text text-white text-[10px] p-2 rounded-lg shadow-lg z-50 pointer-events-none leading-relaxed border border-brand-accent">
                    {kpi.tooltip}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 my-1">
              <span className="text-xl md:text-2xl font-bold text-brand-text tracking-tight">{kpi.value}</span>
              <div className="w-7 h-7 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
