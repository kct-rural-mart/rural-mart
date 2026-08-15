import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { FAST_SLOW_MOVING_PRODUCTS } from '../../../mockData';

export const FastSlowMovingTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Fast' | 'Slow'>('All');

  const filteredItems = FAST_SLOW_MOVING_PRODUCTS.filter(
    (item) => activeTab === 'All' || item.velocity === activeTab
  );

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        {/* Header with Tabs */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-emerald-900/30">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-emerald-50 tracking-tight flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              Fast-moving & Slow-moving
            </h3>
          </div>

          {/* Toggle Pills */}
          <div className="flex bg-slate-100 dark:bg-emerald-900/40 p-1 rounded-xl text-xs font-semibold">
            {(['All', 'Fast', 'Slow'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-white dark:bg-emerald-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-emerald-400 hover:text-slate-900 dark:hover:text-emerald-200'
                }`}
              >
                {tab === 'All' ? 'All' : tab === 'Fast' ? '⚡ Fast' : '🐢 Slow'}
              </button>
            ))}
          </div>
        </div>

        {/* List Body */}
        <div className="space-y-2.5">
          {filteredItems.map((item, idx) => {
            const isFast = item.velocity === 'Fast';

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-emerald-900/30 bg-slate-50/50 dark:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Badge */}
                  <span
                    className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                      isFast
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-emerald-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                        {item.name}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          isFast
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-300'
                        }`}
                      >
                        {item.velocity}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-emerald-400/70 mt-0.5">
                      <span>{item.category}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        Turnover: <strong className="text-slate-700 dark:text-emerald-200">{item.turnoverDays}d</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sales & Trend */}
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-emerald-100">
                    {item.salesQty.toLocaleString('en-IN')} units
                  </div>
                  <div
                    className={`flex items-center justify-end gap-0.5 text-[10px] font-bold ${
                      item.trend === 'up'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {item.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>{item.trendPercent > 0 ? `+${item.trendPercent}%` : `${item.trendPercent}%`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer summary */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-emerald-900/30 text-[11px] text-slate-500 dark:text-emerald-400 flex items-center justify-between">
        <span className="flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-300">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          Fast threshold: &lt; 15 turnover days
        </span>
        <span className="flex items-center gap-1 font-semibold text-rose-800 dark:text-rose-300">
          <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          Slow threshold: &gt; 40 turnover days
        </span>
      </div>
    </div>
  );
};
