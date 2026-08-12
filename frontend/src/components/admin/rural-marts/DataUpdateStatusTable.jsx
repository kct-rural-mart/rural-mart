import { RefreshCw, Clock, CheckCircle2, WifiOff, Database } from 'lucide-react'
import { DATA_UPDATE_STATUS_RECORDS } from '../../../lib/newPages/mockData'

export default function DataUpdateStatusTable() {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
          <h3 className="text-sm font-bold text-brand-text tracking-tight">Data Update Status</h3>

          <button
            onClick={() => alert('Triggering network data sync pulse... All active outposts updated.')}
            className="p-1.5 rounded-lg text-brand-primary hover:text-brand-primary-dark hover:bg-brand-primary-light transition-colors"
            title="Refresh Sync Pulse"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-brand-border/70 my-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-bg-subtle border-b border-brand-border text-brand-text-muted font-semibold">
                <th className="py-2.5 px-3">Rural Mart</th>
                <th className="py-2.5 px-3">Sync Status</th>
                <th className="py-2.5 px-3">Data Completeness</th>
                <th className="py-2.5 px-3 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {DATA_UPDATE_STATUS_RECORDS.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-brand-text-muted">
                    No sync status records available.
                  </td>
                </tr>
              ) : (
                DATA_UPDATE_STATUS_RECORDS.map((record) => {
                  const isUpToDate = record.status === 'Up-to-Date'
                  const isPending = record.status === 'Sync Pending'
                  const isDelayed = record.status === 'Delayed'

                  return (
                    <tr key={record.id} className="hover:bg-brand-bg-subtle transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-brand-text">
                        <span className="block">{record.ruralMart}</span>
                        <span className="text-[10px] text-brand-text-subtle font-normal">{record.district}</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isUpToDate
                              ? 'bg-brand-success-light text-brand-success'
                              : isPending
                              ? 'bg-brand-info-light text-brand-info-dark'
                              : isDelayed
                              ? 'bg-brand-warning-light text-brand-warning-dark'
                              : 'bg-brand-danger-light text-brand-danger'
                          }`}
                        >
                          {isUpToDate ? <CheckCircle2 className="w-3 h-3" /> : isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : isDelayed ? <Clock className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                          {record.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-brand-text-muted">{record.completenessPercent}%</span>
                            {record.pendingRecordsCount > 0 && <span className="text-brand-warning-dark font-bold">+{record.pendingRecordsCount} pending</span>}
                          </div>
                          <div className="w-full h-1.5 bg-brand-bg-subtle rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                record.completenessPercent > 90 ? 'bg-brand-success' : record.completenessPercent > 60 ? 'bg-brand-warning' : 'bg-brand-danger'
                              }`}
                              style={{ width: `${record.completenessPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-brand-text-muted text-[11px]">{record.lastUpdated}</td>
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
