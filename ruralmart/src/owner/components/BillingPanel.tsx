import React, { useState, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Search,
  UserCheck,
  UserPlus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Receipt,
  ShoppingBag,
} from 'lucide-react';
import {
  getFarmersByRuralMart,
  saveFarmer,
  updateFarmer,
  getProductsByRuralMart,
  recordCustomerBill,
  BillLineItem,
} from '../../shared/dataServices';
import { CanonicalProduct, CanonicalFarmer } from '../../shared/types/storage';

// This panel is the SINGLE reusable "Farmer Purchase & Bill Entry" billing experience.
// It is rendered on Page 2 (Daily Business) and inside the Page 1 (Overall Dashboard)
// "Daily Sale" Quick Action modal — both consumers get the exact same UI, state, and
// business logic (customer search/select/register, product selection, bill draft,
// bill generation, stock deduction) with no duplicated implementation.

export interface BillingPanelHandle {
  /** Attach an existing registered farmer/customer to the bill (used by an external Registered Customers panel). */
  attachFarmer: (farmer: CanonicalFarmer) => void;
  /** Attach a farmer AND open the inline edit form for them (used by an external "Edit" action). */
  editFarmer: (farmer: CanonicalFarmer) => void;
  /** If the currently attached customer matches this id/farmerCode, detach it (used after an external delete). */
  clearIfMatches: (farmerId: string, farmerCode?: string) => void;
}

interface BillingPanelProps {
  ruralMartId: string;
  theme: 'light' | 'dark';
  /** Bump this from the parent to force the panel to re-read farmers/products (e.g. after an external delete/edit). */
  refreshKey: number;
  /** Called after a bill is generated, a customer is edited, or a new customer is registered — parent should refresh its own data. */
  onDataChanged?: () => void;
  /** Called whenever the attached customer changes, so a parent-side directory can mirror the "Attached" state. */
  onMatchedFarmerChange?: (farmer: any | null) => void;
  /** Called after a bill is successfully generated — useful for a hosting modal (e.g. Page 1 Quick Action) to toast/close. */
  onSaleGenerated?: (info: { billNumber: string; amount: number; customerName: string }) => void;
}

