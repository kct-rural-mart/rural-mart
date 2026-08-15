import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { AlertItem, AlertSeverity, AlertStatus } from '../../../shared/types';

interface AttentionRequiredPanelProps {
  alerts: AlertItem[];
  onReviewAlert: (alertId: string, newStatus: AlertStatus) => void;
  onOpenAllAlertsModal?: () => void;
}

export const AttentionRequiredPanel: React.FC<AttentionRequiredPanelProps> = ({
  alerts,
  onReviewAlert,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'All'>('All');
  const [selectedAlertForReview, setSelectedAlertForReview] = useState<AlertItem | null>(null);

  const filteredAlerts = alerts.filter((alt) => {
    if (filterSeverity === 'All') return true;
    return alt.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-[#FEE2E2] text-[#DC2626] dark:bg-[#3D1717] dark:text-[#FCA5A5] border border-[#FECACA] dark:border-[#7F1D1D]">
            <AlertOctagon className="w-2.5 h-2.5 text-[#DC2626]" />
            Critical
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-[#FEF3C7] text-[#B45309] dark:bg-[#3D2D10] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#78350F]">
            <AlertTriangle className="w-2.5 h-2.5 text-[#D97706]" />
            Warning
          </span>
        );
      case 'Info':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-[#DBEAFE] text-[#1D4ED8] dark:bg-[#1E293B] dark:text-[#93C5FD] border border-[#BFDBFE] dark:border-[#1E3A8A]">
            <Info className="w-2.5 h-2.5 text-[#2563EB]" />
            Info
          </span>
        );
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'New':
        return (
          <span className="text-[10px] font-bold text-[#DC2626] dark:text-[#FCA5A5] bg-[#FEE2E2]/60 dark:bg-[#3D1717] px-1.5 py-0.5 rounded border border-[#FECACA] dark:border-[#7F1D1D]">
            New
          </span>
        );
      case 'Under Review':
        return (
          <span className="text-[10px] font-bold text-[#B45309] dark:text-[#FBBF24] bg-[#FEF3C7]/60 dark:bg-[#3D2D10] px-1.5 py-0.5 rounded border border-[#FDE68A] dark:border-[#78350F]">
            Under Review
          </span>
        );
      case 'Resolved':
        return (
          <span className="text-[10px] font-bold text-[#103A2B] dark:text-[#A3E6C5] bg-[#E7F2EC] dark:bg-[#1B3D30] px-1.5 py-0.5 rounded border border-[#174F3A]/20 dark:border-[#A3E6C5]/20">
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#174F3A]/40 dark:hover:border-[#A3E6C5]/40 transition-all duration-200 flex flex-col justify-between relative">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#DDE6E0] dark:border-[#1E3129]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D97706] animate-pulse" />
          <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] tracking-tight">
            Attention Required
          </h2>
          <span className="text-[10px] font-bold text-[#DC2626] dark:text-[#FCA5A5] bg-[#FEE2E2] dark:bg-[#3D1717] px-1.5 py-0.5 rounded-full border border-[#FECACA] dark:border-[#7F1D1D]">
            {alerts.filter((a) => a.status !== 'Resolved').length} Active
          </span>
        </div>
      </div>

      {/* Filter Severity Buttons */}
      <div className="flex items-center gap-1 mb-2 text-[10px]">
        {(['All', 'Critical', 'Warning', 'Info'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
              filterSeverity === sev
                ? 'bg-[#174F3A] text-white dark:bg-[#103A2B] dark:text-white shadow-xs'
                : 'bg-[#F8FAF7] text-[#66736C] dark:bg-[#16241E] dark:text-[#8E9E96] border border-[#DDE6E0] dark:border-[#1E3129]'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Alerts Scrollable List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8A958F]">
            No alerts found for the selected filter.
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                alt.severity === 'Critical'
                  ? 'bg-[#FEE2E2]/30 dark:bg-[#3D1717]/30 border-[#FECACA] dark:border-[#7F1D1D] hover:border-[#DC2626]/50'
                  : alt.severity === 'Warning'
                  ? 'bg-[#FEF3C7]/30 dark:bg-[#3D2D10]/30 border-[#FDE68A] dark:border-[#78350F] hover:border-[#D97706]/50'
                  : 'bg-[#F8FAF7] dark:bg-[#16241E] border-[#DDE6E0] dark:border-[#1E3129] hover:border-[#174F3A]/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  {getSeverityBadge(alt.severity)}
                  <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                    {alt.ruralMart}
                  </span>
                </div>
                {getStatusBadge(alt.status)}
              </div>

              <p className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] mt-0.5">
                {alt.title}
              </p>

              <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96] mt-0.5 line-clamp-2">
                {alt.description}
              </p>

              <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-[#DDE6E0] dark:border-[#1E3129] text-[10px]">
                <span className="text-[#8A958F] dark:text-[#61736A] flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3" /> {alt.detectedTime}
                </span>

                <button
                  onClick={() => setSelectedAlertForReview(alt)}
                  className="text-[#174F3A] hover:text-[#103A2B] dark:text-[#8ECAAA] dark:hover:text-[#A3E6C5] font-bold underline transition-colors"
                >
                  Review Alert
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal Popover */}
      {selectedAlertForReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#DDE6E0] dark:border-[#1E3129] pb-2">
              <div className="flex items-center gap-2">
                {getSeverityBadge(selectedAlertForReview.severity)}
                <h3 className="font-bold text-sm text-[#17221D] dark:text-[#E6ECE8]">
                  {selectedAlertForReview.ruralMart} — Alert Action
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlertForReview(null)}
                className="text-[#8A958F] hover:text-[#17221D] dark:hover:text-[#E6ECE8] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                {selectedAlertForReview.title}
              </p>
              <p className="text-xs text-[#66736C] dark:text-[#8E9E96] mt-1 leading-relaxed">
                {selectedAlertForReview.description}
              </p>
              <p className="text-[10px] text-[#8A958F] mt-2">
                Category: <strong>{selectedAlertForReview.category}</strong> | Detected:{' '}
                {selectedAlertForReview.detectedTime}
              </p>
            </div>

            <div className="pt-3 border-t border-[#DDE6E0] dark:border-[#1E3129] flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                Update Status & Take Action:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onReviewAlert(selectedAlertForReview.id, 'Under Review');
                    setSelectedAlertForReview(null);
                  }}
                  className="px-3 py-2 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs shadow-xs transition-all"
                >
                  Mark Under Review
                </button>

                <button
                  onClick={() => {
                    onReviewAlert(selectedAlertForReview.id, 'Resolved');
                    setSelectedAlertForReview(null);
                  }}
                  className="px-3 py-2 rounded-lg bg-[#174F3A] hover:bg-[#103A2B] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolve Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
