import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ChartDataPoint,
  MetricSelection,
  TimeGrouping,
  Theme,
} from '../../../shared/types';
import { getNetworkTrendData } from '../../../shared/dataServices';

interface NetworkPerformanceTrendProps {
  theme: Theme;
}

export const NetworkPerformanceTrend: React.FC<NetworkPerformanceTrendProps> = ({ theme }) => {
  const [metric, setMetric] = useState<MetricSelection>('Both');
  const [timeGrouping, setTimeGrouping] = useState<TimeGrouping>('Monthly');
  const [comparePrevious, setComparePrevious] = useState<boolean>(false);

  // Select dataset based on time grouping from shared data layer
  const chartData = getNetworkTrendData(timeGrouping);

  // Color tokens
  const isDark = theme === 'dark';
  const salesStroke = isDark ? '#8ECAAA' : '#174F3A'; // Primary Forest / Soft Mint
  const profitStroke = isDark ? '#A3E6C5' : '#34735A'; // Accent Sage Green
  const prevSalesStroke = isDark ? '#8ECAAA60' : '#174F3A50';
  const prevProfitStroke = isDark ? '#A3E6C560' : '#34735A50';
  const gridColor = isDark ? '#1E3129' : '#DDE6E0';
  const textColor = isDark ? '#8E9E96' : '#66736C';

  // Y-axis tick formatter
  const formatYAxis = (val: number) => {
    if (timeGrouping === 'Yearly') {
      return `₹${val} Cr`;
    }
    return `₹${val} L`;
  };

  // Custom Hover Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;

      return (
        <div className="bg-[#17221D]/95 text-white dark:bg-[#16241E]/95 dark:text-[#E6ECE8] border border-[#34735A] p-3 rounded-xl shadow-lg text-xs space-y-1.5 min-w-[200px]">
          <div className="font-bold text-sm text-[#A3E6C5] border-b border-[#34735A]/50 pb-1 flex justify-between items-center">
            <span>{label}</span>
            <span className="text-[10px] font-normal text-[#8A958F]">Period Overview</span>
          </div>

          {(metric === 'Both' || metric === 'Sales') && (
            <div className="flex items-center justify-between text-[#E6ECE8]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#174F3A] dark:bg-[#8ECAAA] inline-block" />
                <span className="font-medium">Total Sales:</span>
              </div>
              <div className="text-right">
                <span className="font-bold">₹{data.sales} Lakhs</span>
                <span className="ml-1.5 text-[10px] text-[#A3E6C5] font-bold">
                  ({data.salesChange})
                </span>
              </div>
            </div>
          )}

          {(metric === 'Both' || metric === 'Gross Profit') && (
            <div className="flex items-center justify-between text-[#E6ECE8]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34735A] dark:bg-[#A3E6C5] inline-block" />
                <span className="font-medium">Gross Profit:</span>
              </div>
              <div className="text-right">
                <span className="font-bold">₹{data.grossProfit} Lakhs</span>
                <span className="ml-1.5 text-[10px] text-[#A3E6C5] font-bold">
                  ({data.profitChange})
                </span>
              </div>
            </div>
          )}

          {comparePrevious && data.prevSales && (
            <div className="pt-1 border-t border-[#34735A]/50 text-[10px] text-[#8A958F] flex justify-between">
              <span>Prev Period Sales:</span>
              <span className="text-[#E6ECE8]">₹{data.prevSales} L</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#DDE6E0] dark:border-[#1E3129]">
        <div>
          <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
            Network Performance Trend
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Metric Selector Pills */}
          <div className="flex items-center bg-[#F8FAF7] dark:bg-[#16241E] p-0.5 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129]">
            {(['Both', 'Sales', 'Gross Profit'] as MetricSelection[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  metric === m
                    ? 'bg-[#174F3A] dark:bg-[#103A2B] text-white shadow-xs'
                    : 'text-[#66736C] dark:text-[#8E9E96] hover:text-[#17221D] dark:hover:text-[#E6ECE8]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Time Grouping Segmented Control */}
          <div className="flex items-center bg-[#F8FAF7] dark:bg-[#16241E] p-0.5 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129]">
            {(['Monthly', 'Quarterly', 'Half-yearly', 'Yearly'] as TimeGrouping[]).map((tg) => (
              <button
                key={tg}
                onClick={() => setTimeGrouping(tg)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  timeGrouping === tg
                    ? 'bg-[#174F3A] dark:bg-[#103A2B] text-white shadow-xs'
                    : 'text-[#66736C] dark:text-[#8E9E96] hover:text-[#17221D] dark:hover:text-[#E6ECE8]'
                }`}
              >
                {tg}
              </button>
            ))}
          </div>

          {/* Compare with Previous Period Switch */}
          <label className="flex items-center gap-1.5 cursor-pointer ml-1 select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={comparePrevious}
                onChange={(e) => setComparePrevious(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-7 h-4 rounded-full transition-colors ${
                  comparePrevious ? 'bg-[#174F3A]' : 'bg-[#DDE6E0] dark:bg-[#1E3129]'
                }`}
              />
              <div
                className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                  comparePrevious ? 'transform translate-x-3' : ''
                }`}
              />
            </div>
            <span className="text-[11px] font-medium text-[#66736C] dark:text-[#8E9E96]">
              Compare prev.
            </span>
          </label>
        </div>
      </div>

      {/* Recharts Area Chart Container */}
      <div className="w-full h-72 md:h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {/* Sales Gradient Fill */}
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={salesStroke} stopOpacity={0.25} />
                <stop offset="95%" stopColor={salesStroke} stopOpacity={0.0} />
              </linearGradient>

              {/* Profit Gradient Fill */}
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={profitStroke} stopOpacity={0.22} />
                <stop offset="95%" stopColor={profitStroke} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

            <XAxis
              dataKey="period"
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />

            {/* Previous Period Baseline (only rendered when compare switch is enabled) */}
            {comparePrevious && (metric === 'Both' || metric === 'Sales') && (
              <Area
                type="monotone"
                dataKey="prevSales"
                name="Prev. Period Sales"
                stroke={prevSalesStroke}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                fill="none"
                dot={false}
              />
            )}

            {/* Continuous Solid Line 1: Sales */}
            {(metric === 'Both' || metric === 'Sales') && (
              <Area
                type="monotone"
                dataKey="sales"
                name="Total Sales"
                stroke={salesStroke}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#salesGrad)"
                dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#121E19' : '#ffffff', stroke: salesStroke }}
                activeDot={{ r: 6, strokeWidth: 2, fill: salesStroke, stroke: '#ffffff' }}
              />
            )}

            {/* Continuous Solid Line 2: Gross Profit */}
            {(metric === 'Both' || metric === 'Gross Profit') && (
              <Area
                type="monotone"
                dataKey="grossProfit"
                name="Gross Profit"
                stroke={profitStroke}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#profitGrad)"
                dot={{ r: 3.5, strokeWidth: 2, fill: isDark ? '#121E19' : '#ffffff', stroke: profitStroke }}
                activeDot={{ r: 5.5, strokeWidth: 2, fill: profitStroke, stroke: '#ffffff' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