export const BillingPanel = forwardRef<BillingPanelHandle, BillingPanelProps>(
  ({ ruralMartId, refreshKey, onDataChanged, onMatchedFarmerChange, onSaleGenerated }, ref) => {
    // Internal refresh counter for mutations performed inside this panel itself
    // (bill generated, customer edited/registered) so its own data re-reads immediately.
    const [localRefresh, setLocalRefresh] = useState<number>(0);
    const bumpLocal = () => setLocalRefresh((k) => k + 1);

    const catalogProducts = useMemo(() => {
      return getProductsByRuralMart(ruralMartId);
    }, [ruralMartId, refreshKey, localRefresh]);

    // --- FARMER LOOKUP & CUSTOMER STATE ---
    const [farmerTab, setFarmerTab] = useState<'existing' | 'new'>('existing');
    const [farmerSearchInput, setFarmerSearchInput] = useState<string>('');

    const [matchedFarmer, setMatchedFarmer] = useState<any | null>(null);
    const [isEditingFarmer, setIsEditingFarmer] = useState<boolean>(false);
    const [editCattleCount, setEditCattleCount] = useState<string>('0');
    const [editFarmerName, setEditFarmerName] = useState<string>('');
    const [editFarmerVillage, setEditFarmerVillage] = useState<string>('');
    const [farmerUpdateMsg, setFarmerUpdateMsg] = useState<string>('');

    // All registered farmers for customer selection/search
    const allRegisteredFarmers = useMemo(() => {
      return getFarmersByRuralMart(ruralMartId);
    }, [ruralMartId, refreshKey, localRefresh, matchedFarmer]);

    // Live search results (Google-like autocomplete) — filters by name, mobile, Farmer ID, farmerCode
    const liveSearchResults = useMemo(() => {
      const term = farmerSearchInput.trim().toLowerCase();
      if (!term) return [];
      const normalizedTerm = term.replace(/\s+/g, '');
      return allRegisteredFarmers.filter((f) => {
        const name = (f.name || '').toLowerCase();
        const farmerCode = (f.farmerCode || '').toLowerCase();
        const id = (f.id || '').toLowerCase();
        const phone = (f.phone || '').toLowerCase().replace(/\s+/g, '');
        return (
          name.includes(term) ||
          farmerCode.includes(term) ||
          id.includes(term) ||
          phone.includes(normalizedTerm)
        );
      });
    }, [farmerSearchInput, allRegisteredFarmers]);

    // Notify parent whenever the attached customer changes
    useEffect(() => {
      onMatchedFarmerChange?.(matchedFarmer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchedFarmer]);

    // New Customer Form State
    const [newName, setNewName] = useState<string>('');
    const [newMobile, setNewMobile] = useState<string>('');
    const [newVillage, setNewVillage] = useState<string>('');
    const [newGramPanchayat, setNewGramPanchayat] = useState<string>('');
    const [newDistrict, setNewDistrict] = useState<string>('Erode');
    const [numCattle, setNumCattle] = useState<string>('');
    const [numOtherLivestock, setNumOtherLivestock] = useState<string>('');
    const [newCustomerErrors, setNewCustomerErrors] = useState<Record<string, string>>({});

    // Auto-generated registration date string (e.g., "12 Aug 2026")
    const currentFormattedDate = useMemo(() => {
      const d = new Date();
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }, []);

    // Calculated Total Animal Population
    const calculatedTotalAnimals = useMemo(() => {
      const cattle = Number(numCattle) || 0;
      const livestock = Number(numOtherLivestock) || 0;
      return cattle + livestock;
    }, [numCattle, numOtherLivestock]);

    // --- FARMER PURCHASE / BILL FORM DRAFT STATE ---
    const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [inputQuantity, setInputQuantity] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI / Online' | 'Credit / Due'>('Cash');

    const [billDraftItems, setBillDraftItems] = useState<BillLineItem[]>([]);
    const [billError, setBillError] = useState<string>('');
    const [billSuccessMsg, setBillSuccessMsg] = useState<string>('');

    // Filter products by selected category
    const filteredCatalogProducts = useMemo(() => {
      if (!selectedCategory || selectedCategory === 'All Categories') {
        return catalogProducts;
      }
      return catalogProducts.filter((p) => p.category === selectedCategory);
    }, [catalogProducts, selectedCategory]);

    // Selected Product details
    const currentSelectedProduct: CanonicalProduct | null = useMemo(() => {
      if (!selectedProductId) return null;
      return catalogProducts.find((p) => p.id === selectedProductId || p.code === selectedProductId) || null;
    }, [catalogProducts, selectedProductId]);

    // Calculated Line Total for preview
    const lineItemPreviewTotal = useMemo(() => {
      if (!currentSelectedProduct) return 0;
      const qty = Number(inputQuantity) || 0;
      return qty * currentSelectedProduct.sellingPrice;
    }, [currentSelectedProduct, inputQuantity]);

    // Calculated Bill Draft Totals
    const totalBillAmount = useMemo(() => {
      return billDraftItems.reduce((sum, item) => sum + item.lineTotal, 0);
    }, [billDraftItems]);

    const totalBillQuantity = useMemo(() => {
      return billDraftItems.reduce((sum, item) => sum + item.quantity, 0);
    }, [billDraftItems]);

    // Add Item to Bill Draft
    const handleAddItemToBill = () => {
      setBillError('');
      setBillSuccessMsg('');

      if (!currentSelectedProduct) {
        setBillError('Please select a product from the catalog.');
        return;
      }

      const qty = Number(inputQuantity);
      if (!qty || qty <= 0) {
        setBillError('Please enter a valid purchase quantity greater than 0.');
        return;
      }

      if (qty > currentSelectedProduct.stockQty) {
        setBillError(
          `Insufficient stock for ${currentSelectedProduct.name}. Available: ${currentSelectedProduct.stockQty} ${currentSelectedProduct.unit || 'units'}.`
        );
        return;
      }

      const lineTotal = qty * currentSelectedProduct.sellingPrice;

      // Check if already in draft
      const existingIndex = billDraftItems.findIndex((item) => item.productId === currentSelectedProduct.id);
      if (existingIndex >= 0) {
        const updated = [...billDraftItems];
        const newQty = updated[existingIndex].quantity + qty;
        if (newQty > currentSelectedProduct.stockQty) {
          setBillError(
            `Total quantity (${newQty} ${currentSelectedProduct.unit}) exceeds available stock (${currentSelectedProduct.stockQty} ${currentSelectedProduct.unit}).`
          );
          return;
        }
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          lineTotal: newQty * currentSelectedProduct.sellingPrice,
        };
        setBillDraftItems(updated);
      } else {
        const newItem: BillLineItem = {
          productId: currentSelectedProduct.id,
          productName: currentSelectedProduct.name,
          category: currentSelectedProduct.category,
          quantity: qty,
          unit: currentSelectedProduct.unit || 'units',
          unitPrice: currentSelectedProduct.sellingPrice,
          lineTotal,
        };
        setBillDraftItems((prev) => [...prev, newItem]);
      }

      // Reset item inputs
      setSelectedProductId('');
      setInputQuantity('');
    };

    // Remove Item from Bill Draft
    const handleRemoveDraftItem = (index: number) => {
      setBillDraftItems((prev) => prev.filter((_, i) => i !== index));
    };

    // Generate Customer Bill & Complete Transaction
    const handleGenerateBill = (e: React.FormEvent) => {
      e.preventDefault();
      setBillError('');
      setBillSuccessMsg('');

      if (!matchedFarmer) {
        setBillError('Customer selection is required. Every bill must be attached to a registered customer. Please select or register a customer first.');
        return;
      }

      if (billDraftItems.length === 0) {
        setBillError('Please add at least one product to the bill before completing transaction.');
        return;
      }

      const result = recordCustomerBill(ruralMartId, {
        farmerId: matchedFarmer.id,
        farmerName: matchedFarmer.name,
        paymentMethod,
        lineItems: billDraftItems,
      });

      if (!result.success) {
        setBillError(result.errorMessage || 'Failed to complete bill transaction.');
        return;
      }

      const billAmount = totalBillAmount;
      const billNumber = result.billNumber || '';
      const customerName = matchedFarmer.name;

      // Success!
      setBillSuccessMsg(
        `Customer Bill #${billNumber} successfully generated for ${customerName} (₹${billAmount.toLocaleString('en-IN')})! Stock deducted.`
      );

      // Reset bill draft form
      setBillDraftItems([]);
      setSelectedProductId('');
      setInputQuantity('');

      // Trigger refresh for this panel's own data + notify hosting page
      bumpLocal();
      onDataChanged?.();
      onSaleGenerated?.({ billNumber, amount: billAmount, customerName });

      setTimeout(() => {
        setBillSuccessMsg('');
      }, 5000);
    };

    // Clear Bill Draft
    const handleClearBillDraft = () => {
      setBillDraftItems([]);
      setSelectedProductId('');
      setInputQuantity('');
      setBillError('');
      setBillSuccessMsg('');
    };

    // ----------------------------------------------------
    // FARMER LOOKUP HANDLERS
    // ----------------------------------------------------
    const attachFarmerToBill = (f: CanonicalFarmer) => {
      setMatchedFarmer({
        ...f,
        tempId: f.farmerCode || f.id,
        lastPurchase: f.lastVisit || 'Today',
        totalVisits: f.totalPurchases || 1,
      });
      setEditCattleCount(String(f.animalHeadCount || 0));
      setEditFarmerName(f.name);
      setEditFarmerVillage(f.village);
    };

    const handleSelectSearchResult = (f: CanonicalFarmer) => {
      attachFarmerToBill(f);
      setFarmerSearchInput('');
    };

    const clearIfMatches = (farmerId: string, farmerCode?: string) => {
      if (matchedFarmer && (matchedFarmer.id === farmerId || (farmerCode && matchedFarmer.farmerCode === farmerCode))) {
        setMatchedFarmer(null);
        setIsEditingFarmer(false);
      }
    };

    useImperativeHandle(ref, () => ({
      attachFarmer: attachFarmerToBill,
      editFarmer: (f: CanonicalFarmer) => {
        attachFarmerToBill(f);
        setIsEditingFarmer(true);
      },
      clearIfMatches,
    }));

    const handleStartEditFarmer = () => {
      if (!matchedFarmer) return;
      setIsEditingFarmer(true);
      setEditCattleCount(String(matchedFarmer.cattleCount || matchedFarmer.animalHeadCount || 0));
      setEditFarmerName(matchedFarmer.name);
      setEditFarmerVillage(matchedFarmer.village);
    };

    const handleSaveChangesFarmer = (e: React.FormEvent) => {
      e.preventDefault();
      if (!matchedFarmer) return;

      const updatedName = editFarmerName || matchedFarmer.name;
      const updatedVillage = editFarmerVillage || matchedFarmer.village;
      const updatedCount = Number(editCattleCount) || 0;

      if (matchedFarmer.id) {
        updateFarmer(matchedFarmer.id, {
          name: updatedName,
          village: updatedVillage,
          animalHeadCount: updatedCount,
        });
      }

      setMatchedFarmer((prev: any) => ({
        ...prev,
        name: updatedName,
        village: updatedVillage,
        cattleCount: updatedCount,
        animalHeadCount: updatedCount,
      }));

      setIsEditingFarmer(false);
      setFarmerUpdateMsg('Customer details updated successfully.');
      setTimeout(() => setFarmerUpdateMsg(''), 3000);

      bumpLocal();
      onDataChanged?.();
    };

    // New Customer Registration
    const handleSaveNewCustomer = (e: React.FormEvent) => {
      e.preventDefault();
      const errors: Record<string, string> = {};

      if (!newName.trim()) errors.name = 'Farmer Name is required.';

      const cleanMobile = newMobile.trim();
      if (!cleanMobile) {
        errors.mobile = 'Mobile Number is required.';
      } else if (!/^\d{10}$/.test(cleanMobile)) {
        errors.mobile = 'Enter a valid 10-digit mobile number.';
      }

      if (!newVillage.trim()) errors.village = 'Village is required.';
      if (!newGramPanchayat.trim()) errors.gramPanchayat = 'Gram Panchayat is required.';
      if (!newDistrict.trim()) errors.district = 'District is required.';

      if (Object.keys(errors).length > 0) {
        setNewCustomerErrors(errors);
        return;
      }

      const cattleCount = Number(numCattle) || 0;
      const otherLivestockCount = Number(numOtherLivestock) || 0;
      const totalAnimals = cattleCount + otherLivestockCount;

      const newFarmerId = `FMR-${1040 + Math.floor(Math.random() * 8000)}`;

      const farmerRecord: CanonicalFarmer = {
        id: newFarmerId,
        farmerCode: newFarmerId,
        ruralMartId,
        name: newName.trim(),
        phone: cleanMobile.startsWith('+91') ? cleanMobile : `+91 ${cleanMobile}`,
        village: newVillage.trim(),
        gramPanchayat: newGramPanchayat.trim(),
        district: newDistrict.trim(),
        registrationDate: currentFormattedDate,
        numCattle: cattleCount,
        numOtherLivestock: otherLivestockCount,
        totalAnimalPopulation: totalAnimals,
        animalHeadCount: totalAnimals,
        category: 'Dairy Farmer',
        lastVisit: 'Today',
        status: 'New',
        totalPurchases: 0,
        totalSpent: 0,
        totalPurchasesVal: 0,
        joinedDate: currentFormattedDate,
      };

      saveFarmer(farmerRecord);

      const createdFarmer = {
        ...farmerRecord,
        tempId: newFarmerId,
        cattleCount: cattleCount,
        lastPurchase: 'No prior purchase',
        totalVisits: 1,
      };

      setMatchedFarmer(createdFarmer);
      setEditCattleCount(String(totalAnimals));
      setEditFarmerName(createdFarmer.name);
      setEditFarmerVillage(createdFarmer.village);

      // Reset form fields
      setNewName('');
      setNewMobile('');
      setNewVillage('');
      setNewGramPanchayat('');
      setNewDistrict('Erode');
      setNumCattle('');
      setNumOtherLivestock('');
      setNewCustomerErrors({});

      setFarmerTab('existing');
      setIsEditingFarmer(false);

      setFarmerUpdateMsg(`Customer ${createdFarmer.name} registered & attached to bill.`);
      setTimeout(() => setFarmerUpdateMsg(''), 4000);

      bumpLocal();
      onDataChanged?.();
    };

    return (
      <div className="card-enterprise p-4 sm:p-5 space-y-4">
        <div className="border-b border-[#E9EFEB] dark:border-[#16241E] pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
              <span>Farmer Purchase & Bill Entry</span>
            </h2>
            <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
              Select products from catalog to generate customer bill. Stock deducts automatically.
            </p>
          </div>
        </div>

        {billSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[#143825] border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{billSuccessMsg}</span>
          </div>
        )}

        {billError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-[#381414] border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{billError}</span>
          </div>
        )}

        {/* MANDATORY UNIFIED FARMER / CUSTOMER CONTEXT & LOOKUP REGISTRATION */}
        <div className="p-4 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-3">
          <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#1F3128] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#174F3A] dark:text-[#A3E6C5] flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>Customer Selection & Lookup (Required for Bill) *</span>
            </span>
            {matchedFarmer && (
              <button
                type="button"
                onClick={() => {
                  setMatchedFarmer(null);
                  setIsEditingFarmer(false);
                  setFarmerSearchInput('');
                }}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Change / Clear Customer</span>
              </button>
            )}
          </div>

          {farmerUpdateMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-[#143825] border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{farmerUpdateMsg}</span>
            </div>
          )}

          {matchedFarmer ? (
            /* ACTIVE SELECTED CUSTOMER CARD */
            isEditingFarmer ? (
              /* EDIT ACTIVE CUSTOMER FORM */
              <form onSubmit={handleSaveChangesFarmer} className="p-3.5 rounded-xl bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] space-y-3">
                <div className="border-b border-[#E9EFEB] dark:border-[#1F3128] pb-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                    Edit Customer Details
                  </span>
                  <span className="text-[10px] font-mono text-[#8A958F]">{matchedFarmer.tempId || matchedFarmer.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#17221D] dark:text-[#E6ECE8] mb-0.5">
                      Farmer Name *
                    </label>
                    <input
                      type="text"
                      value={editFarmerName}
                      onChange={(e) => setEditFarmerName(e.target.value)}
                      className="w-full h-8 px-2.5 text-xs rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#17221D] dark:text-[#E6ECE8] mb-0.5">
                      Village *
                    </label>
                    <input
                      type="text"
                      value={editFarmerVillage}
                      onChange={(e) => setEditFarmerVillage(e.target.value)}
                      className="w-full h-8 px-2.5 text-xs rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#17221D] dark:text-[#E6ECE8] mb-0.5">
                      Cattle Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editCattleCount}
                      onChange={(e) => setEditCattleCount(e.target.value)}
                      className="w-full h-8 px-2.5 text-xs rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EFEB] dark:border-[#1F3128]">
                  <button
                    type="button"
                    onClick={() => setIsEditingFarmer(false)}
                    className="px-3 h-8 bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] text-[#66736C] dark:text-[#8E9E96] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 h-8 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3.5 bg-emerald-50/80 dark:bg-[#143825]/80 border border-emerald-300 dark:border-emerald-700 rounded-xl space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 dark:border-emerald-800/60 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-[#17221D] dark:text-[#E6ECE8]">
                        {matchedFarmer.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900 px-2 py-0.5 rounded-md">
                        {matchedFarmer.farmerCode || matchedFarmer.id || matchedFarmer.tempId}
                      </span>
                    </div>
                    <div className="text-xs text-[#66736C] dark:text-[#8E9E96] mt-0.5">
                      Village: <span className="font-semibold text-slate-800 dark:text-slate-200">{matchedFarmer.village || 'N/A'}</span> • Mobile: <span className="font-semibold text-slate-800 dark:text-slate-200">{matchedFarmer.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-700 shrink-0">
                      ✓ Attached to Bill
                    </span>
                    <button
                      type="button"
                      onClick={handleStartEditFarmer}
                      className="px-2.5 py-1 text-xs font-bold text-[#174F3A] dark:text-[#A3E6C5] hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-white/60 dark:bg-[#121E19]/60 p-2 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
                    <span className="text-[#66736C] dark:text-[#8E9E96] block text-[10px]">Panchayat & District</span>
                    <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">{matchedFarmer.gramPanchayat || matchedFarmer.village || 'N/A'}, {matchedFarmer.district || 'Erode'}</span>
                  </div>
                  <div className="bg-white/60 dark:bg-[#121E19]/60 p-2 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
                    <span className="text-[#66736C] dark:text-[#8E9E96] block text-[10px]">Cattle & Livestock</span>
                    <span className="font-bold text-[#174F3A] dark:text-[#A3E6C5]">{matchedFarmer.numCattle ?? matchedFarmer.cattleCount ?? matchedFarmer.animalHeadCount ?? 0} Cattle • {matchedFarmer.numOtherLivestock ?? 0} Other</span>
                  </div>
                  <div className="bg-white/60 dark:bg-[#121E19]/60 p-2 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
                    <span className="text-[#66736C] dark:text-[#8E9E96] block text-[10px]">Total Animal Pop.</span>
                    <span className="font-bold text-[#174F3A] dark:text-[#A3E6C5]">{matchedFarmer.totalAnimalPopulation ?? matchedFarmer.animalHeadCount ?? 0} Animals</span>
                  </div>
                  <div className="bg-white/60 dark:bg-[#121E19]/60 p-2 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
                    <span className="text-[#66736C] dark:text-[#8E9E96] block text-[10px]">Reg. Date</span>
                    <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">{matchedFarmer.registrationDate || matchedFarmer.joinedDate || 'Today'}</span>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* SEARCH, SELECT, OR REGISTER UNATTENDED STATE */
            <div className="space-y-3 pt-1">
              {/* TAB SELECTION HEADER */}
              <div className="flex bg-[#E9EFEB] dark:bg-[#121E19] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFarmerTab('existing')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    farmerTab === 'existing'
                      ? 'bg-white dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5] shadow-xs'
                      : 'text-[#66736C] dark:text-[#8E9E96] hover:text-[#17221D]'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Select Existing Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFarmerTab('new')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    farmerTab === 'new'
                      ? 'bg-white dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5] shadow-xs'
                      : 'text-[#66736C] dark:text-[#8E9E96] hover:text-[#17221D]'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Register New Customer</span>
                </button>
              </div>

              {farmerTab === 'existing' ? (
                <div className="space-y-1 bg-white dark:bg-[#121E19] p-3 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129]">
                  {/* Live Search (Google-like autocomplete) */}
                  <label className="block text-[11px] font-bold text-[#17221D] dark:text-[#E6ECE8]">
                    Search by Farmer ID, Name, or Mobile Number:
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A958F] pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search customer by name, mobile or Farmer ID..."
                      value={farmerSearchInput}
                      onChange={(e) => setFarmerSearchInput(e.target.value)}
                      className="w-full h-9 pl-8 pr-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                    />
                  </div>

                  {/* Live Search Results */}
                  {farmerSearchInput.trim() && (
                    <div className="border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-[#E9EFEB] dark:divide-[#1F3128]">
                      {liveSearchResults.length === 0 ? (
                        <div className="p-3 text-center text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                          No matching registered customer found.
                        </div>
                      ) : (
                        liveSearchResults.map((f) => (
                          <button
                            type="button"
                            key={f.id}
                            onClick={() => handleSelectSearchResult(f)}
                            className="w-full text-left p-2.5 bg-white dark:bg-[#121E19] hover:bg-[#F0F5F2] dark:hover:bg-[#16241E] transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">{f.name}</span>
                              <span className="text-[10px] font-mono font-semibold text-[#174F3A] dark:text-[#A3E6C5] bg-[#E7F2EC] dark:bg-[#1B3D30] px-1.5 py-0.5 rounded">
                                {f.farmerCode || f.id}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#66736C] dark:text-[#8E9E96] mt-0.5">
                              {f.phone} • {f.village}{f.district ? `, ${f.district}` : ''}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {allRegisteredFarmers.length === 0 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-1">
                      No registered farmers found. Switch to "+ Register New Customer" tab to register them.
                    </p>
                  )}
                </div>
              ) : (
                /* REGISTER NEW CUSTOMER FORM */
                <form onSubmit={handleSaveNewCustomer} className="space-y-3 bg-white dark:bg-[#121E19] p-3.5 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129]">
                  {/* Row 1: Farmer Name & Mobile Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                        Farmer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        value={newName}
                        onChange={(e) => {
                          setNewName(e.target.value);
                          if (newCustomerErrors.name) setNewCustomerErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        className={`w-full h-8 px-2.5 text-xs rounded-lg border bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] ${
                          newCustomerErrors.name ? 'border-red-500' : 'border-[#DDE6E0] dark:border-[#1E3129]'
                        }`}
                      />
                      {newCustomerErrors.name && (
                        <p className="text-[10px] text-red-500 font-medium">{newCustomerErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="e.g. 9876543210"
                        value={newMobile}
                        onChange={(e) => {
                          setNewMobile(e.target.value);
                          if (newCustomerErrors.mobile) setNewCustomerErrors((prev) => ({ ...prev, mobile: '' }));
                        }}
                        className={`w-full h-8 px-2.5 text-xs rounded-lg border bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] ${
                          newCustomerErrors.mobile ? 'border-red-500' : 'border-[#DDE6E0] dark:border-[#1E3129]'
                        }`}
                      />
                      {newCustomerErrors.mobile && (
                        <p className="text-[10px] text-red-500 font-medium">{newCustomerErrors.mobile}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Village, Gram Panchayat, District */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                        Village <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Athani"
                        value={newVillage}
                        onChange={(e) => {
                          setNewVillage(e.target.value);
                          if (newCustomerErrors.village) setNewCustomerErrors((prev) => ({ ...prev, village: '' }));
                        }}
                        className={`w-full h-8 px-2.5 text-xs rounded-lg border bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] ${
                          newCustomerErrors.village ? 'border-red-500' : 'border-[#DDE6E0] dark:border-[#1E3129]'
                        }`}
                      />
                      {newCustomerErrors.village && (
                        <p className="text-[10px] text-red-500 font-medium">{newCustomerErrors.village}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                        Gram Panchayat <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Athani GP"
                        value={newGramPanchayat}
                        onChange={(e) => {
                          setNewGramPanchayat(e.target.value);
                          if (newCustomerErrors.gramPanchayat) setNewCustomerErrors((prev) => ({ ...prev, gramPanchayat: '' }));
                        }}
                        className={`w-full h-8 px-2.5 text-xs rounded-lg border bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] ${
                          newCustomerErrors.gramPanchayat ? 'border-red-500' : 'border-[#DDE6E0] dark:border-[#1E3129]'
                        }`}
                      />
                      {newCustomerErrors.gramPanchayat && (
                        <p className="text-[10px] text-red-500 font-medium">{newCustomerErrors.gramPanchayat}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                        District <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Erode"
                        value={newDistrict}
                        onChange={(e) => {
                          setNewDistrict(e.target.value);
                          if (newCustomerErrors.district) setNewCustomerErrors((prev) => ({ ...prev, district: '' }));
                        }}
                        className={`w-full h-8 px-2.5 text-xs rounded-lg border bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] ${
                          newCustomerErrors.district ? 'border-red-500' : 'border-[#DDE6E0] dark:border-[#1E3129]'
                        }`}
                      />
                      {newCustomerErrors.district && (
                        <p className="text-[10px] text-red-500 font-medium">{newCustomerErrors.district}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Registration Date (Auto-generated), Number of Cattle (Optional), Number of Other Livestock (Optional) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                        Registration Date <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">(Auto-generated)</span>
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={currentFormattedDate}
                        className="w-full h-8 px-2.5 text-xs font-semibold rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-slate-100 dark:bg-slate-800 text-[#17221D] dark:text-[#E6ECE8] cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                        Number of Cattle <span className="text-[10px] font-normal text-slate-500">(Optional)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 8"
                        value={numCattle}
                        onChange={(e) => setNumCattle(e.target.value)}
                        className="w-full h-8 px-2.5 text-xs rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                        Number of Other Livestock <span className="text-[10px] font-normal text-slate-500">(Optional)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 4"
                        value={numOtherLivestock}
                        onChange={(e) => setNumOtherLivestock(e.target.value)}
                        className="w-full h-8 px-2.5 text-xs rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                      />
                    </div>
                  </div>

                  {/* Calculated Field: Total Animal Population */}
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-[#143825]/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#174F3A] dark:text-[#A3E6C5] block">
                        Total Animal Population <span className="text-[10px] font-normal text-emerald-700 dark:text-emerald-300">(Calculated)</span>
                      </span>
                      <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96]">
                        Cattle ({Number(numCattle) || 0}) + Other Livestock ({Number(numOtherLivestock) || 0})
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-[#174F3A] dark:text-[#A3E6C5] bg-white dark:bg-[#121E19] px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700">
                      {calculatedTotalAnimals} Animals
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-9 mt-1 bg-[#174F3A] hover:bg-[#103A2B] text-white text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register & Attach Customer to Bill</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* PRODUCT ADDITION ROW */}
        <div className="space-y-3 pt-1">

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">

            {/* Category Filter */}
            <div className="sm:col-span-4 space-y-1">
              <label className="block text-[11px] font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                Category Filter
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedProductId('');
                }}
                className="w-full h-9 px-2.5 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
              >
                <option value="All Categories">All Categories</option>
                <option value="Feed">Cattle Feed</option>
                <option value="Minerals">Minerals</option>
                <option value="Seeds">Seeds</option>
                <option value="Fertilizers">Fertilizers</option>
                <option value="Pesticides">Pesticides</option>
                <option value="Equip">Farm Tools</option>
                <option value="Groceries">Groceries</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Product Selection */}
            <div className="sm:col-span-8 space-y-1">
              <label className="block text-[11px] font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                Select Product <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-9 px-2.5 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
              >
                <option value="">Select a product from inventory catalog</option>
                {filteredCatalogProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.sellingPrice}/{p.unit || 'units'} ({p.stockQty} in stock)
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* No Products Alert */}
          {catalogProducts.length === 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-[#3D2D10] border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
              <span>No products registered in Product & Inventory catalog yet.</span>
              <span className="font-bold underline text-[11px]">Add products in Product & Inventory</span>
            </div>
          )}

          {/* Product Info & Quantity Row */}
          {currentSelectedProduct && (
            <div className="p-3 rounded-xl bg-[#E7F2EC]/60 dark:bg-[#1B3D30]/60 border border-[#A3E6C5]/40 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
              <div>
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] block">Selling Price per Unit</span>
                <span className="font-extrabold text-[#174F3A] dark:text-[#A3E6C5] text-sm">
                  ₹{currentSelectedProduct.sellingPrice} / {currentSelectedProduct.unit || 'unit'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] block">Available Stock</span>
                <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">
                  {currentSelectedProduct.stockQty} {currentSelectedProduct.unit || 'units'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#17221D] dark:text-[#E6ECE8]">
                  Quantity ({currentSelectedProduct.unit || 'units'})
                </label>
                <input
                  type="number"
                  min="1"
                  max={currentSelectedProduct.stockQty}
                  placeholder="Qty"
                  value={inputQuantity}
                  onChange={(e) => setInputQuantity(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs font-bold rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8]"
                />
              </div>
            </div>
          )}

          {/* Add Item Button */}
          {currentSelectedProduct && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                Line Total: <span className="text-[#174F3A] dark:text-[#A3E6C5]">₹{lineItemPreviewTotal.toLocaleString('en-IN')}</span>
              </span>

              <button
                type="button"
                onClick={handleAddItemToBill}
                className="h-8 px-4 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item to Bill</span>
              </button>
            </div>
          )}

        </div>

        {/* BILL DRAFT ITEMS TABLE */}
        <div className="space-y-2 pt-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
              Bill Line Items ({billDraftItems.length})
            </span>
            {billDraftItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearBillDraft}
                className="text-[11px] text-red-500 hover:underline cursor-pointer"
              >
                Clear Bill
              </button>
            )}
          </div>

          {billDraftItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#66736C] dark:text-[#8E9E96] border border-dashed border-[#DDE6E0] dark:border-[#1E3129] rounded-xl space-y-1">
              <ShoppingBag className="w-5 h-5 mx-auto text-slate-400" />
              <p className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">No items added to bill yet</p>
              <p>Select a product and quantity above to add items to this customer transaction.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAF7] dark:bg-[#16241E] border-b border-[#DDE6E0] dark:border-[#1E3129] text-[#66736C] dark:text-[#8E9E96] text-[10px] uppercase font-bold">
                    <th className="py-2 px-3">Product Name</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Selling Price</th>
                    <th className="py-2 px-3 text-right">Line Total</th>
                    <th className="py-2 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EFEB] dark:divide-[#16241E]">
                  {billDraftItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAF7] dark:hover:bg-[#16241E]">
                      <td className="py-2 px-3 font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                        {item.productName}
                        <span className="block text-[10px] text-[#66736C] dark:text-[#8E9E96] font-normal">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-[#17221D] dark:text-[#E6ECE8]">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2 px-3 text-right text-[#66736C] dark:text-[#8E9E96]">
                        ₹{item.unitPrice}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-[#174F3A] dark:text-[#A3E6C5]">
                        ₹{item.lineTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveDraftItem(idx)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded-md cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* BILL SUMMARY & GENERATE BUTTON */}
        {billDraftItems.length > 0 && (
          <form onSubmit={handleGenerateBill} className="p-3.5 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-3">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] uppercase font-bold block">
                  Transaction Mode:
                </span>
                <div className="flex gap-2">
                  {(['Cash', 'UPI / Online', 'Credit / Due'] as const).map((method) => (
                    <label key={method} className="flex items-center gap-1.5 cursor-pointer font-semibold">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="text-[#174F3A]"
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#66736C] dark:text-[#8E9E96] uppercase font-bold block">
                  Total Bill Amount (1 Customer Bill)
                </span>
                <span className="text-xl font-extrabold text-[#174F3A] dark:text-[#A3E6C5]">
                  ₹{totalBillAmount.toLocaleString('en-IN')}
                </span>
                <span className="block text-[10px] text-[#8A958F]">
                  {billDraftItems.length} items • {totalBillQuantity} total units
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E9EFEB] dark:border-[#1F3128] flex justify-end">
              <button
                type="submit"
                className="h-10 px-6 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] dark:hover:bg-[#234F3F] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Receipt className="w-4 h-4 text-[#A3E6C5]" />
                <span>Generate Bill & Deduct Stock</span>
              </button>
            </div>

          </form>
        )}
      </div>
    );
  }
);

BillingPanel.displayName = 'BillingPanel';
