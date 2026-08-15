import React from 'react';
import {
  FileText,
  Globe,
  Store,
  Briefcase,
  Users,
  Package,
  Layers,
  Calendar,
  Sparkles,
  Download,
  Plus,
} from 'lucide-react';

interface ReportsHeaderProps {
  onQuickAction: (actionType: string) => void;
  onOpenGenerateModal: () => void;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  onQuickAction,
  onOpenGenerateModal,
}) => {
  const quickActions = [
    {
      id: 'combined-net',
      label: 'Combined Network Report',
      icon: Globe,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'ind-mart',
      label: 'Individual Rural Mart Report',
      icon: Store,
      color: 'hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'biz-fin',
      label: 'Business & Finance Report',
      icon: Briefcase,
      color: 'hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'farmers-outreach',
      label: 'Farmers & Outreach Report',
      icon: Users,
      color: 'hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'prod-inv',
      label: 'Products & Inventory Report',
      icon: Package,
      color: 'hover:border-teal-500/50 hover:bg-teal-50/50 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    },
    {
      id: 'comparison',
      label: 'Comparison Report',
      icon: Layers,
      color: 'hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    },
    {
      id: 'monthly-qtr-yr',
      label: 'Monthly, Quarterly & Yearly Reports',
      icon: Calendar,
      color: 'hover:border-sky-500/50 hover:bg-sky-50/50 dark:hover:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    },
  ];

  return (
    <div className="bg-white dark:bg-emerald-950/70 border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Top Title & CTA Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-emerald-900/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Reports
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-300/80 pl-0.5">
            Generate and download consolidated and individual Rural Mart reports.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenGenerateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all duration-150 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Generate Custom Report</span>
          </button>
        </div>
      </div>

      {/* Quick Action Chips Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-400/70 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Report Generators & Download Shortcuts
          </span>
          <span className="text-[11px] text-slate-400 dark:text-emerald-400/60 hidden sm:inline">
            Click any shortcut to generate & preview instantly
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onQuickAction(action.label)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-emerald-800/40 bg-slate-50/70 dark:bg-emerald-900/20 transition-all duration-150 ${action.color} group`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{action.label}</span>
                <Download className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
