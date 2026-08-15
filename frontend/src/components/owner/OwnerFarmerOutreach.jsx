import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Users, Plus, X, CheckCircle2, AlertCircle, BookOpen, Check, Search, UserPlus, Trash2, Loader2, HeartHandshake } from 'lucide-react'
import { ACTIVITY_TYPES, logOutreachProgram, getOwnerOutreachSummary, getRecentOutreachPrograms, hasPriorSales } from '../../lib/queries/ownerOutreach'
import { searchFarmers, addFarmer } from '../../lib/queries/ownerBilling'
import { getLocalToday } from '../../utils/date'

export default function OwnerFarmerOutreach() {
  const { ruralMartId, dateRange, refreshKey: layoutRefreshKey } = useOutletContext()

  const [refreshKey, setRefreshKey] = useState(0)
  const bump = () => setRefreshKey((k) => k + 1)

  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError('')
    getOwnerOutreachSummary(ruralMartId, dateRange)
      .then((result) => {
        if (isMounted) setSummary(result)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load outreach summary.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [ruralMartId, dateRange, layoutRefreshKey, refreshKey])

  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false)
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)

  useEffect(() => {
    if (!isLogsModalOpen || !ruralMartId) return
    setLogsLoading(true)
    getRecentOutreachPrograms(ruralMartId)
      .then(setLogs)
      .catch((err) => console.error('Failed to load outreach logs:', err.message))
      .finally(() => setLogsLoading(false))
  }, [isLogsModalOpen, ruralMartId, refreshKey])

  // --- FORM STATE ---
  const [sessionDate, setSessionDate] = useState(getLocalToday())
  const [activityType, setActivityType] = useState(ACTIVITY_TYPES[0])
  const [village, setVillage] = useState('')
  const [activityBrief, setActivityBrief] = useState('')

  const [topics, setTopics] = useState([])
  const [isAddingTopic, setIsAddingTopic] = useState(false)
  const [newTopicInput, setNewTopicInput] = useState('')

  const [productsDemonstrated, setProductsDemonstrated] = useState([])
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [newProductInput, setNewProductInput] = useState('')

  // --- ATTENDEE STATE ---
  const [attendeeSearch, setAttendeeSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [attendees, setAttendees] = useState([])
  const [attendeeTab, setAttendeeTab] = useState('search')
  const [newName, setNewName] = useState('')
  const [newMobile, setNewMobile] = useState('')
  const [newVillage, setNewVillage] = useState('')
  const [newGender, setNewGender] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newCattleCount, setNewCattleCount] = useState('')
  const [newFarmerErrors, setNewFarmerErrors] = useState({})
  const [newFarmerSubmitting, setNewFarmerSubmitting] = useState(false)
  const [newFarmerError, setNewFarmerError] = useState('')

  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const term = attendeeSearch.trim()
    if (!term || !ruralMartId) {
      setSearchResults([])
      return
    }
    let isMounted = true
    setSearching(true)
    const timer = setTimeout(() => {
      searchFarmers(ruralMartId, term)
        .then((results) => {
          if (isMounted) setSearchResults(results.filter((f) => !attendees.some((a) => a.farmerId === f.id)))
        })
        .catch((err) => console.error('Farmer search failed:', err.message))
        .finally(() => {
          if (isMounted) setSearching(false)
        })
    }, 250)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendeeSearch, ruralMartId])

  const addAttendee = async (farmer) => {
    if (attendees.some((a) => a.farmerId === farmer.id)) return
    let isNewCustomer = true
    try {
      isNewCustomer = !(await hasPriorSales(farmer.id))
    } catch (err) {
      console.error('Failed to check purchase history:', err.message)
    }
    setAttendees((prev) => [
      ...prev,
      {
        farmerId: farmer.id,
        name: farmer.name,
        village: farmer.village,
        animalsCovered: farmer.cattle_count ?? farmer.cattleCount ?? 0,
        isNewCustomer,
      },
    ])
    setAttendeeSearch('')
    setSearchResults([])
  }

  const removeAttendee = (farmerId) => {
    setAttendees((prev) => prev.filter((a) => a.farmerId !== farmerId))
  }

  const updateAttendee = (farmerId, patch) => {
    setAttendees((prev) => prev.map((a) => (a.farmerId === farmerId ? { ...a, ...patch } : a)))
  }

  const handleRegisterNewAttendee = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!newName.trim()) errors.name = 'Name is required.'
    const cleanMobile = newMobile.trim()
    if (!cleanMobile) {
      errors.mobile = 'Mobile number is required.'
    } else if (!/^\d{10}$/.test(cleanMobile)) {
      errors.mobile = 'Enter a valid 10-digit mobile number.'
    }
    if (!newVillage.trim()) errors.village = 'Village is required.'

    if (Object.keys(errors).length > 0) {
      setNewFarmerErrors(errors)
      return
    }

    setNewFarmerSubmitting(true)
    setNewFarmerError('')
    try {
      const farmer = await addFarmer({
        ruralMartId,
        name: newName.trim(),
        mobile: cleanMobile,
        village: newVillage.trim(),
        gender: newGender,
        age: newAge ? Number(newAge) : null,
        cattleCount: newCattleCount ? Number(newCattleCount) : 0,
      })
      await addAttendee(farmer)
      setNewName('')
      setNewMobile('')
      setNewVillage('')
      setNewGender('')
      setNewAge('')
      setNewCattleCount('')
      setNewFarmerErrors({})
      setAttendeeTab('search')
    } catch (err) {
      setNewFarmerError(err.message?.includes('duplicate') || err.code === '23505' ? 'A farmer with this mobile number is already registered at your mart.' : err.message || 'Failed to register farmer.')
    } finally {
      setNewFarmerSubmitting(false)
    }
  }

  const handleRemoveTopic = (t) => setTopics((prev) => prev.filter((x) => x !== t))
  const handleAddTopic = () => {
    if (newTopicInput.trim() && !topics.includes(newTopicInput.trim())) {
      setTopics((prev) => [...prev, newTopicInput.trim()])
    }
    setNewTopicInput('')
    setIsAddingTopic(false)
  }

  const handleRemoveProduct = (p) => setProductsDemonstrated((prev) => prev.filter((x) => x !== p))
  const handleAddProduct = () => {
    if (newProductInput.trim() && !productsDemonstrated.includes(newProductInput.trim())) {
      setProductsDemonstrated((prev) => [...prev, newProductInput.trim()])
    }
    setNewProductInput('')
    setIsAddingProduct(false)
  }

  const resetForm = () => {
    setSessionDate(getLocalToday())
    setActivityType(ACTIVITY_TYPES[0])
    setVillage('')
    setActivityBrief('')
    setTopics([])
    setProductsDemonstrated([])
    setAttendees([])
    setFormError('')
  }

  const handleSaveSession = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!village.trim()) {
      setFormError('Village is required.')
      return
    }
    if (attendees.length === 0) {
      setFormError('Add at least one attendee before saving the session.')
      return
    }

    setSubmitting(true)
    try {
      await logOutreachProgram({
        ruralMartId,
        programDate: sessionDate,
        activityType,
        activityBrief: activityBrief.trim(),
        village: village.trim(),
        topicsCovered: topics,
        productsDemonstrated,
        attendees,
      })

      setFormSuccess(`Outreach session for "${village.trim()}" saved with ${attendees.length} attendee${attendees.length === 1 ? '' : 's'}.`)
      setTimeout(() => setFormSuccess(''), 5000)
      resetForm()
      bump()
    } catch (err) {
      setFormError(err.message || 'Failed to save outreach session.')
    } finally {
      setSubmitting(false)
    }
  }

  const newCount = useMemo(() => attendees.filter((a) => a.isNewCustomer).length, [attendees])

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-text-muted gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading Farmer Outreach…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-brand-danger-light border border-brand-danger-border text-brand-danger text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {formSuccess && (
        <div className="p-3.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-lg border border-white/20 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{formSuccess}</span>
          </div>
          <button onClick={() => setFormSuccess('')} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-primary-light text-brand-primary mb-1.5">OUTREACH SESSIONS</span>
          <h1 className="text-xl font-bold text-brand-text">Farmer Outreach &amp; Field Sessions</h1>
          <p className="text-xs text-brand-text-muted mt-0.5">Log village training camps, farmer attendance, and awareness drives.</p>
        </div>

        <button
          onClick={() => setIsLogsModalOpen(true)}
          className="h-9 px-4 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Outreach Session Logs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Total Sessions</span>
          <div className="text-2xl font-extrabold text-brand-text">{summary.totalSessions}</div>
        </div>
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Farmers Reached</span>
          <div className="text-2xl font-extrabold text-brand-primary">{summary.farmersReached}</div>
        </div>
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">New Farmers (Outreach)</span>
          <div className="text-2xl font-extrabold text-brand-info">{summary.newFarmers}</div>
        </div>
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Animals Covered</span>
          <div className="text-2xl font-extrabold text-brand-warning">{summary.animalsCovered}</div>
        </div>
      </div>

      <div className="card-enterprise p-4 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-brand-border/60 pb-3">
          <Users className="w-4 h-4 text-brand-primary" />
          <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider">Log Outreach Program</h2>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-brand-danger-light border border-brand-danger-border text-brand-danger text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveSession} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-brand-text">
                Session Date <span className="text-brand-danger">*</span>
              </label>
              <input type="date" required value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text" />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-brand-text">
                Activity Type <span className="text-brand-danger">*</span>
              </label>
              <select value={activityType} onChange={(e) => setActivityType(e.target.value)} className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text">
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-brand-text">
                Village <span className="text-brand-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Athani"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-brand-text">Brief Description of Activity</label>
            <textarea
              rows={3}
              placeholder="Key highlights, product trials, and farmer feedback..."
              value={activityBrief}
              onChange={(e) => setActivityBrief(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text resize-none"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-brand-border/60">
            <label className="block text-xs font-semibold text-brand-text">Topics Covered</label>
            <div className="flex flex-wrap items-center gap-2">
              {topics.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-bg-subtle border border-brand-border text-brand-text">
                  <span>{tag}</span>
                  <button type="button" onClick={() => handleRemoveTopic(tag)} className="text-brand-text-subtle hover:text-brand-danger cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {!isAddingTopic ? (
                <button
                  type="button"
                  onClick={() => setIsAddingTopic(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-brand-primary border border-dashed border-brand-primary/40 hover:bg-brand-primary-light transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Topic</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Enter topic..."
                    value={newTopicInput}
                    onChange={(e) => setNewTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTopic()
                      }
                    }}
                    className="h-8 px-2.5 text-xs rounded-lg border border-brand-primary bg-brand-bg-subtle text-brand-text"
                  />
                  <button type="button" onClick={handleAddTopic} className="h-8 px-3 bg-brand-primary text-white text-xs font-bold rounded-lg cursor-pointer">
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTopic(false)
                      setNewTopicInput('')
                    }}
                    className="text-xs text-brand-text-muted hover:text-brand-text px-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-brand-text">Products Demonstrated</label>
            <div className="flex flex-wrap items-center gap-2">
              {productsDemonstrated.map((p) => (
                <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-bg-subtle border border-brand-border text-brand-text">
                  <span>{p}</span>
                  <button type="button" onClick={() => handleRemoveProduct(p)} className="text-brand-text-subtle hover:text-brand-danger cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {!isAddingProduct ? (
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-brand-primary border border-dashed border-brand-primary/40 hover:bg-brand-primary-light transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Product</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Product name..."
                    value={newProductInput}
                    onChange={(e) => setNewProductInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddProduct()
                      }
                    }}
                    className="h-8 px-2.5 text-xs rounded-lg border border-brand-primary bg-brand-bg-subtle text-brand-text"
                  />
                  <button type="button" onClick={handleAddProduct} className="h-8 px-3 bg-brand-primary text-white text-xs font-bold rounded-lg cursor-pointer">
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(false)
                      setNewProductInput('')
                    }}
                    className="text-xs text-brand-text-muted hover:text-brand-text px-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ATTENDEES */}
          <div className="space-y-3 pt-3 border-t border-brand-border/60">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-brand-text uppercase tracking-wider">
                Attendees ({attendees.length}) <span className="text-brand-danger">*</span>
              </label>
              {attendees.length > 0 && <span className="text-[11px] font-semibold text-brand-primary">{newCount} marked New</span>}
            </div>

            <div className="p-3 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-3">
              <div className="flex bg-brand-border/30 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAttendeeTab('search')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    attendeeTab === 'search' ? 'bg-brand-surface text-brand-primary shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Existing Farmer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttendeeTab('new')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    attendeeTab === 'new' ? 'bg-brand-surface text-brand-primary shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Register New Farmer</span>
                </button>
              </div>

              {attendeeTab === 'search' ? (
                <div className="space-y-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-subtle pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by name or mobile..."
                      value={attendeeSearch}
                      onChange={(e) => setAttendeeSearch(e.target.value)}
                      className="w-full h-9 pl-8 pr-3 text-xs rounded-xl border border-brand-border bg-brand-surface text-brand-text"
                    />
                  </div>
                  {attendeeSearch.trim() && (
                    <div className="border border-brand-border rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-brand-border/60 bg-brand-surface">
                      {searching ? (
                        <div className="p-3 flex items-center justify-center gap-2 text-[11px] text-brand-text-muted">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-3 text-center text-[11px] text-brand-text-muted">No matching farmer found.</div>
                      ) : (
                        searchResults.map((f) => (
                          <button key={f.id} type="button" onClick={() => addAttendee(f)} className="w-full text-left p-2.5 hover:bg-brand-bg-subtle transition-colors cursor-pointer">
                            <span className="text-xs font-bold text-brand-text">{f.name}</span>
                            <div className="text-[10px] text-brand-text-muted mt-0.5">
                              {f.mobile} • {f.village}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleRegisterNewAttendee} className="space-y-2.5 bg-brand-surface p-3 rounded-xl border border-brand-border">
                  {newFarmerError && (
                    <div className="p-2 rounded-lg bg-brand-danger-light border border-brand-danger-border text-brand-danger text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{newFarmerError}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Farmer Name *"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className={`w-full h-8 px-2.5 text-xs rounded-lg border bg-brand-bg-subtle text-brand-text ${newFarmerErrors.name ? 'border-brand-danger' : 'border-brand-border'}`}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="Mobile *"
                        value={newMobile}
                        onChange={(e) => setNewMobile(e.target.value)}
                        className={`w-full h-8 px-2.5 text-xs rounded-lg border bg-brand-bg-subtle text-brand-text ${newFarmerErrors.mobile ? 'border-brand-danger' : 'border-brand-border'}`}
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Village *"
                    value={newVillage}
                    onChange={(e) => setNewVillage(e.target.value)}
                    className={`w-full h-8 px-2.5 text-xs rounded-lg border bg-brand-bg-subtle text-brand-text ${newFarmerErrors.village ? 'border-brand-danger' : 'border-brand-border'}`}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <select value={newGender} onChange={(e) => setNewGender(e.target.value)} className="w-full h-8 px-2 text-xs rounded-lg border border-brand-border bg-brand-bg-subtle text-brand-text">
                      <option value="">Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <input type="number" min="1" max="119" placeholder="Age" value={newAge} onChange={(e) => setNewAge(e.target.value)} className="w-full h-8 px-2.5 text-xs rounded-lg border border-brand-border bg-brand-bg-subtle text-brand-text" />
                    <input type="number" min="0" placeholder="Cattle" value={newCattleCount} onChange={(e) => setNewCattleCount(e.target.value)} className="w-full h-8 px-2.5 text-xs rounded-lg border border-brand-border bg-brand-bg-subtle text-brand-text" />
                  </div>
                  <button type="submit" disabled={newFarmerSubmitting} className="w-full h-8 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-60">
                    {newFarmerSubmitting ? 'Registering…' : 'Register & Add to Session'}
                  </button>
                </form>
              )}
            </div>

            {attendees.length > 0 && (
              <div className="space-y-2">
                {attendees.map((a) => (
                  <div key={a.farmerId} className="p-2.5 rounded-xl bg-brand-surface border border-brand-border flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[120px]">
                      <span className="text-xs font-bold text-brand-text">{a.name}</span>
                      <div className="text-[10px] text-brand-text-muted">{a.village}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5 text-brand-primary" />
                      <input
                        type="number"
                        min="0"
                        value={a.animalsCovered}
                        onChange={(e) => updateAttendee(a.farmerId, { animalsCovered: Number(e.target.value) || 0 })}
                        className="w-16 h-7 px-1.5 text-xs text-center rounded-md border border-brand-border bg-brand-bg-subtle text-brand-text"
                        title="Animals covered"
                      />
                    </div>
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-text cursor-pointer">
                      <input type="checkbox" checked={a.isNewCustomer} onChange={(e) => updateAttendee(a.farmerId, { isNewCustomer: e.target.checked })} className="accent-brand-primary" />
                      New Customer
                    </label>
                    <button type="button" onClick={() => removeAttendee(a.farmerId)} className="p-1 hover:bg-brand-danger-light text-brand-danger rounded-md cursor-pointer transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-brand-border/60">
            <button type="button" onClick={resetForm} className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold text-brand-text-muted hover:bg-brand-bg-subtle cursor-pointer transition-colors">
              Clear Form
            </button>
            <button type="submit" disabled={submitting} className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60">
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Saving…' : 'Save Outreach Session'}</span>
            </button>
          </div>
        </form>
      </div>

      {isLogsModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-text/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-primary" />
                  <span>Outreach Activity Logbook</span>
                </h3>
                <p className="text-xs text-brand-text-muted">Historical village sessions &amp; attendance records</p>
              </div>
              <button onClick={() => setIsLogsModalOpen(false)} className="text-brand-text-subtle hover:text-brand-text cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {logsLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-brand-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Loading…</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="py-8 text-center text-xs text-brand-text-muted">No outreach sessions logged yet.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <h4 className="text-sm font-bold text-brand-text">
                        {log.activityType} — {log.village}
                      </h4>
                      <span className="text-[11px] font-medium text-brand-text-muted">{new Date(log.date).toLocaleDateString('en-IN')}</span>
                    </div>

                    {log.activityBrief && <p className="text-xs text-brand-text-muted">{log.activityBrief}</p>}

                    {log.topicsCovered.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {log.topicsCovered.map((topic) => (
                          <span key={topic} className="px-2 py-0.5 rounded-md bg-brand-primary-light text-brand-primary text-[10px] font-semibold">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-brand-border/60 text-center">
                      <div className="bg-brand-surface p-2 rounded-lg border border-brand-border">
                        <span className="text-[10px] font-bold text-brand-text-muted block uppercase">Attended</span>
                        <span className="text-sm font-extrabold text-brand-text">{log.attended}</span>
                      </div>
                      <div className="bg-brand-surface p-2 rounded-lg border border-brand-border">
                        <span className="text-[10px] font-bold text-brand-primary block uppercase">New Farmers</span>
                        <span className="text-sm font-extrabold text-brand-primary">{log.newFarmers}</span>
                      </div>
                      <div className="bg-brand-surface p-2 rounded-lg border border-brand-border">
                        <span className="text-[10px] font-bold text-brand-warning-dark block uppercase">Animals</span>
                        <span className="text-sm font-extrabold text-brand-warning-dark">{log.animalsCovered}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-brand-border/60 flex justify-end shrink-0">
              <button onClick={() => setIsLogsModalOpen(false)} className="h-9 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold cursor-pointer">
                Close Logbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
