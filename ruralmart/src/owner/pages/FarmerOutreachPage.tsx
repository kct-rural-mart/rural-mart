import React, { useState, useMemo, useEffect } from 'react';
import { saveOutreachProgram, getOutreachByRuralMart, getFarmers, updateOutreachProgram, deleteOutreachProgram } from '../../shared/dataServices';
import {
  Users,
  Plus,
  Calendar,
  X,
  CheckCircle2,
  BookOpen,
  MapPin,
  Tag,
  Sparkles,
  TrendingUp,
  FileText,
  Clock,
  Check,
  Camera,
  Image as ImageIcon,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';

interface FarmerOutreachPageProps {
  currentMartId?: string | null;
  theme: 'light' | 'dark';
  searchQuery?: string;
}

interface SessionLogEntry {
  id: string;
  title: string;
  activityType: string;
  village: string;
  date: string;
  status: 'COMPLETED' | 'SCHEDULED' | 'IN PROGRESS';
  description: string;
  topics: string[];
  attended: number;
  existing: number;
  newLeads: number;
  photos?: string[];
  stakeholder?: string;
}

const INITIAL_SESSION_LOGS: SessionLogEntry[] = [];

interface FarmerEntryRow {
  id: string;
  name: string;
  mobile: string;
  place: string;
  profession: 'Farmer' | 'Commercial';
}

interface FarmerOutreachRecord {
  id: string;
  date: string;
  displayDate: string;
  farmers: FarmerEntryRow[];
  farmersAttended: number;
  villagesCovered: number;
  savedAt: string;
}

export const FarmerOutreachPage: React.FC<FarmerOutreachPageProps> = ({
  currentMartId,
  theme,
}) => {
  // Session Logs
  const [sessionLogs, setSessionLogs] = useState<SessionLogEntry[]>(() => {
    const saved = getOutreachByRuralMart(currentMartId || '');
    if (saved && saved.length > 0) {
      return saved.map((o) => ({
        id: o.id,
        title: o.title || o.programName || `${o.activityType || 'Outreach'} - ${o.village || 'Village'}`,
        activityType: o.activityType || 'Village Outreach',
        village: o.village || 'Local Village',
        date: o.date || o.programDate || '—',
        status: (o.status?.toUpperCase() as any) || 'COMPLETED',
        description: o.description || '—',
        topics: Array.isArray(o.topics) ? o.topics : Array.isArray(o.topicsCovered) ? o.topicsCovered : typeof o.topicsCovered === 'string' ? [o.topicsCovered] : [],
        attended: o.farmersAttended || o.farmersReached || 0,
        existing: o.existingFarmersCount || 0,
        newLeads: o.newLeadsCount || 0,
        photos: o.photos || [],
      }));
    }
    return [];
  });
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Photo upload & View/Edit/Delete Modal states
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [viewLogItem, setViewLogItem] = useState<SessionLogEntry | null>(null);
  const [editLogItem, setEditLogItem] = useState<SessionLogEntry | null>(null);
  const [deleteConfirmLogId, setDeleteConfirmLogId] = useState<string | null>(null);

  // Activity Types & Villages lists (with dynamic addition)
  const [activityTypes, setActivityTypes] = useState<string[]>([
    'Product Demonstration',
    'Soil Health Camp',
    'Panchayat Awareness Drive',
  ]);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivityInput, setNewActivityInput] = useState('');

  // Dynamic Villages & Gram Panchayats List
  const defaultVillagesList = useMemo(() => {
    const base = [
      'Athani GP',
      'Athani',
      'Bhavani GP',
      'Bhavani',
      'Perundurai GP',
      'Perundurai',
      'Gobichettipalayam',
      'Sathyamangalam',
      'Chennimalai',
      'Modakurichi',
      'Anthiyur',
      'Appakudal',
    ];
    // Gather registered villages and gram panchayats from database
    const registered = getFarmers();
    registered.forEach((f) => {
      if (f.village && !base.includes(f.village)) base.push(f.village);
      if (f.gramPanchayat && !base.includes(f.gramPanchayat)) base.push(f.gramPanchayat);
    });
    return base;
  }, []);

  const [villages, setVillages] = useState<string[]>(defaultVillagesList);
  const [isAddingVillage, setIsAddingVillage] = useState(false);
  const [newVillageInput, setNewVillageInput] = useState('');

  // Form State
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedActivity, setSelectedActivity] = useState('Product Demonstration');
  const [selectedVillage, setSelectedVillage] = useState(defaultVillagesList[0] || 'Athani GP');
  const [description, setDescription] = useState('');
  const [stakeholder, setStakeholder] = useState('');
  const [farmersAttended, setFarmersAttended] = useState('');

  // Topics Chips / Tags
  const [topics, setTopics] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Village Farmer Data Collection (date-wise Excel-like entry) — new, separate from the
  // existing "Record Village Outreach & Farmer Event" form and its session logs above.
  const farmerOutreachStorageKey = `ruralmart_farmer_outreach_records_${currentMartId || 'default'}`;

  const [farmerOutreachRecords, setFarmerOutreachRecords] = useState<FarmerOutreachRecord[]>(() => {
    try {
      const raw = window.localStorage.getItem(farmerOutreachStorageKey);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Persist saved outreach records so they survive page refreshes/navigation
  useEffect(() => {
    try {
      window.localStorage.setItem(farmerOutreachStorageKey, JSON.stringify(farmerOutreachRecords));
    } catch {
      // localStorage unavailable — records simply won't persist across reloads
    }
  }, [farmerOutreachRecords, farmerOutreachStorageKey]);

  const [collectionDate, setCollectionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isCollectionEntryOpen, setIsCollectionEntryOpen] = useState(false);
  const makeBlankFarmerRow = (): FarmerEntryRow => ({
    id: `frow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    mobile: '',
    place: '',
    profession: 'Farmer',
  });
  const [activeFarmerRows, setActiveFarmerRows] = useState<FarmerEntryRow[]>([makeBlankFarmerRow()]);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const formatCollectionDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Loads the saved farmer rows for a date (if one exists) so entry can continue, or starts blank
  const loadRowsForDate = (dateValue: string) => {
    const existing = farmerOutreachRecords.find((r) => r.date === dateValue);
    if (existing && existing.farmers.length > 0) {
      setActiveFarmerRows(existing.farmers.map((f) => ({ ...f })));
    } else {
      setActiveFarmerRows([makeBlankFarmerRow()]);
    }
  };

  const handleCollectionDateChange = (value: string) => {
    setCollectionDate(value);
    loadRowsForDate(value);
    setIsCollectionEntryOpen(true);
  };

  const handleAddFarmerRow = () => {
    setActiveFarmerRows((prev) => [...prev, makeBlankFarmerRow()]);
  };

  const handleFarmerRowChange = (
    id: string,
    field: 'name' | 'mobile' | 'place' | 'profession',
    value: string
  ) => {
    setActiveFarmerRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleRemoveFarmerRow = (id: string) => {
    setActiveFarmerRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const handleSaveOutreachCollection = () => {
    const validRows = activeFarmerRows.filter((r) => r.name.trim() !== '');
    if (validRows.length === 0) {
      setToastMessage('Please enter at least one farmer record before saving.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    const placesCovered = new Set(validRows.map((r) => r.place.trim()).filter((v) => v !== '')).size;

    setFarmerOutreachRecords((prev) => {
      const existingIndex = prev.findIndex((r) => r.date === collectionDate);
      const recordFields = {
        date: collectionDate,
        displayDate: formatCollectionDate(collectionDate),
        farmers: validRows,
        farmersAttended: validRows.length,
        villagesCovered: placesCovered,
        savedAt: new Date().toISOString(),
      };
      if (existingIndex >= 0) {
        // Same date already has a record — update it in place instead of duplicating
        const updated = [...prev];
        updated[existingIndex] = { ...prev[existingIndex], ...recordFields };
        return updated;
      }
      return [{ id: `foc-${Date.now()}`, ...recordFields }, ...prev];
    });

    setIsCollectionEntryOpen(false);
    setToastMessage(`Outreach data for ${formatCollectionDate(collectionDate)} saved — ${validRows.length} farmers recorded.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleExpandRecord = (id: string) => {
    setExpandedRecordId((prev) => (prev === id ? null : id));
  };

  // Auto-calculated new potential leads
  const attendedNumber = parseInt(farmersAttended, 10);
  const isNumeric = !isNaN(attendedNumber);
  // Calculation formula: if valid number, calculated leads (e.g. 35% of total or attended minus baseline)
  // handles negative values if negative number is entered
  const calculatedNewLeads = isNumeric
    ? Math.round(attendedNumber * 0.35)
    : 0;

  // Total summary metrics dynamically reflecting logs
  const totalSessions = sessionLogs.length;
  const totalFarmersReached =
    sessionLogs.reduce((acc, curr) => acc + curr.attended, 0) +
    farmerOutreachRecords.reduce((acc, curr) => acc + curr.farmersAttended, 0);
  const totalNewLeads = sessionLogs.reduce((acc, curr) => acc + curr.newLeads, 0);
  const conversionRate = totalFarmersReached > 0 ? `${((totalNewLeads / totalFarmersReached) * 100).toFixed(1)}%` : '0%';
  const directSalesValue = '₹0';

  // Handle Add Activity
  const handleAddActivityType = () => {
    if (newActivityInput.trim()) {
      const added = newActivityInput.trim();
      setActivityTypes((prev) => [...prev, added]);
      setSelectedActivity(added);
      setNewActivityInput('');
      setIsAddingActivity(false);
    }
  };

  // Handle Add Village
  const handleAddVillage = () => {
    if (newVillageInput.trim()) {
      const added = newVillageInput.trim();
      setVillages((prev) => [...prev, added]);
      setSelectedVillage(added);
      setNewVillageInput('');
      setIsAddingVillage(false);
    }
  };

  // Handle Tag Management
  const handleRemoveTag = (tagToRemove: string) => {
    setTopics((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleAddTag = () => {
    if (newTagInput.trim()) {
      const tagToAdd = newTagInput.trim();
      if (!topics.includes(tagToAdd)) {
        setTopics((prev) => [...prev, tagToAdd]);
      }
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setUploadedPhotos((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear Form
  const handleClearForm = () => {
    setSessionDate(new Date().toISOString().split('T')[0]);
    setSelectedActivity('Product Demonstration');
    setSelectedVillage('');
    setDescription('');
    setStakeholder('');
    setFarmersAttended('');
    setTopics([]);
    setUploadedPhotos([]);
    setIsAddingActivity(false);
    setIsAddingVillage(false);
    setIsAddingTag(false);
  };

  // Save Outreach Session
  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedDateStr = sessionDate ? new Date(sessionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newEntry: SessionLogEntry = {
      id: `log-${Date.now()}`,
      title: `${selectedActivity} - ${selectedVillage}`,
      activityType: selectedActivity,
      village: selectedVillage,
      date: formattedDateStr,
      status: 'COMPLETED',
      description: description || '—',
      topics: [...topics],
      attended: isNumeric ? attendedNumber : 0,
      existing: isNumeric ? Math.max(0, attendedNumber - calculatedNewLeads) : 0,
      newLeads: calculatedNewLeads,
      photos: [...uploadedPhotos],
      stakeholder: stakeholder.trim(),
    };

    setSessionLogs((prev) => [newEntry, ...prev]);

    // Persist outreach program to shared storage
    saveOutreachProgram({
      id: newEntry.id,
      ruralMartId: currentMartId || '',
      programName: newEntry.title,
      programDate: formattedDateStr,
      farmersReached: isNumeric ? attendedNumber : 0,
      villagesCovered: 1,
      animalPopulationCovered: 0,
      title: newEntry.title,
      activityType: selectedActivity,
      village: selectedVillage,
      district: 'Erode',
      date: formattedDateStr,
      status: 'Completed',
      description: newEntry.description,
      farmersAttended: isNumeric ? attendedNumber : 0,
      newLeadsCount: calculatedNewLeads,
      existingFarmersCount: isNumeric ? Math.max(0, attendedNumber - calculatedNewLeads) : 0,
      topicsCovered: topics.join(', '),
      topics: [...topics],
      photos: [...uploadedPhotos],
    });

    setToastMessage(`Outreach Session for "${selectedVillage}" saved successfully!`);
    setTimeout(() => setToastMessage(null), 4000);

    handleClearForm();
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#174F3A] text-white text-xs font-bold shadow-lg border border-emerald-500/30 flex items-center justify-between animate-fade-in transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#A3E6C5]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-200 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PAGE HEADER BANNER */}
      <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5] mb-1.5">
            ACTIVE OUTREACH DATE: 6 AUG 2026, THU
          </span>
          <h1 className="text-xl font-bold text-[#17221D] dark:text-[#E6ECE8]">
            Farmer Outreach & Field Sessions
          </h1>
          <p className="text-xs text-[#66736C] dark:text-[#8E9E96] mt-0.5">
            Track village training camps, farmer leads, and awareness drives for 6 AUG 2026, THU.
          </p>
        </div>

        <button
          onClick={() => setIsLogsModalOpen(true)}
          className="h-9 px-4 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] dark:hover:bg-[#234F3F] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Outreach Session Logs</span>
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-800/60 text-emerald-200 text-[10px] font-extrabold">
            ({sessionLogs.length})
          </span>
        </button>
      </div>

      {/* SUMMARY METRIC CARDS (4 Cards in a row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Sessions Conducted */}
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            Total Sessions Conducted
          </span>
          <div className="text-2xl font-extrabold text-[#17221D] dark:text-[#E6ECE8]">
            {totalSessions}
          </div>
          <span className="text-[11px] font-medium text-[#66736C] dark:text-[#8E9E96]">
            —
          </span>
        </div>

        {/* Card 2: Total Farmers Reached */}
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            Total Farmers Reached
          </span>
          <div className="text-2xl font-extrabold text-[#174F3A] dark:text-[#A3E6C5]">
            {totalFarmersReached.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-medium text-[#66736C] dark:text-[#8E9E96]">
            —
          </span>
        </div>

        {/* Card 3: Lead Conversion Rate */}
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            Lead Conversion Rate
          </span>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {conversionRate}
          </div>
          <span className="text-[11px] font-medium text-[#66736C] dark:text-[#8E9E96]">
            —
          </span>
        </div>

        {/* Card 4: Direct Field Sales */}
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] uppercase tracking-wider block">
            Direct Field Sales
          </span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {directSalesValue}
          </div>
          <span className="text-[11px] font-medium text-[#66736C] dark:text-[#8E9E96]">
            —
          </span>
        </div>
      </div>

      {/* MAIN FORM CARD: "Record Village Outreach & Farmer Event" */}
      <div className="card-enterprise p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
            <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
              Record Village Outreach & Farmer Event
            </h2>
          </div>
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-[#3D2D10] px-2.5 py-0.5 rounded-full self-start sm:self-auto">
            Event Verification Required
          </span>
        </div>

        <form onSubmit={handleSaveSession} className="space-y-4">
          {/* Top Row: 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Field 1: Session Date */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                Session Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                />
              </div>
            </div>

            {/* Field 2: Activity Type */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                Activity Type <span className="text-red-500">*</span>
              </label>
              {!isAddingActivity ? (
                <select
                  value={selectedActivity}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setIsAddingActivity(true);
                    } else {
                      setSelectedActivity(e.target.value);
                    }
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                >
                  {activityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                  <option value="__ADD_NEW__">+ Add Activity Type</option>
                </select>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    placeholder="New activity name..."
                    value={newActivityInput}
                    onChange={(e) => setNewActivityInput(e.target.value)}
                    className="flex-1 h-9 px-3 text-xs rounded-xl border border-[#174F3A] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                  />
                  <button
                    type="button"
                    onClick={handleAddActivityType}
                    className="h-9 px-3 bg-[#174F3A] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#103A2B]"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingActivity(false);
                      setNewActivityInput('');
                    }}
                    className="h-9 px-2.5 border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold rounded-xl text-slate-500 hover:bg-[#F8FAF7]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Field 3: Village / Gram Panchayat */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
                Village / Gram Panchayat <span className="text-red-500">*</span>
              </label>

              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
              >
                {villages.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Brief Description of Activity */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
              Brief Description of Activity <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Key highlights, product trials, and farmer feedback..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8] resize-none"
            />
          </div>

          {/* Stakeholder */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
              Stakeholder
            </label>
            <input
              type="text"
              placeholder="Enter stakeholder name..."
              value={stakeholder}
              onChange={(e) => setStakeholder(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
            />
          </div>

          {/* Total Farmers Attended */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
              Total Farmers Attended <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 65"
              value={farmersAttended}
              onChange={(e) => setFarmersAttended(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
            />
          </div>

          {/* Topics Covered in Session (Tags / Chips Input) */}
          <div className="space-y-2 pt-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
            <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
              Topics Covered in Session
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {topics.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] text-[#17221D] dark:text-[#E6ECE8]"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[#8A958F] hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}

              {!isAddingTag ? (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-[#174F3A] dark:text-[#A3E6C5] border border-dashed border-[#174F3A]/40 dark:border-[#A3E6C5]/40 hover:bg-[#E7F2EC] dark:hover:bg-[#1B3D30] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Tag</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Enter topic..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="h-8 px-2.5 text-xs rounded-lg border border-[#174F3A] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="h-8 px-3 bg-[#174F3A] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTag(false);
                      setNewTagInput('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 px-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Outreach Event Photos Upload */}
          <div className="space-y-2 pt-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                <span>Session Event Photos / Documentation</span>
              </label>
              <label className="cursor-pointer text-xs font-bold text-[#174F3A] dark:text-[#A3E6C5] bg-[#E7F2EC] dark:bg-[#1B3D30] hover:bg-[#174F3A] hover:text-white px-3 py-1 rounded-lg border border-[#103A2B]/20 transition-all inline-flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {uploadedPhotos.map((imgSrc, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-[#DDE6E0] dark:border-[#1E3129] bg-slate-100">
                    <img src={imgSrc} alt={`Session photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
                      title="Remove Photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-[#E9EFEB] dark:border-[#16241E]">
            <button
              type="button"
              onClick={handleClearForm}
              className="h-9 px-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold text-[#66736C] dark:text-[#8E9E96] hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] cursor-pointer transition-colors"
            >
              Clear Form
            </button>

            <button
              type="submit"
              className="h-9 px-5 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] dark:hover:bg-[#234F3F] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Outreach Session</span>
            </button>
          </div>
        </form>
      </div>

      {/* NEW SECTION: Village Farmer Data Collection — date-wise, Excel-like farmer entry.
          Fully separate from the "Record Village Outreach & Farmer Event" form above. */}
      <div className="card-enterprise p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
            <h2 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8] uppercase tracking-wider">
              Village Farmer Data Collection
            </h2>
          </div>
          <span className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
            Log individual farmer attendance per outreach date
          </span>
        </div>

        {/* Date picker to start / open an entry sheet for a specific outreach date */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="space-y-1 w-full sm:w-56">
            <label className="block text-xs font-semibold text-[#17221D] dark:text-[#E6ECE8]">
              Outreach Date
            </label>
            <input
              type="date"
              value={collectionDate}
              onChange={(e) => handleCollectionDateChange(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] text-[#17221D] dark:text-[#E6ECE8]"
            />
          </div>
          {!isCollectionEntryOpen && (
            <button
              type="button"
              onClick={() => {
                loadRowsForDate(collectionDate);
                setIsCollectionEntryOpen(true);
              }}
              className="h-9 px-4 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] dark:hover:bg-[#234F3F] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Farmer Entry Sheet</span>
            </button>
          )}
        </div>

        {/* Excel-like editable table — visible only while an entry sheet is open */}
        {isCollectionEntryOpen && (
          <div className="space-y-3 pt-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                Farmer Records for {formatCollectionDate(collectionDate)}
              </span>
              <span className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                {activeFarmerRows.filter((r) => r.name.trim() !== '').length} valid record(s)
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#DDE6E0] dark:border-[#1E3129]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#F8FAF7] dark:bg-[#16241E] text-left">
                    <th className="py-2 px-3 w-10 text-[#66736C] dark:text-[#8E9E96] font-bold">#</th>
                    <th className="py-2 px-3 text-[#66736C] dark:text-[#8E9E96] font-bold">Name</th>
                    <th className="py-2 px-3 text-[#66736C] dark:text-[#8E9E96] font-bold">Mobile Number</th>
                    <th className="py-2 px-3 text-[#66736C] dark:text-[#8E9E96] font-bold">Place</th>
                    <th className="py-2 px-3 text-[#66736C] dark:text-[#8E9E96] font-bold">Profession</th>
                    <th className="py-2 px-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {activeFarmerRows.map((row, idx) => (
                    <tr key={row.id} className="border-t border-[#E9EFEB] dark:border-[#16241E]">
                      <td className="py-1.5 px-3 text-[#66736C] dark:text-[#8E9E96]">{idx + 1}</td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          placeholder="Full name"
                          value={row.name}
                          onChange={(e) => handleFarmerRowChange(row.id, 'name', e.target.value)}
                          className="w-full h-8 px-2 text-xs rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#0F1A15] text-[#17221D] dark:text-[#E6ECE8]"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="tel"
                          placeholder="Mobile number"
                          value={row.mobile}
                          onChange={(e) => handleFarmerRowChange(row.id, 'mobile', e.target.value)}
                          className="w-full h-8 px-2 text-xs rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#0F1A15] text-[#17221D] dark:text-[#E6ECE8]"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          placeholder="Place"
                          value={row.place}
                          onChange={(e) => handleFarmerRowChange(row.id, 'place', e.target.value)}
                          className="w-full h-8 px-2 text-xs rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#0F1A15] text-[#17221D] dark:text-[#E6ECE8]"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <select
                          value={row.profession}
                          onChange={(e) => handleFarmerRowChange(row.id, 'profession', e.target.value)}
                          className="w-full h-8 px-2 text-xs rounded-lg border border-[#DDE6E0] dark:border-[#1E3129] bg-white dark:bg-[#0F1A15] text-[#17221D] dark:text-[#E6ECE8]"
                        >
                          <option value="Farmer">Farmer</option>
                          <option value="Commercial">Commercial</option>
                        </select>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveFarmerRow(row.id)}
                          disabled={activeFarmerRows.length === 1}
                          className="text-[#8A958F] hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Remove row"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleAddFarmerRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#174F3A] dark:text-[#A3E6C5] border border-dashed border-[#174F3A]/40 dark:border-[#A3E6C5]/40 hover:bg-[#E7F2EC] dark:hover:bg-[#1B3D30] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCollectionEntryOpen(false);
                    setActiveFarmerRows([makeBlankFarmerRow()]);
                  }}
                  className="h-9 px-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold text-[#66736C] dark:text-[#8E9E96] hover:bg-[#F8FAF7] dark:hover:bg-[#16241E] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveOutreachCollection}
                  className="h-9 px-5 bg-[#174F3A] hover:bg-[#103A2B] dark:bg-[#1B3D30] dark:hover:bg-[#234F3F] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Outreach</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved records — compact cards with Expand / Collapse */}
        {farmerOutreachRecords.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
            <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8] block">
              Saved Outreach Records
            </span>

            {farmerOutreachRecords.map((record) => {
              const isExpanded = expandedRecordId === record.id;
              return (
                <div
                  key={record.id}
                  className="rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] bg-[#F8FAF7] dark:bg-[#16241E] overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="text-xs font-bold text-[#17221D] dark:text-[#E6ECE8]">
                        {record.displayDate}
                      </span>
                      <span className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                        Farmers Attended: <strong className="text-[#174F3A] dark:text-[#A3E6C5]">{record.farmersAttended}</strong>
                      </span>
                      <span className="text-[11px] text-[#66736C] dark:text-[#8E9E96]">
                        Places Covered: <strong className="text-[#17221D] dark:text-[#E6ECE8]">{record.villagesCovered}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleExpandRecord(record.id)}
                      className="self-start sm:self-auto text-[11px] font-bold text-[#174F3A] dark:text-[#A3E6C5] hover:underline cursor-pointer"
                    >
                      {isExpanded ? '← Collapse' : 'Expand →'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="overflow-x-auto border-t border-[#DDE6E0] dark:border-[#1E3129]">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-white dark:bg-[#121E19] text-left">
                            <th className="py-2 px-3 w-10 text-[#66736C] dark:text-[#8E9E96] font-bold">#</th>
                            <th className="py-2 px-3 text-[#66736C] dark:text-[#8E9E96] font-bold">Name</th>
                            <th className="py-2 px-3 text-[#66736C] dark:text-[#8E9E96] font-bold">Mobile Number</th>
                            <th className="py-2 px-3 text-[#66736C] dark:text-[#8E9E96] font-bold">Place</th>
                            <th className="py-2 px-3 text-[#66736C] dark:text-[#8E9E96] font-bold">Profession</th>
                          </tr>
                        </thead>
                        <tbody>
                          {record.farmers.map((f, idx) => (
                            <tr key={f.id} className="border-t border-[#E9EFEB] dark:border-[#16241E]">
                              <td className="py-1.5 px-3 text-[#66736C] dark:text-[#8E9E96]">{idx + 1}</td>
                              <td className="py-1.5 px-3 text-[#17221D] dark:text-[#E6ECE8]">{f.name || '—'}</td>
                              <td className="py-1.5 px-3 text-[#17221D] dark:text-[#E6ECE8]">{f.mobile || '—'}</td>
                              <td className="py-1.5 px-3 text-[#17221D] dark:text-[#E6ECE8]">{f.place || '—'}</td>
                              <td className="py-1.5 px-3 text-[#17221D] dark:text-[#E6ECE8]">{f.profession || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: "OUTREACH SESSION LOGS" */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#174F3A] dark:text-[#A3E6C5]" />
                  <span>Outreach Activity Logbook</span>
                </h3>
                <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
                  Historical village sessions &amp; potential lead records
                </p>
              </div>
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable List */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {sessionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129] space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <h4 className="text-sm font-bold text-[#17221D] dark:text-[#E6ECE8]">
                      {log.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-[#66736C] dark:text-[#8E9E96]">
                        {log.date}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-[#143825] dark:text-emerald-300">
                        {log.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#66736C] dark:text-[#8E9E96]">
                    {log.description}
                  </p>

                  {/* Topic Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {log.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 rounded-md bg-[#E7F2EC] dark:bg-[#1B3D30] text-[#174F3A] dark:text-[#A3E6C5] text-[10px] font-semibold"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* Photos Preview if available */}
                  {log.photos && log.photos.length > 0 && (
                    <div className="flex gap-2 pt-1 overflow-x-auto">
                      {log.photos.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Session event"
                          className="w-14 h-14 object-cover rounded-lg border border-[#DDE6E0] dark:border-[#1E3129]"
                        />
                      ))}
                    </div>
                  )}

                  {/* Three Stats & Actions */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E9EFEB] dark:border-[#16241E] text-center">
                    <div className="bg-white dark:bg-[#121E19] p-2 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129]">
                      <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] block uppercase">
                        Attended
                      </span>
                      <span className="text-sm font-extrabold text-[#17221D] dark:text-[#E6ECE8]">
                        {log.attended}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#121E19] p-2 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129]">
                      <span className="text-[10px] font-bold text-[#66736C] dark:text-[#8E9E96] block uppercase">
                        Existing
                      </span>
                      <span className="text-sm font-extrabold text-[#17221D] dark:text-[#E6ECE8]">
                        {log.existing}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#121E19] p-2 rounded-lg border border-[#DDE6E0] dark:border-[#1E3129]">
                      <span className="text-[10px] font-bold text-[#174F3A] dark:text-[#A3E6C5] block uppercase">
                        New Leads
                      </span>
                      <span className="text-sm font-extrabold text-[#174F3A] dark:text-[#A3E6C5]">
                        +{log.newLeads}
                      </span>
                    </div>
                  </div>

                  {/* Row Actions: View, Edit, Delete */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#E9EFEB] dark:border-[#16241E]">
                    <button
                      type="button"
                      onClick={() => setViewLogItem(log)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1A2C23] dark:hover:bg-[#233A2F] text-slate-700 dark:text-slate-300 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditLogItem(log)}
                      className="px-2.5 py-1 rounded-lg bg-[#E7F2EC] hover:bg-[#174F3A] hover:text-white text-[#174F3A] dark:bg-[#1B3D30] dark:text-[#A3E6C5] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmLogId(log.id)}
                      className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#E9EFEB] dark:border-[#16241E] flex justify-end shrink-0">
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="h-9 px-4 rounded-xl bg-[#174F3A] hover:bg-[#103A2B] text-white text-xs font-bold cursor-pointer"
              >
                Close Logbook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW SESSION LOG POPUP */}
      {viewLogItem && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E7F2EC] text-[#174F3A] uppercase">
                  {viewLogItem.village}
                </span>
                <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8] mt-1">
                  {viewLogItem.title}
                </h3>
              </div>
              <button onClick={() => setViewLogItem(null)} className="text-slate-500 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-[#66736C] dark:text-[#8E9E96]">
                <span>Session Date: <strong className="text-[#17221D] dark:text-[#E6ECE8]">{viewLogItem.date}</strong></span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{viewLogItem.status}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF7] dark:bg-[#16241E] border border-[#DDE6E0] dark:border-[#1E3129]">
                <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] block mb-1">Session Description / Executive Notes:</span>
                <p className="text-[#66736C] dark:text-[#8E9E96]">{viewLogItem.description}</p>
              </div>

              {viewLogItem.topics && viewLogItem.topics.length > 0 && (
                <div>
                  <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] block mb-1.5">Topics Covered:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewLogItem.topics.map((t) => (
                      <span key={t} className="px-2.5 py-0.5 rounded-full bg-[#E7F2EC] text-[#174F3A] font-semibold text-[11px]">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos Gallery */}
              {viewLogItem.photos && viewLogItem.photos.length > 0 && (
                <div>
                  <span className="font-bold text-[#17221D] dark:text-[#E6ECE8] block mb-1.5">Event Documentation Photos:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {viewLogItem.photos.map((img, i) => (
                      <img key={i} src={img} alt="Event photo" className="w-full h-24 object-cover rounded-xl border border-[#DDE6E0]" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E9EFEB] dark:border-[#16241E] flex justify-end">
              <button onClick={() => setViewLogItem(null)} className="h-9 px-4 rounded-xl border border-[#DDE6E0] dark:border-[#1E3129] text-xs font-semibold cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT SESSION LOG POPUP */}
      {editLogItem && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E9EFEB] dark:border-[#16241E] pb-3">
              <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8]">
                Edit Outreach Session Record
              </h3>
              <button onClick={() => setEditLogItem(null)} className="text-slate-500 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editLogItem) return;
                const updatedLogs = sessionLogs.map((l) => (l.id === editLogItem.id ? editLogItem : l));
                setSessionLogs(updatedLogs);
                updateOutreachProgram(editLogItem.id, {
                  title: editLogItem.title,
                  activityType: editLogItem.activityType,
                  village: editLogItem.village,
                  description: editLogItem.description,
                  farmersAttended: editLogItem.attended,
                  newLeadsCount: editLogItem.newLeads,
                  topics: editLogItem.topics,
                  photos: editLogItem.photos,
                });
                setEditLogItem(null);
                setToastMessage('Outreach session record updated.');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={editLogItem.title}
                  onChange={(e) => setEditLogItem({ ...editLogItem, title: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-[#DDE6E0] bg-[#F8FAF7]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={editLogItem.description}
                  onChange={(e) => setEditLogItem({ ...editLogItem, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#DDE6E0] bg-[#F8FAF7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Farmers Attended</label>
                  <input
                    type="number"
                    min="0"
                    value={editLogItem.attended}
                    onChange={(e) => setEditLogItem({ ...editLogItem, attended: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-[#DDE6E0] bg-[#F8FAF7]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">New Potential Leads</label>
                  <input
                    type="number"
                    min="0"
                    value={editLogItem.newLeads}
                    onChange={(e) => setEditLogItem({ ...editLogItem, newLeads: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-[#DDE6E0] bg-[#F8FAF7]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E9EFEB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditLogItem(null)}
                  className="h-9 px-4 rounded-xl border border-[#DDE6E0] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-[#174F3A] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deleteConfirmLogId && (
        <div className="fixed inset-0 z-50 bg-[#17221D]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#17221D] dark:text-[#E6ECE8]">
                Delete Outreach Session Record?
              </h3>
            </div>
            <p className="text-xs text-[#66736C]">
              Are you sure you want to delete this session log? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EFEB]">
              <button
                type="button"
                onClick={() => setDeleteConfirmLogId(null)}
                className="h-9 px-4 rounded-xl border border-[#DDE6E0] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteOutreachProgram(deleteConfirmLogId);
                  setSessionLogs((prev) => prev.filter((l) => l.id !== deleteConfirmLogId));
                  setDeleteConfirmLogId(null);
                  setToastMessage('Outreach session record deleted.');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="h-9 px-5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};