import React from 'react';
import {
  X,
  Phone,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  TrendingUp,
  Award,
  Database,
  Store,
} from 'lucide-react';
import { RuralMartData } from '../types';

interface MartDetailModalProps {
  mart: RuralMartData | null;
  onClose: () => void;
}

export const MartDetailModal: React.FC<MartDetailModalProps> = ({ mart, onClose }) => {
  if (!mart) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center shadow">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-emerald-50">
                {mart.name} Rural Mart
              </h2>
              <p className="text-xs text-slate-500 dark:text-emerald-400 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" /> {mart.district} District
                </span>
                <span>•</span>
                <span>Manager: {mart.manager}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-emerald-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Sales Revenue</span>
            <p className="text-base font-extrabold text-slate-900 dark:text-emerald-100 mt-1 font-mono">
              ₹{(mart.salesRaw / 100000).toFixed(1)} L
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Gross Profit</span>
            <p className="text-base font-extrabold text-teal-700 dark:text-teal-300 mt-1 font-mono">
              ₹{(mart.grossProfitRaw / 100000).toFixed(1)} L
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-emerald-900/30 rounded-xl border border-slate-100 dark:border-emerald-800/30">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Reg. Farmers</span>
            <p className="text-base font-extrabold text-slate-900 dark:text-emerald-100 mt-1 font-mono">
              {mart.registeredFarmers.toLocaleString()}
            </p>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/50 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
              Overall Score
            </span>
            <p className="text-base font-extrabold text-emerald-900 dark:text-emerald-50 mt-1 font-mono flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500" />
              {mart.score} / 100
            </p>
          </div>
        </div>

        {/* Methodology Score Breakdown */}
        <div className="bg-slate-50/80 dark:bg-emerald-900/20 p-4 rounded-xl border border-slate-200/80 dark:border-emerald-800/40 space-y-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-emerald-100 uppercase tracking-wider">
            6-Factor Performance Score Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div>
              <span className="text-slate-500 dark:text-emerald-400">Sales Growth (20%):</span>
              <p className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
                {mart.scoreBreakdown.salesGrowth} / 20 pts
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-emerald-400">Profitability (20%):</span>
              <p className="font-bold font-mono text-teal-700 dark:text-teal-300">
                {mart.scoreBreakdown.profitability} / 20 pts
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-emerald-400">Farmer Engagement (20%):</span>
              <p className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
                {mart.scoreBreakdown.farmerEngagement} / 20 pts
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-emerald-400">Outreach Impact (15%):</span>
              <p className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
                {mart.scoreBreakdown.outreachImpact} / 15 pts
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-emerald-400">Inventory Health (15%):</span>
              <p className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
                {mart.scoreBreakdown.inventoryHealth} / 15 pts
              </p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-emerald-400">Data Compliance (10%):</span>
              <p className="font-bold font-mono text-amber-600 dark:text-amber-300">
                {mart.scoreBreakdown.compliance} / 10 pts
              </p>
            </div>
          </div>
        </div>

        {/* Manager & Operational Details */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 text-xs p-3 bg-white dark:bg-emerald-950 rounded-xl border border-slate-200/80 dark:border-emerald-800/40">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-slate-700 dark:text-emerald-200">
              <User className="w-3.5 h-3.5 text-emerald-600" /> Manager: <strong>{mart.manager}</strong>
            </p>
            <p className="flex items-center gap-1.5 text-slate-700 dark:text-emerald-200">
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone: <strong>{mart.contact}</strong>
            </p>
          </div>

          <div className="space-y-1 sm:text-right">
            <p className="flex items-center sm:justify-end gap-1.5 text-slate-700 dark:text-emerald-200">
              <Database className="w-3.5 h-3.5 text-emerald-600" /> Data Completeness:{' '}
              <strong className="font-mono">{mart.dataCompleteness}%</strong>
            </p>
            <p className="flex items-center sm:justify-end gap-1.5 text-slate-500 dark:text-emerald-400">
              <Calendar className="w-3.5 h-3.5" /> Last Updated: {mart.lastUpdated}
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow transition-all"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
