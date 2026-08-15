import React, { useState } from 'react';
import { RefreshCw, Clock } from 'lucide-react';

interface CompactSyncStatusProps {
  onSync: () => void;
  lastSyncedTime: string;
}

export const CompactSyncStatus: React.FC<CompactSyncStatusProps> = ({ onSync, lastSyncedTime }) => {
  const [syncing, setSyncing] = useState(false);

  const handleRefresh = () => {
    setSyncing(true);
    // onSync(); // Disabled until backend is connected

    setTimeout(() => {
      setSyncing(false);
    }, 800);
  };

  return (
    <div className="bg-[#F8FAF7] dark:bg-[#16241E] border-b border-[#DDE6E0] dark:border-[#1E3129] px-4 md:px-6 py-1.5 text-xs transition-colors duration-150">
      <div className="flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4 text-[#66736C] dark:text-[#8E9E96]">
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 font-medium">
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">Backend not connected</span>
          </div>

          <span className="text-[#DDE6E0] dark:text-[#1E3129] hidden sm:inline">•</span>

          {/* Last Synced */}
          <div className="flex items-center gap-1 text-[#66736C] dark:text-[#8E9E96]">
            <Clock className="w-3.5 h-3.5 text-[#8A958F] dark:text-[#61736A]" />
            <span>
              Last synced: <strong className="text-[#17221D] dark:text-[#E6ECE8]">Pending connection</strong>
            </span>
          </div>
        </div>

        {/* Sync / Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={syncing}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[#66736C] dark:text-[#8E9E96] hover:text-[#103A2B] dark:hover:text-[#E6ECE8] hover:bg-[#F1F6F3] dark:hover:bg-[#182921] transition-all text-[11px] font-semibold active:scale-95 border border-[#DDE6E0] dark:border-[#1E3129]"
          title="Force refresh status"
        >
          <RefreshCw className={`w-3 h-3 text-[#174F3A] dark:text-[#8ECAAA] ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  );
};
