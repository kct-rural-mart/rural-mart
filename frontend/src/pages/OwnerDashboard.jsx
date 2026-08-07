import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  TrendingUp, 
  IndianRupee, 
  Package, 
  Users, 
  Download, 
  Calendar, 
  ArrowUpRight,
  Loader2,
  Clock,
  FileSpreadsheet,
  FileText,
  ChevronDown
} from 'lucide-react';

export default function OwnerDashboard() {
  const { searchQuery, selectedDate } = useOutletContext() || {};

  const [activeModal, setActiveModal] = useState(null); 
  const [chartMode, setChartMode] = useState('current');
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeDataPoint, setActiveDataPoint] = useState(null);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const exportButtonRef = useRef(null);
  const exportMenuRef = useRef(null);

  const handleToggleExport = () => {
    if (!showExportMenu && exportButtonRef.current) {
      const rect = exportButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setShowExportMenu(!showExportMenu);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        exportMenuRef.current && !exportMenuRef.current.contains(e.target) &&
        exportButtonRef.current && !exportButtonRef.current.contains(e.target)
      ) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [dashboardMetrics, setDashboardMetrics] = useState({
    salesGrowth: '₹14,200,000',
    salesGrowthSub: '+12.5% vs last month',
    netProfitRupees: '₹3,521,600',
    netProfitSub: '✓ On Track (Target: ₹3.0M)',
    topSellingItem: 'Organic NPK Fertilizer',
    topSellingSub: '4.2k units sold this cycle',
    farmerLeads: '482 Farmers',
    farmerLeadsSub: '+18.0% outreach response'
  });

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      if (selectedDate === '2026-08-05') {
        setDashboardMetrics({
          salesGrowth: '₹18,900,000',
          salesGrowthSub: 'Peak current cycle day',
          netProfitRupees: '₹4,820,000',
          netProfitSub: '✓ Exceeded target by 35%',
          topSellingItem: 'Hybrid Paddy Seeds',
          topSellingSub: '6.8k units sold this cycle',
          farmerLeads: '610 Farmers',
          farmerLeadsSub: 'High festival turnout'
        });
      } else {
        setDashboardMetrics({
          salesGrowth: '₹14,200,000',
          salesGrowthSub: '+12.5% vs last month',
          netProfitRupees: '₹3,521,600',
          netProfitSub: '✓ On Track (Target: ₹3.0M)',
          topSellingItem: 'Organic NPK Fertilizer',
          topSellingSub: '4.2k units sold this cycle',
          farmerLeads: '482 Farmers',
          farmerLeadsSub: '+18.0% outreach response'
        });
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedDate, searchQuery]);

  const chartDataConfig = {
    current: {
      title: 'Peak Revenue: ₹48,500 (5 Aug)',
      salesPoints: "M 20,160 Q 120,120 220,100 T 420,40 T 620,30 T 820,20",
      procPoints: "M 20,180 Q 120,150 220,135 T 420,90 T 620,70 T 820,55",
      salesLabel: 'Gross Sales Revenue (₹)',
      procLabel: 'Procurement Expense (₹)',
      showOutreachMarkers: false,
      nodes: [
        { label: '1 Jul', sales: '₹12,400', proc: '₹8,200', cx: 20, cy: 160 },
        { label: '8 Jul', sales: '₹19,000', proc: '₹13,500', cx: 220, cy: 100 },
        { label: '15 Jul', sales: '₹32,500', proc: '₹21,000', cx: 420, cy: 40 },
        { label: '22 Jul', sales: '₹38,000', proc: '₹24,500', cx: 620, cy: 30 },
        { label: '5 Aug', sales: '₹48,500', proc: '₹29,000', cx: 820, cy: 20 },
      ]
    },
    previous: {
      title: 'Previous Cycle Peak: ₹41,200 (3 Jul)',
      salesPoints: "M 20,190 Q 120,160 220,140 T 420,80 T 620,65 T 820,45",
      procPoints: "M 20,205 Q 120,180 220,160 T 420,120 T 620,100 T 820,80",
      salesLabel: 'Previous Gross Sales (₹)',
      procLabel: 'Previous Procurement (₹)',
      showOutreachMarkers: false,
      nodes: [
        { label: '1 Jun', sales: '₹9,000', proc: '₹7,000', cx: 20, cy: 190 },
        { label: '8 Jun', sales: '₹15,000', proc: '₹11,000', cx: 220, cy: 140 },
        { label: '15 Jun', sales: '₹26,000', proc: '₹18,000', cx: 420, cy: 80 },
        { label: '22 Jun', sales: '₹31,000', proc: '₹21,000', cx: 620, cy: 65 },
        { label: '3 Jul', sales: '₹41,200', proc: '₹26,000', cx: 820, cy: 45 },
      ]
    },
    outreach: {
      title: 'Outreach Impact Correlation: 482 New Leads',
      salesPoints: "M 20,160 Q 120,120 220,100 T 420,40 T 620,30 T 820,20",
      procPoints: "M 20,180 Q 120,150 220,135 T 420,90 T 620,70 T 820,55",
      salesLabel: 'Gross Sales Revenue (₹)',
      procLabel: 'Procurement Expense (₹)',
      showOutreachMarkers: true,
      nodes: [
        { label: '1 Jul (Monsoon Camp)', sales: '₹12,400', proc: '₹8,200', cx: 20, cy: 160 },
        { label: '8 Jul', sales: '₹19,000', proc: '₹13,500', cx: 220, cy: 100 },
        { label: '15 Jul (Panchayat Drive)', sales: '₹32,500', proc: '₹21,000', cx: 420, cy: 40 },
        { label: '22 Jul', sales: '₹38,000', proc: '₹24,500', cx: 620, cy: 30 },
        { label: '5 Aug (Current)', sales: '₹48,500', proc: '₹29,000', cx: 820, cy: 20 },
      ]
    }
  };

  const currentConfig = chartDataConfig[chartMode];

  const getKpiCardStyle = (cardKey) => ({
    backgroundColor: '#ffffff',
    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.72)), url("https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '24px',
    borderRadius: '20px',
    boxShadow: hoveredCard === cardKey ? '0 16px 30px -6px rgba(30, 51, 22, 0.15)' : '0 4px 6px -1px rgba(0,0,0,0.03)',
    border: hoveredCard === cardKey ? '1px solid #1E3316' : '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'visible',
    transform: hoveredCard === cardKey ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    cursor: 'pointer',
    zIndex: 1
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', animation: 'fadeIn 0.5s ease-in-out', backgroundColor: '#F8FAF6', minHeight: '100%', paddingBottom: '32px', overflow: 'visible' }}>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(30, 51, 22, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(30, 51, 22, 0); }
          100% { box-shadow: 0 0 0 0 rgba(30, 51, 22, 0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>

      {loading && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 className="animate-spin" style={{ color: '#1E3316' }} size={32} />
        </div>
      )}

      {/* Executive Overview Banner */}
      <section className="animate-fade-in" style={{ backgroundColor: '#ffffff', padding: '24px 28px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#EAEFE6', color: '#1E3316', fontSize: '11px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a', animation: 'pulseGlow 2s infinite' }}></span>
              Live Hub • {selectedDate || '5 Aug 2026'}
            </span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', marginTop: '10px', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            RuralMart Operations & Executive Overview
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            Real-time synchronization across all regional outlets, stock movements, and outreach conversions.
          </p>
        </div>

        {/* Multi-Format Export Dropdown Button */}
        <div>
          <button 
            ref={exportButtonRef}
            onClick={handleToggleExport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1', padding: '11px 20px', borderRadius: '12px', color: '#334155', backgroundColor: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#1E3316'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
          >
            <Download size={16} style={{ color: '#1E3316' }} /> Export Report <ChevronDown size={14} />
          </button>
        </div>
      </section>

      {/* Globally Fixed Export Menu to Prevent Hiding */}
      {showExportMenu && (
        <div 
          ref={exportMenuRef}
          className="animate-fade-in" 
          style={{ 
            position: 'fixed', 
            top: `${menuPosition.top}px`, 
            right: `${menuPosition.right}px`, 
            width: '210px', 
            backgroundColor: '#fff', 
            borderRadius: '14px', 
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)', 
            border: '1px solid #e2e8f0', 
            padding: '8px', 
            zIndex: 9999999 
          }}
        >
          <button 
            onClick={() => { alert('Exporting Operational CSV...'); setShowExportMenu(false); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAF6'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FileSpreadsheet size={16} style={{ color: '#16a34a' }} /> CSV Spreadsheet
          </button>
          <button 
            onClick={() => { alert('Exporting Excel .xlsx report...'); setShowExportMenu(false); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAF6'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FileSpreadsheet size={16} style={{ color: '#2563eb' }} /> Excel (.xlsx)
          </button>
          <button 
            onClick={() => { alert('Generating Official PDF Report...'); setShowExportMenu(false); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAF6'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FileText size={16} style={{ color: '#dc2626' }} /> Official PDF Report
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <section className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
        
        <div style={getKpiCardStyle('sales')} onMouseEnter={() => setHoveredCard('sales')} onMouseLeave={() => setHoveredCard(null)}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', margin: '0 0 6px 0', letterSpacing: '0.05em' }}>SALES GROWTH</p>
            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>{dashboardMetrics.salesGrowth}</h3>
            <p style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', margin: 0 }}>↗ {dashboardMetrics.salesGrowthSub}</p>
          </div>
          <div style={{ backgroundColor: '#1E3316', color: '#ffffff', padding: '12px', borderRadius: '14px', height: 'fit-content', zIndex: 1, boxShadow: '0 4px 12px rgba(30,51,22,0.2)' }}><TrendingUp size={18} /></div>
        </div>

        <div style={getKpiCardStyle('profit')} onMouseEnter={() => setHoveredCard('profit')} onMouseLeave={() => setHoveredCard(null)}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', margin: '0 0 6px 0', letterSpacing: '0.05em' }}>NET PROFIT (₹)</p>
            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>{dashboardMetrics.netProfitRupees}</h3>
            <p style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', margin: 0 }}>{dashboardMetrics.netProfitSub}</p>
          </div>
          <div style={{ backgroundColor: '#EAEFE6', color: '#1E3316', padding: '12px', borderRadius: '14px', height: 'fit-content', zIndex: 1 }}><IndianRupee size={18} /></div>
        </div>

        <div style={getKpiCardStyle('topItem')} onMouseEnter={() => setHoveredCard('topItem')} onMouseLeave={() => setHoveredCard(null)}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', margin: '0 0 6px 0', letterSpacing: '0.05em' }}>TOP SELLING ITEM</p>
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{dashboardMetrics.topSellingItem}</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{dashboardMetrics.topSellingSub}</p>
          </div>
          <div style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '12px', borderRadius: '14px', height: 'fit-content', zIndex: 1, boxShadow: '0 4px 12px rgba(30,41,59,0.2)' }}><Package size={18} /></div>
        </div>

        <div style={getKpiCardStyle('leads')} onMouseEnter={() => setHoveredCard('leads')} onMouseLeave={() => setHoveredCard(null)}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', margin: '0 0 6px 0', letterSpacing: '0.05em' }}>NEW FARMER LEADS</p>
            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>{dashboardMetrics.farmerLeads}</h3>
            <p style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', margin: 0 }}>↗ {dashboardMetrics.farmerLeadsSub}</p>
          </div>
          <div style={{ backgroundColor: '#EAEFE6', color: '#1E3316', padding: '12px', borderRadius: '14px', height: 'fit-content', zIndex: 1 }}><Users size={18} /></div>
        </div>

      </section>

      {/* Interactive Dynamic Performance Chart */}
      <section className="animate-fade-in" style={{ backgroundColor: '#ffffff', padding: '24px 28px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontWeight: '900', fontSize: '16px', color: '#1e293b', margin: 0, letterSpacing: '-0.01em' }}>Weekly Performance & Demand Trends</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Hover over chart nodes to inspect exact period analytics</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F8FAF6', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}>
            <button 
              onClick={() => { setChartMode('current'); setActiveDataPoint(null); }}
              style={{ padding: '8px 14px', borderRadius: '9px', border: 'none', cursor: 'pointer', backgroundColor: chartMode === 'current' ? '#1E3316' : 'transparent', color: chartMode === 'current' ? '#fff' : '#475569', transition: 'all 0.2s ease', boxShadow: chartMode === 'current' ? '0 2px 6px rgba(30,51,22,0.2)' : 'none' }}
            >
              Current Period
            </button>
            <button 
              onClick={() => { setChartMode('previous'); setActiveDataPoint(null); }}
              style={{ padding: '8px 14px', borderRadius: '9px', border: 'none', cursor: 'pointer', backgroundColor: chartMode === 'previous' ? '#1E3316' : 'transparent', color: chartMode === 'previous' ? '#fff' : '#475569', transition: 'all 0.2s ease', boxShadow: chartMode === 'previous' ? '0 2px 6px rgba(30,51,22,0.2)' : 'none' }}
            >
              Previous Period
            </button>
            <button 
              onClick={() => { setChartMode('outreach'); setActiveDataPoint(null); }}
              style={{ padding: '8px 14px', borderRadius: '9px', border: 'none', cursor: 'pointer', backgroundColor: chartMode === 'outreach' ? '#1E3316' : 'transparent', color: chartMode === 'outreach' ? '#fff' : '#475569', transition: 'all 0.2s ease', boxShadow: chartMode === 'outreach' ? '0 2px 6px rgba(30,51,22,0.2)' : 'none' }}
            >
              Outreach Overlay
            </button>
          </div>
        </div>

        <div style={{ height: '260px', width: '100%', backgroundColor: '#F8FAF6', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {activeDataPoint && (
            <div className="animate-fade-in" style={{ position: 'absolute', top: '12px', right: '16px', backgroundColor: '#1E3316', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', zIndex: 10, boxShadow: '0 6px 16px rgba(30,51,22,0.25)' }}>
              📅 {activeDataPoint.label} | Sales: <span style={{ color: '#8DAA70' }}>{activeDataPoint.sales}</span> | Proc: <span style={{ color: '#cbd5e1' }}>{activeDataPoint.proc}</span>
            </div>
          )}

          <div style={{ position: 'absolute', left: '48px', right: '16px', top: '16px', bottom: '32px' }}>
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 840 220" preserveAspectRatio="none">
              <line x1="0" y1="40" x2="840" y2="40" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="90" x2="840" y2="90" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="140" x2="840" y2="140" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="190" x2="840" y2="190" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="0" y1="10" x2="0" y2="190" stroke="#cbd5e1" strokeWidth="1.5" />

              <path d={currentConfig.salesPoints} fill="none" stroke="#1E3316" strokeWidth="3.5" strokeLinecap="round" />
              <path d={currentConfig.procPoints} fill="none" stroke="#8DAA70" strokeWidth="3" strokeDasharray="6" strokeLinecap="round" />

              {currentConfig.nodes.map((node, index) => {
                const isHovered = activeDataPoint?.label === node.label;
                return (
                  <g key={index} style={{ cursor: 'pointer' }} onMouseEnter={() => setActiveDataPoint(node)}>
                    <circle 
                      cx={node.cx} 
                      cy={node.cy} 
                      r={isHovered ? "10" : "7"} 
                      fill={isHovered ? "#8DAA70" : "#1E3316"} 
                      stroke="#ffffff" 
                      strokeWidth="2.5" 
                      style={{ transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }} 
                    />
                  </g>
                );
              })}

              {currentConfig.showOutreachMarkers && (
                <>
                  <circle cx="220" cy="100" r="6" fill="#D97706" />
                  <text x="220" y="85" fill="#B45309" fontSize="10" fontWeight="bold" textAnchor="middle">Monsoon Camp</text>
                  <circle cx="520" cy="50" r="6" fill="#D97706" />
                  <text x="520" y="35" fill="#B45309" fontSize="10" fontWeight="bold" textAnchor="middle">Panchayat Drive</text>
                </>
              )}
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', paddingBottom: '24px', pointerEvents: 'none', width: '36px' }}>
            <span>₹50k</span>
            <span>₹35k</span>
            <span>₹20k</span>
            <span>₹5k</span>
            <span>₹0</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#64748b', paddingLeft: '48px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <span>1 Jul</span>
            <span>8 Jul</span>
            <span>15 Jul</span>
            <span>22 Jul</span>
            <span>29 Jul</span>
            <span>5 Aug</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <div style={{ display: 'flex', gap: '24px', fontWeight: 'bold', color: '#475569' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1E3316', display: 'inline-block' }}></span> 
              {currentConfig.salesLabel}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8DAA70', display: 'inline-block' }}></span> 
              {currentConfig.procLabel}
            </span>
          </div>
          <span style={{ fontWeight: '800', color: '#1E3316', backgroundColor: '#EAEFE6', padding: '6px 12px', borderRadius: '8px' }}>
            {activeDataPoint ? `Hovered: ${activeDataPoint.label}` : currentConfig.title}
          </span>
        </div>
      </section>

      {/* Quick Action Interactive Cards */}
      <section className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '20px' }}>
        <div 
          onClick={() => setActiveModal('business')} 
          style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.25s ease' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 20px -4px rgba(30, 51, 22, 0.12)'; e.currentTarget.style.borderColor = '#1E3316'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#EAEFE6', color: '#1E3316', borderRadius: '12px' }}><Calendar size={18} /></div>
            <ArrowUpRight size={18} style={{ color: '#94a3b8' }} />
          </div>
          <h4 style={{ fontWeight: '900', color: '#1e293b', fontSize: '15px', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>Daily Business Entry</h4>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.4' }}>Record sales value, stock counts, bills, and farmer purchase lookup.</p>
        </div>

        <div 
          onClick={() => setActiveModal('product')} 
          style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.25s ease' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 20px -4px rgba(30, 51, 22, 0.12)'; e.currentTarget.style.borderColor = '#1E3316'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#EAEFE6', color: '#1E3316', borderRadius: '12px' }}><Package size={18} /></div>
            <ArrowUpRight size={18} style={{ color: '#94a3b8' }} />
          </div>
          <h4 style={{ fontWeight: '900', color: '#1e293b', fontSize: '15px', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>Manage Products & Inventory</h4>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.4' }}>Add new agricultural items, update stock levels, and review category breakdowns.</p>
        </div>

        <div 
          onClick={() => setActiveModal('outreach')} 
          style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.25s ease' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 20px -4px rgba(30, 51, 22, 0.12)'; e.currentTarget.style.borderColor = '#1E3316'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#EAEFE6', color: '#1E3316', borderRadius: '12px' }}><Users size={18} /></div>
            <ArrowUpRight size={18} style={{ color: '#94a3b8' }} />
          </div>
          <h4 style={{ fontWeight: '900', color: '#1e293b', fontSize: '15px', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>Farmer Outreach Sessions</h4>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.4' }}>Log village training sessions, total attendees, and new lead conversions.</p>
        </div>
      </section>

      {/* Coming Soon Modal Popup */}
      {activeModal && (
        <div className="animate-fade-in" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '380px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(30,51,22,0.25)', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#EAEFE6', color: '#1E3316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={30} />
            </div>

            <div>
              <h3 style={{ fontWeight: '900', fontSize: '20px', color: '#1e293b', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Coming Soon!</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                {activeModal === 'business' && 'The Daily Business Entry module is currently under development and will be linked soon.'}
                {activeModal === 'product' && 'The Manage Products & Inventory page is currently under development and will be linked soon.'}
                {activeModal === 'outreach' && 'The Farmer Outreach Sessions module is currently under development and will be linked soon.'}
              </p>
            </div>

            <button 
              onClick={() => setActiveModal(null)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#1E3316', color: '#fff', fontWeight: 'bold', borderRadius: '14px', fontSize: '13px', border: 'none', cursor: 'pointer', marginTop: '4px', boxShadow: '0 4px 12px rgba(30,51,22,0.2)', transition: 'background-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2c4720'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1E3316'}
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}