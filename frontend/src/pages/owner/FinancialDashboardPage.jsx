import React, { useState } from 'react';
import FinanceHeader from '../../components/owner/FinanceHeader';
import FinanceKpiCards from '../../components/owner/FinanceKpiCards';
import FinanceForm from '../../components/owner/FinanceForm';
import RevenueChart from '../../components/owner/RevenueChart';
import FinanceLedgerDrawer from '../../components/owner/FinanceLedgerDrawer';

export default function FinancialDashboardPage() {
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // Form input state
  const [operationType, setOperationType] = useState('Retail Sales & Procurement');
  const [grossRevenue, setGrossRevenue] = useState('');
  const [procurementCosts, setProcurementCosts] = useState('');
  const [operatingExpenses, setOperatingExpenses] = useState('');

  // Initial 7-day chart data
  const [chartData, setChartData] = useState([
    { date: '19 May', revenue: 160000, profit: 62000 },
    { date: '21 May', revenue: 195000, profit: 68000 },
    { date: '23 May', revenue: 210000, profit: 71000 },
    { date: '25 May', revenue: 248750, profit: 78450 },
  ]);

  // Full Ledger Audit Logs state (handles August 6 and historical items)
  const [ledgerEntries, setLedgerEntries] = useState([
    {
      id: 1,
      date: '25 May 2024 (Sat)',
      dateRaw: '25 May 2024',
      status: 'Saved',
      tag: 'Retail Sales & Procurement',
      net: '₹42,360',
      revenue: '₹248,750',
      revenueNum: 248750,
      procurement: '₹170,300',
      procurementNum: 170300,
      expenses: '₹36,090',
      expensesNum: 36090,
    },
    {
      id: 2,
      date: '24 May 2024 (Fri)',
      dateRaw: '24 May 2024',
      status: 'Saved',
      tag: 'Bulk Wholesaling',
      net: '₹38,120',
      revenue: '₹221,300',
      revenueNum: 221300,
      procurement: '₹151,200',
      procurementNum: 151200,
      expenses: '₹31,980',
      expensesNum: 31980,
    },
    {
      id: 3,
      date: '21 May 2024 (Tue)',
      dateRaw: '21 May 2024',
      status: 'Edited',
      tag: 'Inventory Restock & Feed Purchase',
      net: '₹34,760',
      revenue: '₹206,480',
      revenueNum: 206480,
      procurement: '₹141,000',
      procurementNum: 141000,
      expenses: '₹30,720',
      expensesNum: 30720,
    },
  ]);

  const calculatedGrossProfit = (Number(grossRevenue) || 0) - (Number(procurementCosts) || 0);
  const calculatedNetProfit = calculatedGrossProfit - (Number(operatingExpenses) || 0);

  const handleClearForm = () => {
    setOperationType('Retail Sales & Procurement');
    setGrossRevenue('');
    setProcurementCosts('');
    setOperatingExpenses('');
  };

  // Add the newly saved form entry to both the chart AND the ledger drawer history!
  const handleSaveLog = () => {
    if (!grossRevenue && !procurementCosts) return;

    const todayString = '6 Aug 2026';
    const todayShort = '6 Aug';

    const newChartEntry = {
      date: todayShort,
      revenue: Number(grossRevenue),
      profit: calculatedNetProfit,
    };

    const newLedgerEntry = {
      id: Date.now(),
      date: `${todayString} (Thu)`,
      dateRaw: todayString,
      status: 'Saved',
      tag: operationType,
      net: `₹${calculatedNetProfit.toLocaleString('en-IN')}`,
      revenue: `₹${Number(grossRevenue).toLocaleString('en-IN')}`,
      revenueNum: Number(grossRevenue),
      procurement: `₹${Number(procurementCosts).toLocaleString('en-IN')}`,
      procurementNum: Number(procurementCosts),
      expenses: `₹${Number(operatingExpenses).toLocaleString('en-IN')}`,
      expensesNum: Number(operatingExpenses),
    };

    // Update Chart Data (Keep latest 7 entries)
    setChartData((prevData) => [...prevData, newChartEntry].slice(-7));

    // Update Ledger Logs Drawer State
    setLedgerEntries((prevLogs) => [newLedgerEntry, ...prevLogs]);

    // Reset form after saving
    handleClearForm();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <FinanceHeader 
        activeDate="6 Aug 2026" 
        ledgerCount={ledgerEntries.length} 
        onOpenLedger={() => setIsLedgerOpen(true)} 
      />
      
      <FinanceKpiCards />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        <FinanceForm 
          operationType={operationType}
          setOperationType={setOperationType}
          grossRevenue={grossRevenue}
          setGrossRevenue={setGrossRevenue}
          procurementCosts={procurementCosts}
          setProcurementCosts={setProcurementCosts}
          operatingExpenses={operatingExpenses}
          setOperatingExpenses={setOperatingExpenses}
          calculatedGrossProfit={calculatedGrossProfit}
          calculatedNetProfit={calculatedNetProfit}
          onClear={handleClearForm}
          onSave={handleSaveLog}
        />

        <RevenueChart data={chartData} />
      </div>

      {/* Passes live state and allows editing/deleting directly from drawer */}
      <FinanceLedgerDrawer 
        isOpen={isLedgerOpen} 
        onClose={() => setIsLedgerOpen(false)} 
        logs={ledgerEntries} 
        setLogs={setLedgerEntries} 
      />
    </div>
  );
}