import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  ShieldCheck,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Copy,
  Check,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Theme, MartRegistrationFormData } from '../../shared/types';
import {
  getApplications,
  RegistrationApplication,
  approveApplication,
  rejectApplication,
  StoredRuralMart,
  StoredOwnerAccount,
} from '../../lib/storageService';
interface PendingRegistrationsPageProps {
  theme: 'light' | 'dark';
  onUpdatePendingCount?: () => void;
}

export const PendingRegistrationsPage: React.FC<PendingRegistrationsPageProps> = ({
  onUpdatePendingCount,
}) => {
  const [applications, setApplications] = useState<RegistrationApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  
  // Modals
  const [selectedApp, setSelectedApp] = useState<RegistrationApplication | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showApproveConfirmModal, setShowApproveConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  
  // Approval Success State
  const [approvalResult, setApprovalResult] = useState<{
    application: RegistrationApplication;
    ruralMart: StoredRuralMart;
    owner: StoredOwnerAccount;
    temporaryPassword: string;
  } | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Load applications from localStorage
  const refreshApplications = () => {
    const data = getApplications();
    setApplications(data);
    if (onUpdatePendingCount) onUpdatePendingCount();
  };

  useEffect(() => {
    refreshApplications();
  }, []);

  const districts = ['All', 'Erode', 'Coimbatore', 'Tiruppur', 'Salem', 'Madurai'];

  // Filtered lists
  const pendingList = applications.filter((a) => a.status === 'pending');
  const historyList = applications.filter((a) => a.status === 'approved' || a.status === 'rejected');

  const currentList = activeTab === 'pending' ? pendingList : historyList;

  const filteredApplications = currentList.filter((app) => {
    const matchesSearch =
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.ruralMartName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDistrict = districtFilter === 'All' || app.district === districtFilter;

    return matchesSearch && matchesDistrict;
  });

  // Action handlers
  const handleOpenReview = (app: RegistrationApplication) => {
    setSelectedApp(app);
    setShowReviewModal(true);
  };

  const handleConfirmApproval = () => {
    if (!selectedApp) return;
    try {
      const result = approveApplication(selectedApp.applicationId);
      setShowApproveConfirmModal(false);
      setShowReviewModal(false);
      setApprovalResult(result);
      refreshApplications();
    } catch (e) {
      console.error('Failed to approve application:', e);
    }
  };

  const handleConfirmRejection = () => {
    if (!selectedApp) return;
    try {
      rejectApplication(selectedApp.applicationId, rejectionReasonInput);
      setShowRejectModal(false);
      setShowReviewModal(false);
      setRejectionReasonInput('');
      setSelectedApp(null);
      refreshApplications();
    } catch (e) {
      console.error('Failed to reject application:', e);
    }
  };

  const handleCopyCredentials = () => {
    if (!approvalResult) return;
    const text = `Rural Mart: ${approvalResult.ruralMart.ruralMartName}\nOwner: ${approvalResult.owner.email}\nTemporary Password: ${approvalResult.temporaryPassword}`;
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121E19] p-5 rounded-2xl border border-[#DDE6E0] dark:border-[#1E3129] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider text-[#174F3A] dark:text-[#A3E6C5] uppercase bg-[#E7F2EC] dark:bg-[#1B3D30] px-2.5 py-0.5 rounded-full">
              Registration Management
            </span>
            <span className="text-xs font-semibold text-[#66736C] dark:text-[#8E9E96]">
              • {pendingList.length} Pending Application{pendingList.length === 1 ? '' : 's'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17221D] dark:text-[#E6ECE8] mt-1">
            Pending Registrations
          </h1>
          <p className="text-xs text-[#66736C] dark:text-[#8E9E96] mt-0.5">
            Review and approve Rural Mart registration applications.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#F5F8F4] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#174F3A] text-white shadow-xs'
                : 'text-[#66736C] dark:text-[#8E9E96] hover:text-[#17221D] dark:hover:text-[#E6ECE8]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
            {pendingList.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'pending'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5]'
              }`}>
                {pendingList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#174F3A] text-white shadow-xs'
                : 'text-[#66736C] dark:text-[#8E9E96] hover:text-[#17221D] dark:hover:text-[#E6ECE8]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>History ({historyList.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#121E19] p-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129]">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A958F] dark:text-[#61736A]" />
          <input
            type="text"
            placeholder="Search Application ID, Mart Name, Owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]"
          />
        </div>

        {/* District Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#66736C] dark:text-[#8E9E96]" />
          <span className="text-xs text-[#66736C] dark:text-[#8E9E96] font-medium hidden sm:inline">District:</span>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A] cursor-pointer w-full sm:w-auto"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Districts' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAF7] dark:bg-[#16241E] border-b border-[#DDE6E0] dark:border-[#1E3129] text-[#66736C] dark:text-[#8E9E96] font-bold">
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Rural Mart</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Submitted</th>
                {activeTab === 'history' && <th className="py-3 px-4">Reviewed</th>}
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EFEB] dark:divide-[#16241E]">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === 'history' ? 8 : 7}
                    className="py-12 text-center text-[#8A958F] dark:text-[#61736A]"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Clock className="w-8 h-8 text-[#8A958F]/50" />
                      <p className="font-semibold text-sm">No applications found</p>
                      <p className="text-xs">
                        {activeTab === 'pending'
                          ? 'There are currently no pending registration requests.'
                          : 'No historical registration decisions match your filter.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr
                    key={app.applicationId}
                    className="hover:bg-[#F8FAF7] dark:hover:bg-[#16241E]/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#174F3A] dark:text-[#8ECAAA]">
                      {app.applicationId}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#17221D] dark:text-[#E6ECE8]">
                      {app.ruralMartName}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#17221D] dark:text-[#E6ECE8]">
                      <div>{app.ownerName}</div>
                      <div className="text-[10px] text-[#66736C] dark:text-[#8E9E96]">{app.email}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#66736C] dark:text-[#8E9E96]">
                      {app.district}
                    </td>
                    <td className="py-3 px-4 text-[#66736C] dark:text-[#8E9E96]">
                      {app.submittedAt}
                    </td>
                    {activeTab === 'history' && (
                      <td className="py-3 px-4 text-[#66736C] dark:text-[#8E9E96]">
                        {app.reviewedAt || '-'}
                      </td>
                    )}
                    <td className="py-3 px-4">
                      {app.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-[#3D2D10] text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-bold text-[11px]">
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Pending</span>
                        </span>
                      )}
                      {app.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-[#1B3D30] text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-bold text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Approved</span>
                        </span>
                      )}
                      {app.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-[#3D1717] text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900/50 font-bold text-[11px]">
                          <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {app.status === 'pending' ? (
                        <button
                          onClick={() => handleOpenReview(app)}
                          className="px-3 py-1.5 rounded-lg bg-[#174F3A] hover:bg-[#103A2B] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Review →
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenReview(app)}
                          className="px-3 py-1.5 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] hover:bg-[#F1F6F3] dark:hover:bg-[#182921] text-[#17221D] dark:text-[#E6ECE8] font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#174F3A] dark:text-[#8ECAAA]" />
                          <span>{app.status === 'rejected' ? 'View Reason' : 'View'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Application Review Modal */}
      {showReviewModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DDE6E0] dark:border-[#1E3129] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#174F3A] dark:text-[#A3E6C5] bg-[#E7F2EC] dark:bg-[#1B3D30] px-2.5 py-0.5 rounded-full">
                  Registration Review
                </span>
                <h2 className="text-xl font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1">
                  Application Details ({selectedApp.applicationId})
                </h2>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 rounded-full border border-[#DDE6E0] dark:border-[#1E3129] flex items-center justify-center text-[#8A958F] hover:text-[#17221D] dark:hover:text-[#E6ECE8] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Application Overview Sections */}
            <div className="space-y-4 text-xs">
              
              {/* OWNER DETAILS */}
              <div className="bg-[#F8FAF7] dark:bg-[#16241E] p-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#174F3A] dark:text-[#8ECAAA] border-b border-[#E9EFEB] dark:border-[#16241E] pb-1.5">
                  <User className="w-4 h-4" />
                  <span>OWNER DETAILS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[#8A958F] dark:text-[#61736A] block text-[10px]">Owner Name</span>
                    <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">{selectedApp.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-[#8A958F] dark:text-[#61736A] block text-[10px]">Email Address</span>
                    <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{selectedApp.email}</span>
                  </div>
                  <div>
                    <span className="text-[#8A958F] dark:text-[#61736A] block text-[10px]">Phone Number</span>
                    <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{selectedApp.phone}</span>
                  </div>
                </div>
              </div>

              {/* RURAL MART DETAILS */}
              <div className="bg-[#F8FAF7] dark:bg-[#16241E] p-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#174F3A] dark:text-[#8ECAAA] border-b border-[#E9EFEB] dark:border-[#16241E] pb-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>RURAL MART DETAILS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[#8A958F] dark:text-[#61736A] block text-[10px]">Rural Mart Name</span>
                    <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">{selectedApp.ruralMartName}</span>
                  </div>
                  <div>
                    <span className="text-[#8A958F] dark:text-[#61736A] block text-[10px]">District</span>
                    <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{selectedApp.district}</span>
                  </div>
                  <div>
                    <span className="text-[#8A958F] dark:text-[#61736A] block text-[10px]">Block</span>
                    <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{selectedApp.block}</span>
                  </div>
                  <div>
                    <span className="text-[#8A958F] dark:text-[#61736A] block text-[10px]">Village</span>
                    <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{selectedApp.village}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#8A958F] dark:text-[#61736A] block text-[10px]">Address</span>
                    <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{selectedApp.address}</span>
                  </div>
                  <div>
                    <span className="text-[#8A958F] dark:text-[#61736A] block text-[10px]">Contact Number</span>
                    <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{selectedApp.phone}</span>
                  </div>
                </div>
              </div>

              {/* APPLICATION DETAILS */}
              <div className="bg-[#F8FAF7] dark:bg-[#16241E] p-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#174F3A] dark:text-[#8ECAAA] border-b border-[#E9EFEB] dark:border-[#16241E] pb-1.5">
                  <FileText className="w-4 h-4" />
                  <span>APPLICATION DETAILS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[#8A958F] dark:text-[#61736A] block text-[10px]">Application ID</span>
                    <span className="font-bold font-mono text-[#174F3A] dark:text-[#8ECAAA]">{selectedApp.applicationId}</span>
                  </div>
                  <div>
                    <span className="text-[#8A958F] dark:text-[#61736A] block text-[10px]">Submitted Date</span>
                    <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{selectedApp.submittedAt}</span>
                  </div>
                  <div>
                    <span className="text-[#8A958F] dark:text-[#61736A] block text-[10px]">Status</span>
                    <span className="font-bold capitalize text-[#17221D] dark:text-[#E6ECE8]">{selectedApp.status}</span>
                  </div>
                  {selectedApp.rejectionReason && (
                    <div className="sm:col-span-3 bg-red-50 dark:bg-[#3D1717] p-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200">
                      <span className="font-bold block text-[10px] uppercase text-red-700 dark:text-red-300">Rejection Reason:</span>
                      <p className="mt-0.5">{selectedApp.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            {selectedApp.status === 'pending' ? (
              <div className="pt-4 border-t border-[#DDE6E0] dark:border-[#1E3129] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 h-10 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-[#3D1717] transition-colors cursor-pointer"
                >
                  Reject Application
                </button>

                <button
                  type="button"
                  onClick={() => setShowApproveConfirmModal(true)}
                  className="px-5 h-10 rounded-xl bg-[#174F3A] hover:bg-[#103A2B] text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Application</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-[#DDE6E0] dark:border-[#1E3129] flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 h-9 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8] font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: Approve Confirmation Modal */}
      {showApproveConfirmModal && selectedApp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 text-center">
            
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#17221D] dark:text-[#E6ECE8]">
                Approve this Rural Mart application?
              </h3>
              <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
                Approving this application will create the Rural Mart and Owner account.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] text-left text-xs space-y-1 border border-[#DDE6E0] dark:border-[#1E3129]">
              <p><span className="font-semibold">Mart:</span> {selectedApp.ruralMartName}</p>
              <p><span className="font-semibold">Owner Email:</span> {selectedApp.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowApproveConfirmModal(false)}
                className="h-10 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8] font-bold text-xs hover:bg-[#F1F6F3] dark:hover:bg-[#182921] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="h-10 rounded-xl bg-[#174F3A] hover:bg-[#103A2B] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Approve
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: Approval Success Modal with Credentials */}
      {approvalResult && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 text-center">
            
            <div className="w-14 h-14 rounded-2xl bg-[#174F3A] text-white flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#174F3A] dark:text-[#A3E6C5] bg-[#E7F2EC] dark:bg-[#1B3D30] px-2.5 py-0.5 rounded-full">
                SUCCESSFUL APPROVAL
              </span>
              <h3 className="text-xl font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1">
                Rural Mart Approved
              </h3>
              <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
                Owner account created successfully.
              </p>
            </div>

            {/* Generated Credentials Card */}
            <div className="p-4 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] text-left text-xs space-y-2.5">
              <div>
                <span className="text-[10px] font-semibold text-[#8A958F] dark:text-[#61736A] uppercase block">Rural Mart</span>
                <span className="font-bold text-sm text-[#17221D] dark:text-[#E6ECE8]">{approvalResult.ruralMart.ruralMartName}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#8A958F] dark:text-[#61736A] uppercase block">Owner</span>
                <span className="font-semibold text-[#17221D] dark:text-[#E6ECE8]">{approvalResult.ruralMart.ownerName}</span>
              </div>
              <div className="pt-2 border-t border-[#E9EFEB] dark:border-[#16241E] space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-[#174F3A] dark:text-[#8ECAAA] uppercase block">Login Email</span>
                  <span className="font-mono font-bold text-[#17221D] dark:text-[#E6ECE8] bg-white dark:bg-[#121E19] px-2 py-1 rounded border border-[#DDE6E0] dark:border-[#1E3129] block mt-0.5">
                    {approvalResult.owner.email}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#174F3A] dark:text-[#8ECAAA] uppercase block">Temporary Password</span>
                  <span className="font-mono font-bold text-[#174F3A] dark:text-[#A3E6C5] bg-[#E7F2EC] dark:bg-[#1B3D30] px-2 py-1 rounded border border-[#174F3A]/20 block mt-0.5 text-sm">
                    {approvalResult.temporaryPassword}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#66736C] dark:text-[#8E9E96] italic">
              Share these credentials securely with the Rural Mart Owner.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleCopyCredentials}
                className="w-full h-10 bg-[#174F3A] hover:bg-[#103A2B] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {copiedCredentials ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Credentials Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Credentials</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setApprovalResult(null)}
                className="w-full h-9 border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] hover:bg-[#F1F6F3] dark:hover:bg-[#182921] text-[#17221D] dark:text-[#E6ECE8] font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: Reject Application Modal */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold border-b border-[#DDE6E0] dark:border-[#1E3129] pb-3">
              <XCircle className="w-5 h-5" />
              <h3 className="text-base">Reject Application</h3>
            </div>

            <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
              Are you sure you want to reject registration <span className="font-bold text-[#17221D] dark:text-[#E6ECE8]">{selectedApp.applicationId}</span> ({selectedApp.ruralMartName})?
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                Rejection Reason (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Required registration information is incomplete."
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] focus:outline-none focus:ring-2 focus:ring-[#174F3A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="h-10 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#121E19] text-[#17221D] dark:text-[#E6ECE8] font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                className="h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Reject Application
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
