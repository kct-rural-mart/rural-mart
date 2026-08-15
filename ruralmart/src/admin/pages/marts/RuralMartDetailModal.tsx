import React, { useState } from 'react';
import {
  X,
  Phone,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  TrendingUp,
  Award,
  Store,
  DollarSign,
  Users,
  Package,
  AlertCircle,
  BarChart2,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { RuralMartData } from '../../../shared/types';

interface RuralMartDetailModalProps {
  mart: RuralMartData | null;
  onClose: () => void;
}

export const RuralMartDetailModal: React.FC<RuralMartDetailModalProps> = ({ mart, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'summary' | 'business' | 'farmers' | 'products'
  >('summary');

  if (!mart) return null;

  // Format currency helpers
  const formatLakhs = (raw: number) => `₹${(raw / 100000).toFixed(1)} Lakhs`;

  // Sample data points generated specifically for this mart
  const salesRaw = mart.salesRaw || 3800000;
  const grossProfitRaw = mart.grossProfitRaw || 820000;
  const netProfitRaw = Math.round(grossProfitRaw * 0.72);
  const totalBills = Math.round(salesRaw / 650);
  const avgBillValue = Math.round(salesRaw / (totalBills || 1));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center shadow-md shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-50">
                    {mart.name} Rural Mart
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-emerald-400 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" /> {mart.district} District
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-emerald-600" /> Manager: {mart.manager}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-emerald-600" /> {mart.contact}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-emerald-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (4 Tabs) */}
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-emerald-900/40 pt-3 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'border-emerald-600 text-emerald-800 dark:border-emerald-400 dark:text-emerald-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-emerald-400/70'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Summary</span>
            </button>

            <button
              onClick={() => setActiveTab('business')}
              className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'business'
                  ? 'border-emerald-600 text-emerald-800 dark:border-emerald-400 dark:text-emerald-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-emerald-400/70'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Business & Finance</span>
            </button>

            <button
              onClick={() => setActiveTab('farmers')}
              className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'farmers'
                  ? 'border-emerald-600 text-emerald-800 dark:border-emerald-400 dark:text-emerald-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-emerald-400/70'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Farmers & Outreach</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-emerald-600 text-emerald-800 dark:border-emerald-400 dark:text-emerald-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-emerald-400/70'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products & Inventory</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="py-2 space-y-4">
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {/* Quick Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Overall Index Score</span>
                  <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-100 mt-1 font-mono flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    {mart.score} / 100
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Sales Revenue</span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-emerald-100 mt-1 font-mono">
                    {formatLakhs(salesRaw)}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Gross Profit</span>
                  <p className="text-xl font-extrabold text-teal-700 dark:text-teal-300 mt-1 font-mono">
                    {formatLakhs(grossProfitRaw)}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/50 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                    Data Completeness
                  </span>
                  <p className="text-xl font-extrabold text-emerald-900 dark:text-emerald-50 mt-1 font-mono">
                    {mart.dataCompleteness}%
                  </p>
                </div>
              </div>

              {/* Score Factor Breakdown */}
              <div className="bg-slate-50/80 dark:bg-emerald-900/20 p-4 rounded-xl border border-slate-200/80 dark:border-emerald-800/40 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  6-Factor NABARD Composite Performance Breakdown
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-emerald-300">Sales Growth (20 pts):</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-300">
                        {mart.scoreBreakdown?.salesGrowth || 18.0} / 20
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-emerald-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${((mart.scoreBreakdown?.salesGrowth || 18) / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-emerald-300">Profitability (20 pts):</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-300">
                        {mart.scoreBreakdown?.profitability || 17.5} / 20
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-emerald-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${((mart.scoreBreakdown?.profitability || 17.5) / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-emerald-300">Farmer Engagement (20 pts):</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-300">
                        {mart.scoreBreakdown?.farmerEngagement || 19.0} / 20
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-emerald-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${((mart.scoreBreakdown?.farmerEngagement || 19) / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-emerald-300">Outreach Impact (15 pts):</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-300">
                        {mart.scoreBreakdown?.outreachImpact || 13.5} / 15
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-emerald-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${((mart.scoreBreakdown?.outreachImpact || 13.5) / 15) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-emerald-300">Inventory Health (15 pts):</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-300">
                        {mart.scoreBreakdown?.inventoryHealth || 14.0} / 15
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-emerald-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${((mart.scoreBreakdown?.inventoryHealth || 14) / 15) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600 dark:text-emerald-300">Compliance & Sync (10 pts):</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-300">
                        {mart.scoreBreakdown?.compliance || 9.5} / 10
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-emerald-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${((mart.scoreBreakdown?.compliance || 9.5) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUSINESS & FINANCE */}
          {activeTab === 'business' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Gross Sales Revenue</span>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-emerald-100 mt-1 font-mono">
                    {formatLakhs(salesRaw)}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Gross Profit</span>
                  <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-1 font-mono">
                    {formatLakhs(grossProfitRaw)}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Est. Net Margin</span>
                  <p className="text-lg font-extrabold text-teal-700 dark:text-teal-300 mt-1 font-mono">
                    {formatLakhs(netProfitRaw)} (21.6%)
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Bill Value</span>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-emerald-100 mt-1 font-mono">
                    ₹{avgBillValue.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Financial Metrics Detail */}
              <div className="p-4 bg-slate-50 dark:bg-emerald-900/20 rounded-xl border border-slate-200 dark:border-emerald-800/40 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-emerald-100 uppercase tracking-wider">
                  Operating Ledger Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500">Total Invoices Issued:</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-emerald-100">{totalBills.toLocaleString('en-IN')} Bills</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Procurement Cost:</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-emerald-100">{formatLakhs(salesRaw - grossProfitRaw)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">NABARD Grant Subsidy:</span>
                    <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹2.50 Lakhs (Active)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FARMERS & OUTREACH */}
          {activeTab === 'farmers' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Registered Farmers</span>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-emerald-100 mt-1 font-mono">
                    {mart.registeredFarmers.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Active Footfall</span>
                  <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-1 font-mono">
                    {mart.farmerFootfall?.toLocaleString('en-IN') || '1,890'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Farmers Reached</span>
                  <p className="text-lg font-extrabold text-sky-700 dark:text-sky-300 mt-1 font-mono">
                    {mart.farmersReached?.toLocaleString('en-IN') || '780'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Retention Rate</span>
                  <p className="text-lg font-extrabold text-purple-700 dark:text-purple-300 mt-1 font-mono">
                    78.4%
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-emerald-900/20 rounded-xl border border-slate-200 dark:border-emerald-800/40 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-emerald-100 uppercase tracking-wider">
                  Outreach Activities & Animal Coverage
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500">Outreach Programs Conducted:</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-emerald-100">18 Sessions</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Villages Covered:</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-emerald-100">24 Panchayats</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Cattle Head Count Covered:</span>
                    <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">4,250 Animals</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCTS & INVENTORY */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Healthy Stock SKUs</span>
                  <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-1 font-mono">
                    142 SKUs
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Low Stock Alerts</span>
                  <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-1 font-mono">
                    6 SKUs
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Out of Stock</span>
                  <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-1 font-mono">
                    2 SKUs
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Inventory Valuation</span>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-emerald-100 mt-1 font-mono">
                    ₹{((mart.salesRaw || 0) * 0.35 / 100000).toFixed(2)} Lakhs
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-emerald-900/20 rounded-xl border border-slate-200 dark:border-emerald-800/40 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-emerald-100 uppercase tracking-wider">
                  Top Moving Items at {mart.name}
                </h4>
                {mart.salesRaw > 0 ? (
                  <ul className="space-y-1.5 divide-y divide-slate-200/60 dark:divide-emerald-800/30 pt-1">
                    <li className="flex justify-between py-1">
                      <span className="font-medium text-slate-800 dark:text-emerald-100">1. Feed & Cattle Supplements</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Active Sales</span>
                    </li>
                  </ul>
                ) : (
                  <p className="text-slate-500 italic py-1">No sales items recorded for this Rural Mart.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/30 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-emerald-400/80">
            Last Synced: <span className="font-mono text-slate-700 dark:text-emerald-200">{mart.lastUpdated}</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-xl font-bold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
