import { useState } from 'react'
import { RefreshCw, Clock } from 'lucide-react'

export default function CompactStatusLine({ onSync, lastSyncedTime }) {
  const [syncing, setSyncing] = useState(false)

  const handleRefresh = () => {
    setSyncing(true)
    onSync()
    setTimeout(() => {
      setSyncing(false)
    }, 800)
  }

  return (
    <div className="bg-brand-bg-subtle dark:bg-[#16241E] border-b border-brand-border dark:border-[#1E3129] px-4 md:px-6 py-1.5 text-xs transition-colors duration-150">
      <div className="flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4 text-brand-text-muted dark:text-[#8E9E96]">
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
            </span>
            <span className="font-bold text-brand-text dark:text-[#E6ECE8]">Up to date</span>
          </div>

          <span className="text-brand-border dark:text-[#1E3129] hidden sm:inline">•</span>

          <div className="flex items-center gap-1 text-brand-text-muted dark:text-[#8E9E96]">
            <Clock className="w-3.5 h-3.5 text-brand-text-subtle dark:text-[#61736A]" />
            <span>
              Last synced: <strong className="text-brand-text dark:text-[#E6ECE8]">{lastSyncedTime}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={syncing}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-brand-text-muted dark:text-[#8E9E96] hover:text-brand-primary-dark dark:hover:text-[#E6ECE8] hover:bg-brand-bg dark:hover:bg-[#182921] transition-all text-[11px] font-semibold active:scale-95 border border-brand-border dark:border-[#1E3129]"
          title="Force refresh status"
        >
          <RefreshCw className={`w-3 h-3 text-brand-primary dark:text-[#8ECAAA] ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  )
}
