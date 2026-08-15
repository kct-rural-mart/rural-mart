import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { RuralMartData } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  marts: RuralMartData[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, marts }) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);

    if (exportFormat === 'csv') {
      const headers = [
        'Rural Mart',
        'District',
        'Status',
        'Sales (Rupees)',
        'Gross Profit (Rupees)',
        'Registered Farmers',
        'Performance Score',
        'Data Completeness (%)',
        'Last Updated',
      ];

      const rows = marts.map((m) => [
        `"${m.name}"`,
        `"${m.district}"`,
        `"${m.status}"`,
        m.salesRaw,
        m.grossProfitRaw,
        m.registeredFarmers,
        m.score,
        m.dataCompleteness,
        `"${m.lastUpdated}"`,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Rural_Mart_Executive_Overview_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }

    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => {
        setDownloaded(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDE6E0] dark:border-[#1E3129] pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#174F3A] dark:text-[#A3E6C5]" />
            <h2 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8]">
              Export Executive Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A958F] hover:text-[#17221D] dark:hover:text-[#E6ECE8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
          Generate and download complete network performance data, financial metrics, and score cards across all {marts.length} Rural Marts.
        </p>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
            Select Format:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setExportFormat('csv')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                exportFormat === 'csv'
                  ? 'bg-[#E7F2EC] dark:bg-[#1B3D30] border-[#174F3A] dark:border-[#A3E6C5] text-[#103A2B] dark:text-[#A3E6C5]'
                  : 'bg-[#F8FAF7] dark:bg-[#16241E] border-[#DDE6E0] dark:border-[#1E3129] text-[#66736C] dark:text-[#8E9E96]'
              }`}
            >
              <FileSpreadsheet className="w-6 h-6 text-[#174F3A] dark:text-[#A3E6C5]" />
              <span>CSV Spreadsheet</span>
            </button>

            <button
              onClick={() => setExportFormat('pdf')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                exportFormat === 'pdf'
                  ? 'bg-[#E7F2EC] dark:bg-[#1B3D30] border-[#174F3A] dark:border-[#A3E6C5] text-[#103A2B] dark:text-[#A3E6C5]'
                  : 'bg-[#F8FAF7] dark:bg-[#16241E] border-[#DDE6E0] dark:border-[#1E3129] text-[#66736C] dark:text-[#8E9E96]'
              }`}
            >
              <FileText className="w-6 h-6 text-[#34735A] dark:text-[#8ECAAA]" />
              <span>Printable PDF</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-[#DDE6E0] dark:border-[#1E3129] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[#66736C] dark:text-[#8E9E96] hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || downloaded}
            className="px-5 py-2 rounded-xl bg-[#174F3A] hover:bg-[#103A2B] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            {downloaded ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#A3E6C5]" /> Export Complete
              </>
            ) : downloading ? (
              'Generating File...'
            ) : (
              <>
                <Download className="w-4 h-4" /> Download Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
