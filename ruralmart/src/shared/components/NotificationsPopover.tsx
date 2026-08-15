import React from 'react';
import { Bell, Check, Clock, X } from 'lucide-react';
import { AlertItem } from '../types';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  onMarkAllRead: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  alerts,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-16 w-80 sm:w-96 bg-white dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 rounded-2xl shadow-2xl z-50 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900 pb-2">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-emerald-50">
            System Notifications
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllRead}
            className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-emerald-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 dark:text-emerald-400">
            No notifications available.
          </div>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/20 border border-slate-100 dark:border-emerald-800/30 text-xs space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-emerald-100">
                  {alt.ruralMart} Mart
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{alt.detectedTime}</span>
              </div>
              <p className="text-slate-600 dark:text-emerald-300/90 text-[11px]">
                {alt.title}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
