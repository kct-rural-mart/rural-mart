import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  PieChart,
  Wallet,
  Receipt,
  Percent,
  Info,
} from 'lucide-react';
import { MartFinancialRecord } from '../../../shared/types';

interface FinanceKpiCardsProps {
  financialMarts: MartFinancialRecord[];
}

export const FinanceKpiCards: React.FC<FinanceKpiCardsProps> = ({ financialMarts }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Dynamically calculate aggregate sums based on filtered marts
  const totalSalesRaw = financialMarts.reduce((acc, m) => acc + m.salesRaw, 0);
  const totalProcurementRaw = financialMarts.reduce((acc, m) => acc + m.procurementRaw, 0);
  const totalGrossProfitRaw = financialMarts.reduce((acc, m) => acc + m.grossProfitRaw, 0);
  const totalNetProfitRaw = financialMarts.reduce((acc, m) => acc + m.netProfitRaw, 0);
  const totalBillsSum = financialMarts.reduce((acc, m) => acc + m.totalBills, 0);

  // Calculated averages & margins
  const overallMargin = totalSalesRaw > 0 ? ((totalNetProfitRaw / totalSalesRaw) * 100).toFixed(2) : '0.00';
  const overallAvgBill = totalBillsSum > 0 ? Math.round(totalSalesRaw / totalBillsSum) : 0;

  // Currency format helper
  const formatLakhsCr = (valRaw: number) => {
    if (valRaw >= 10000000) {
      return `₹${(valRaw / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(valRaw / 100000).toFixed(1)} L`;
  };

  // Sparkline mini SVG component
  const SparklineSvg = ({ data, color }: { data: number[]; color: string }) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 64;
    const height = 20;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  const kpis = [
    {
      id: 'kpi-sales',
      label: 'Total Sales',
      value: formatLakhsCr(totalSalesRaw),
      icon: TrendingUp,
      badge: '+12.4%',
      isPositive: true,
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/20',
      sparklineColor: '#174F3A',
      sparklineData: [14.2, 16.8, 19.5, 21.0, 23.4, 26.2, 28.9, 34.0],
      comparison: 'vs prev. period',
      tooltip: 'Total sales turnover realized across all active Rural Mart outposts.',
    },
    {
      id: 'kpi-procurement',
      label: 'Procurement Value',
      value: formatLakhsCr(totalProcurementRaw),
      icon: ShoppingCart,
      badge: '+10.1%',
      isPositive: true,
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/20',
      sparklineColor: '#2563EB',
      sparklineData: [11.1, 13.2, 15.3, 16.5, 18.5, 20.7, 22.8, 27.3],
      comparison: 'vs prev. period',
      tooltip: 'Total wholesale procurement expenditure for seed, fertilizer, and farm merchandise.',
    },
    {
      id: 'kpi-gross-profit',
      label: 'Gross Profit',
      value: formatLakhsCr(totalGrossProfitRaw),
      icon: PieChart,
      badge: '+8.7%',
      isPositive: true,
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/20',
      sparklineColor: '#34735A',
      sparklineData: [3.1, 3.6, 4.2, 4.5, 4.9, 5.5, 6.1, 6.7],
      comparison: 'vs prev. period',
      tooltip: 'Revenue remaining after subtracting Cost of Goods Sold (COGS).',
    },
    {
      id: 'kpi-net-profit',
      label: 'Net Profit',
      value: formatLakhsCr(totalNetProfitRaw),
      icon: Wallet,
      badge: '+14.2%',
      isPositive: true,
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/20',
      sparklineColor: '#103A2B',
      sparklineData: [1.8, 2.2, 2.7, 3.0, 3.3, 3.7, 4.1, 4.8],
      comparison: 'vs prev. period',
      tooltip: 'Final net earnings after accounting for operating expenses, rent, and logistics overhead.',
    },
    {
      id: 'kpi-avg-bill',
      label: 'Avg Bill Value',
      value: `₹${overallAvgBill.toLocaleString('en-IN')}`,
      icon: Receipt,
      badge: '+5.3%',
      isPositive: true,
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/20',
      sparklineColor: '#4F46E5',
      sparklineData: [1543, 1600, 1652, 1666, 1695, 1735, 1730, 1713],
      comparison: 'vs prev. period',
      tooltip: 'Average monetary amount spent per customer purchase bill across Rural Marts.',
    },
    {
      id: 'kpi-profit-margin',
      label: 'Profit Margin',
      value: `${overallMargin}%`,
      icon: Percent,
      badge: '+1.8%',
      isPositive: true,
      badgeClass: 'bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/20',
      sparklineColor: '#D97706',
      sparklineData: [12.6, 13.1, 13.8, 14.2, 14.1, 14.1, 14.2, 13.9],
      comparison: 'vs prev. period',
      tooltip: 'Net profit expressed as a percentage of total revenue across the network.',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isTooltipOpen = activeTooltip === kpi.id;

        return (
          <div
            key={kpi.id}
            className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 cursor-pointer relative flex flex-col justify-between group"
          >
            {/* Top Row: Label & Info Icon */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider truncate">
                {kpi.label}
              </span>
              <div className="relative flex items-center">
                <button
                  onMouseEnter={() => setActiveTooltip(kpi.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(isTooltipOpen ? null : kpi.id)}
                  className="text-[#8A958F] hover:text-[#174F3A] dark:text-[#61736A] dark:hover:text-[#A3E6C5] transition-colors p-0.5"
                  title="More information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {/* Info Tooltip Popover */}
                {isTooltipOpen && (
                  <div className="absolute right-0 top-6 w-48 bg-[#17221D] text-white dark:bg-[#16241E] dark:text-[#E6ECE8] text-[10px] p-2 rounded-lg shadow-lg z-50 pointer-events-none leading-relaxed border border-[#34735A]">
                    {kpi.tooltip}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Row: Value & Main Icon */}
            <div className="flex items-baseline justify-between gap-2 my-1">
              <span className="text-xl md:text-2xl font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
                {kpi.value}
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
