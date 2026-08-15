import React from 'react';
import { X, AlertTriangle, AlertOctagon, Info, CheckCircle2 } from 'lucide-react';
import { AlertItem, AlertStatus } from '../types';

interface AllAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  onReviewAlert: (alertId: string, newStatus: AlertStatus) => void;
}

export const AllAlertsModal: React.FC<AllAlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onReviewAlert,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#DDE6E0] dark:border-[#1E3129] pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#D97706]" />
            <h2 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8]">
              All Active & Operational Alerts ({alerts.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A958F] hover:text-[#17221D] dark:hover:text-[#E6ECE8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className="p-3 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alt.severity === 'Critical'
                        ? 'bg-[#FEE2E2] text-[#DC2626] dark:bg-[#3D1717] dark:text-[#FCA5A5]'
                        : alt.severity === 'Warning'
                        ? 'bg-[#FEF3C7] text-[#B45309] dark:bg-[#3D2D10] dark:text-[#FBBF24]'
                        : 'bg-[#DBEAFE] text-[#1D4ED8] dark:bg-[#1E293B] dark:text-[#93C5FD]'
                    }`}
                  >
                    {alt.severity}
                  </span>
                  <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">
                    {alt.ruralMart} Mart ({alt.district})
                  </span>
                  <span className="text-[10px] text-[#8A958F]">• {alt.detectedTime}</span>
                </div>
                <p className="font-bold text-[#17221D] dark:text-[#E6ECE8]">{alt.title}</p>
                <p className="text-[#66736C] dark:text-[#8E9E96] text-[11px]">{alt.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5]">
                  {alt.status}
                </span>

                {alt.status !== 'Resolved' && (
                  <button
                    onClick={() => onReviewAlert(alt.id, 'Resolved')}
                    className="px-3 py-1.5 rounded-lg bg-[#174F3A] hover:bg-[#103A2B] text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#DDE6E0] dark:border-[#1E3129] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] text-[#17221D] dark:text-[#E6ECE8] font-bold text-xs hover:bg-[#E7F2EC] dark:hover:bg-[#1B3D30] transition-colors"
          >
            Close Alerts Window
          </button>
        </div>
      </div>
    </div>
  );
};
