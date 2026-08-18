import { useMemo } from 'react'
import { Clock, CheckCircle2, WifiOff, Database } from 'lucide-react'
import { formatDaysAgo } from '../../../utils/date'

// Real recency, not the fabricated "completeness%/sync-lag/pending-records"
// this table used to show - none of those exist in the schema. Status is
// classified purely from days since the mart's most recent sale:
//   <= 1 day  -> Up to Date
//   <= 7 days -> Delayed
//   > 7 days  -> Inactive
//   no sales ever -> No Data Yet
function classifyStatus(daysSinceLastSale) {
  if (daysSinceLastSale === null || daysSinceLastSale === undefined) return 'No Data Yet'
  if (daysSinceLastSale <= 1) return 'Up to Date'
  if (daysSinceLastSale <= 7) return 'Delayed'
  return 'Inactive'
}

export default function DataUpdateStatusTable({ marts }) {
  const records = useMemo(() => {
    return [...marts].sort((a, b) => (a.daysSinceLastSale ?? Infinity) - (b.daysSinceLastSale ?? Infinity))
  }, [marts])

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
          <h3 className="text-sm font-bold text-brand-text tracking-tight">Data Update Status</h3>
        </div>

        <div className="overflow-x-auto rounded-xl border border-brand-border/70 my-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-bg-subtle border-b border-brand-border text-brand-text-muted font-semibold">
                <th className="py-2.5 px-3">Rural Mart</th>
                <th className="py-2.5 px-3">Sync Status</th>
                <th className="py-2.5 px-3 text-right">Last Sale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-brand-text-muted">
                    No Rural Marts found.
                  </td>
                </tr>
              ) : (
                records.map((mart) => {
                  const status = classifyStatus(mart.daysSinceLastSale)
                  const isUpToDate = status === 'Up to Date'
                  const isDelayed = status === 'Delayed'
                  const isInactive = status === 'Inactive'

                  return (
                    <tr key={mart.id} className="hover:bg-brand-bg-subtle transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-brand-text">
                        <span className="block">{mart.name}</span>
                        <span className="text-[10px] text-brand-text-subtle font-normal">{mart.district}</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isUpToDate
                              ? 'bg-brand-success-light text-brand-success'
                              : isDelayed
                                ? 'bg-brand-warning-light text-brand-warning-dark'
                                : isInactive
                                  ? 'bg-brand-danger-light text-brand-danger'
                                  : 'bg-brand-bg-subtle text-brand-text-muted border border-brand-border'
                          }`}
                        >
                          {isUpToDate ? <CheckCircle2 className="w-3 h-3" /> : isDelayed ? <Clock className="w-3 h-3" /> : isInactive ? <WifiOff className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                          {status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-brand-text-muted text-[11px]">{formatDaysAgo(mart.daysSinceLastSale)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-brand-text-muted">
        <span className="flex items-center gap-1">
          <Database className="w-3.5 h-3.5 text-brand-primary" />
          Network Data Freshness
        </span>
      </div>
    </div>
  )
}
