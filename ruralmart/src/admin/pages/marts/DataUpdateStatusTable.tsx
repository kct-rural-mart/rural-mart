import React from 'react';
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Database,
} from 'lucide-react';
import { DATA_UPDATE_STATUS_RECORDS } from '../../../mockData';

export const DataUpdateStatusTable: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/30">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-emerald-50 tracking-tight">
              Data Update Status
            </h3>
          </div>

          <button
            onClick={() => alert('Triggering network data sync pulse... All active outposts updated.')}
            className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            title="Refresh Sync Pulse"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-emerald-800/30 my-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-emerald-900/40 border-b border-slate-200 dark:border-emerald-800/30 text-slate-600 dark:text-emerald-300 font-semibold">
                <th className="py-2.5 px-3">Rural Mart</th>
                <th className="py-2.5 px-3">Sync Status</th>
                <th className="py-2.5 px-3">Data Completeness</th>
                <th className="py-2.5 px-3 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30">
              {DATA_UPDATE_STATUS_RECORDS.map((record) => {
                const isUpToDate = record.status === 'Up-to-Date';
                const isPending = record.status === 'Sync Pending';
                const isDelayed = record.status === 'Delayed';

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-emerald-100">
                      <div>
                        <span className="block">{record.ruralMart}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{record.district}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isUpToDate
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : isPending
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300'
                            : isDelayed
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                        }`}
                      >
                        {isUpToDate ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : isPending ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : isDelayed ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <WifiOff className="w-3 h-3" />
                        )}
                        {record.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-slate-600 dark:text-emerald-300">{record.completenessPercent}%</span>
                          {record.pendingRecordsCount > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 font-bold">
                              +{record.pendingRecordsCount} pending
                            </span>
                          )}
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-emerald-900/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              record.completenessPercent > 90
                                ? 'bg-emerald-500'
                                : record.completenessPercent > 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${record.completenessPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-500 dark:text-emerald-400/80 text-[11px]">
                      {record.lastUpdated}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/30 flex items-center justify-between text-[11px] text-slate-500 dark:text-emerald-400/80">
        <span className="flex items-center gap-1">
          <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Network Data Freshness: 92.4%
        </span>
        <span className="font-semibold text-emerald-700 dark:text-emerald-300">
          7/10 Marts Synced Live
        </span>
      </div>
    </div>
  );
};
