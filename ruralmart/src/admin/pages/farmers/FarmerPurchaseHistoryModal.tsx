import React, { useEffect, useMemo } from 'react';
import {
  X,
  User,
  MapPin,
  Building2,
  Phone,
  Calendar,
  ShoppingBag,
  CheckCircle2,
  Receipt,
  Package,
  CreditCard,
  Hash,
} from 'lucide-react';
import { FarmerRecord } from '../../../shared/types';
import { getSalesByRuralMart } from '../../../shared/dataServices';

interface FarmerPurchaseHistoryModalProps {
  farmer: FarmerRecord | null;
  onClose: () => void;
}

export const FarmerPurchaseHistoryModal: React.FC<FarmerPurchaseHistoryModalProps> = ({ farmer, onClose }) => {
  // Lock body scroll and compensate scrollbar width so background does not jump or shift
  useEffect(() => {
    if (farmer) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [farmer]);

  // Fetch farmer's actual transaction bills from sales records
  const farmerSales = useMemo(() => {
    if (!farmer) return [];
    const allSales = getSalesByRuralMart(farmer.ruralMart || 'RM-001');
    return allSales.filter(
      (s) =>
        s.farmerId === farmer.id ||
        (s.customerName && s.customerName.toLowerCase() === farmer.name.toLowerCase()) ||
        (s.farmerName && s.farmerName.toLowerCase() === farmer.name.toLowerCase())
    );
  }, [farmer]);

  // Compute Customer Summary metrics
  const customerSummary = useMemo(() => {
    if (!farmer) {
      return { totalVisits: 0, totalBills: 0, totalQty: 0, totalSpent: 0, lastVisit: '—' };
    }

    let totalQty = 0;
    let totalSpent = farmerSales.reduce((sum, s) => sum + (s.amount || 0), 0);
    let totalBills = farmerSales.length;

    farmerSales.forEach((s) => {
      if (s.lineItems) {
        s.lineItems.forEach((item) => {
          totalQty += item.quantity || 0;
        });
      }
    });

    // Fallback to farmer record baseline if sales array is empty
    if (totalSpent === 0 && farmer.totalPurchasesVal) {
      totalSpent = farmer.totalPurchasesVal;
    }
    if (totalBills === 0 && farmer.itemsPurchased && farmer.itemsPurchased !== 'None') {
      totalBills = 1;
    }

    const lastVisit = farmerSales.length > 0 ? farmerSales[0].date : farmer.lastVisit || farmer.purchaseDate || '—';

    return {
      totalVisits: Math.max(totalBills, 1),
      totalBills,
      totalQty,
      totalSpent,
      lastVisit,
    };
  }, [farmer, farmerSales]);

  // Split fallback items string into individual line items if no formal bills exist
  const rawItems = useMemo(() => {
    if (!farmer) return [];
    if (!farmer.itemsPurchased || farmer.itemsPurchased.trim() === '' || farmer.itemsPurchased === 'None') return [];
    return farmer.itemsPurchased.split(',');
  }, [farmer]);

  const invoiceNo = useMemo(() => {
    if (!farmer) return '—';
    return `INV-${farmer.id.replace('FMR-', '')}`;
  }, [farmer]);

  if (!farmer) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 dark:bg-black/80 backdrop-blur-md animate-fade-in cursor-default"
      style={{ touchAction: 'none' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col text-[#17221D] dark:text-[#E6ECE8] max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-[#DDE6E0] dark:border-[#1E3129] flex items-center justify-between bg-white dark:bg-[#121E19] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#103A2B] dark:text-[#A3E6C5]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-[#17221D] dark:text-[#E6ECE8]">
                  Customer Profile &amp; Purchase History
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F2EC] text-[#103A2B] dark:bg-[#1B3D30] dark:text-[#A3E6C5] border border-[#174F3A]/20">
                  {farmer.id}
                </span>
              </div>
              <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                Verified Mart Customer Summary &amp; Bill Breakdown
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A958F] hover:text-[#17221D] dark:hover:text-[#E6ECE8] hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto">
          {/* Section 1: Customer Information */}
          <div className="p-4 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#103A2B] dark:text-[#A3E6C5] border-b border-[#DDE6E0] dark:border-[#1E3129] pb-1.5">
              1. Customer Information
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold flex items-center gap-1">
                  <User className="w-3 h-3 text-[#174F3A] dark:text-[#A3E6C5]" /> Customer Name
                </span>
                <p className="font-bold text-xs text-[#17221D] dark:text-[#E6ECE8] mt-0.5">
                  {farmer.name}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#174F3A] dark:text-[#A3E6C5]" /> Rural Mart
                </span>
                <p className="font-bold text-xs text-[#103A2B] dark:text-[#A3E6C5] mt-0.5">
                  {farmer.ruralMart}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#174F3A] dark:text-[#A3E6C5]" /> Village
                </span>
                <p className="font-bold text-xs text-[#17221D] dark:text-[#E6ECE8] mt-0.5">
                  {farmer.village}, {farmer.district}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#174F3A] dark:text-[#A3E6C5]" /> Phone
                </span>
                <p className="font-bold text-xs text-[#17221D] dark:text-[#E6ECE8] mt-0.5">
                  {farmer.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Customer Summary Cards */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#66736C] dark:text-[#8E9E96]">
              2. Customer Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] text-center">
                <span className="text-[9px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">Total Visits</span>
                <span className="text-sm font-extrabold text-[#17221D] dark:text-[#E6ECE8]">{customerSummary.totalVisits}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] text-center">
                <span className="text-[9px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">Total Bills</span>
                <span className="text-sm font-extrabold text-[#17221D] dark:text-[#E6ECE8]">{customerSummary.totalBills}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] text-center">
                <span className="text-[9px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">Qty Purchased</span>
                <span className="text-sm font-extrabold text-[#17221D] dark:text-[#E6ECE8]">{customerSummary.totalQty > 0 ? `${customerSummary.totalQty} Units` : '—'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#E7F2EC] dark:bg-[#1B3D30] border border-[#A3E6C5]/30 text-center col-span-2 sm:col-span-1">
                <span className="text-[9px] font-bold text-[#174F3A] dark:text-[#A3E6C5] uppercase block">Total Spent</span>
                <span className="text-sm font-black text-[#174F3A] dark:text-[#A3E6C5]">₹{customerSummary.totalSpent.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] text-center col-span-2 sm:col-span-1">
                <span className="text-[9px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase block">Last Visit Date</span>
                <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">{customerSummary.lastVisit}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Purchase History Table */}
          <div className="p-4 rounded-xl border border-[#174F3A]/30 dark:border-[#A3E6C5]/30 bg-[#E7F2EC]/40 dark:bg-[#1B3D30]/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#174F3A]/20 dark:border-[#A3E6C5]/20">
              <span className="text-[11px] font-extrabold text-[#103A2B] dark:text-[#A3E6C5] uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4" /> 3. Itemized Purchase History Table
              </span>
              <span className="text-[10px] font-mono font-bold text-[#66736C] dark:text-[#8E9E96] flex items-center gap-1">
                <Hash className="w-3 h-3" /> {invoiceNo}
              </span>
            </div>

            {farmerSales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-[#174F3A]/20 font-bold text-[#103A2B] dark:text-[#A3E6C5] uppercase text-[9px] bg-white/60 dark:bg-[#121E19]/60">
                      <th className="p-2">Date</th>
                      <th className="p-2">Bill / Txn ID</th>
                      <th className="p-2">Product</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Unit Price</th>
                      <th className="p-2 text-right">Line Total</th>
                      <th className="p-2 text-right">Bill Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#174F3A]/10">
                    {farmerSales.map((sale) => (
                      <React.Fragment key={sale.id}>
                        {sale.lineItems && sale.lineItems.length > 0 ? (
                          sale.lineItems.map((item, i) => (
                            <tr key={`${sale.id}-${i}`} className="hover:bg-white/50 dark:hover:bg-[#121E19]/50">
                              <td className="p-2 font-medium">{i === 0 ? sale.date : ''}</td>
                              <td className="p-2 font-bold font-mono text-[#103A2B] dark:text-[#A3E6C5]">
                                {i === 0 ? sale.billNumber || sale.id : ''}
                              </td>
                              <td className="p-2 font-bold text-[#17221D] dark:text-[#E6ECE8]">{item.productName}</td>
                              <td className="p-2 text-center font-semibold">{item.quantity} {item.unit}</td>
                              <td className="p-2 text-right">₹{item.unitPrice}</td>
                              <td className="p-2 text-right font-bold">₹{item.lineTotal.toLocaleString('en-IN')}</td>
                              <td className="p-2 text-right font-extrabold text-[#174F3A] dark:text-[#A3E6C5]">
                                {i === 0 ? `₹${sale.amount.toLocaleString('en-IN')}` : ''}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="hover:bg-white/50">
                            <td className="p-2 font-medium">{sale.date}</td>
                            <td className="p-2 font-bold font-mono">{sale.billNumber || sale.id}</td>
                            <td className="p-2 font-bold">{sale.productName || 'Counter Sale Item'}</td>
                            <td className="p-2 text-center font-semibold">{sale.salesQty || 1}</td>
                            <td className="p-2 text-right">₹{sale.amount}</td>
                            <td className="p-2 text-right font-bold">₹{sale.amount.toLocaleString('en-IN')}</td>
                            <td className="p-2 text-right font-extrabold text-[#174F3A] dark:text-[#A3E6C5]">
                              ₹{sale.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Fallback list if no detailed sales records exist yet */
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-[#66736C] dark:text-[#8E9E96] uppercase">
                  Purchased Products Record:
                </span>
                <div className="space-y-1.5">
                  {rawItems.length === 0 ? (
                    <div className="p-3 text-center text-xs text-[#66736C] dark:text-[#8E9E96] italic bg-white/50 dark:bg-[#121E19]/50 rounded-lg border border-[#174F3A]/10">
                      No purchase history records found for this customer.
                    </div>
                  ) : (
                    rawItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-[#121E19]/80 border border-[#174F3A]/15 dark:border-[#A3E6C5]/15 text-xs font-bold"
                      >
                        <span className="flex items-center gap-2 text-[#17221D] dark:text-[#E6ECE8]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#174F3A] dark:bg-[#A3E6C5]" />
                          {item.trim()}
                        </span>
                        <span className="text-[10px] text-[#103A2B] dark:text-[#A3E6C5] font-extrabold bg-[#E7F2EC] dark:bg-[#1B3D30] px-2 py-0.5 rounded">
                          Verified Sale
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Total Footer */}
            <div className="pt-2 border-t border-[#174F3A]/20 dark:border-[#A3E6C5]/20 flex justify-between items-center">
              <span className="text-xs text-[#103A2B] dark:text-[#A3E6C5] font-extrabold">Total Amount Spent:</span>
              <span className="font-black text-base text-[#174F3A] dark:text-[#A3E6C5]">
                ₹{customerSummary.totalSpent.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#121E19] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#66736C] dark:text-[#8E9E96] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#A3E6C5]" /> Verified Billing System
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#174F3A] hover:bg-[#103A2B] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

