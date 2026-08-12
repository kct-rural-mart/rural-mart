import { useState } from 'react'
import { saveOutreachProgram, getOutreachByRuralMart } from '../../lib/newPages/shared/dataServices'
import { Users, Plus, X, CheckCircle2, BookOpen, Check } from 'lucide-react'

export default function OwnerFarmerOutreach() {
  const [sessionLogs, setSessionLogs] = useState(() => {
    const saved = getOutreachByRuralMart('RM-001')
    if (saved && saved.length > 0) {
      return saved.map((o) => ({
        id: o.id,
        title: o.title || o.programName || `${o.activityType || 'Outreach'} - ${o.village || 'Village'}`,
        activityType: o.activityType || 'Village Outreach',
        village: o.village || 'Local Village',
        date: o.date || o.programDate || '—',
        status: o.status?.toUpperCase() || 'COMPLETED',
        description: o.description || '—',
        topics: Array.isArray(o.topics) ? o.topics : Array.isArray(o.topicsCovered) ? o.topicsCovered : typeof o.topicsCovered === 'string' ? [o.topicsCovered] : [],
        attended: o.farmersAttended || o.farmersReached || 0,
        existing: o.existingFarmersCount || 0,
        newLeads: o.newLeadsCount || 0,
      }))
    }
    return []
  })
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false)

  const [activityTypes, setActivityTypes] = useState(['Product Demonstration', 'Soil Health Camp', 'Panchayat Awareness Drive'])
  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [newActivityInput, setNewActivityInput] = useState('')

  const [villages, setVillages] = useState([])
  const [isAddingVillage, setIsAddingVillage] = useState(false)
  const [newVillageInput, setNewVillageInput] = useState('')

  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedActivity, setSelectedActivity] = useState('Product Demonstration')
  const [selectedVillage, setSelectedVillage] = useState('')
  const [description, setDescription] = useState('')
  const [farmersAttended, setFarmersAttended] = useState('')

  const [topics, setTopics] = useState([])
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')

  const [toastMessage, setToastMessage] = useState(null)

  const attendedNumber = parseInt(farmersAttended, 10)
  const isNumeric = !isNaN(attendedNumber)
  const calculatedNewLeads = isNumeric ? Math.round(attendedNumber * 0.35) : 0

  const totalSessions = sessionLogs.length
  const totalFarmersReached = sessionLogs.reduce((acc, curr) => acc + curr.attended, 0)
  const totalNewLeads = sessionLogs.reduce((acc, curr) => acc + curr.newLeads, 0)
  const conversionRate = totalFarmersReached > 0 ? `${((totalNewLeads / totalFarmersReached) * 100).toFixed(1)}%` : '0%'
  const directSalesValue = '₹0'

  const handleAddActivityType = () => {
    if (newActivityInput.trim()) {
      const added = newActivityInput.trim()
      setActivityTypes((prev) => [...prev, added])
      setSelectedActivity(added)
      setNewActivityInput('')
      setIsAddingActivity(false)
    }
  }

  const handleAddVillage = () => {
    if (newVillageInput.trim()) {
      const added = newVillageInput.trim()
      setVillages((prev) => [...prev, added])
      setSelectedVillage(added)
      setNewVillageInput('')
      setIsAddingVillage(false)
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTopics((prev) => prev.filter((t) => t !== tagToRemove))
  }

  const handleAddTag = () => {
    if (newTagInput.trim()) {
      const tagToAdd = newTagInput.trim()
      if (!topics.includes(tagToAdd)) {
        setTopics((prev) => [...prev, tagToAdd])
      }
      setNewTagInput('')
      setIsAddingTag(false)
    }
  }

  const handleClearForm = () => {
    setSessionDate(new Date().toISOString().split('T')[0])
    setSelectedActivity('Product Demonstration')
    setSelectedVillage('')
    setDescription('')
    setFarmersAttended('')
    setTopics([])
    setIsAddingActivity(false)
    setIsAddingVillage(false)
    setIsAddingTag(false)
  }

  const handleSaveSession = (e) => {
    e.preventDefault()

    const formattedDateStr = sessionDate
      ? new Date(sessionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

    const newEntry = {
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
    }

    setSessionLogs((prev) => [newEntry, ...prev])

    saveOutreachProgram({
      id: newEntry.id,
      ruralMartId: 'RM-001',
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
    })

    setToastMessage(`Outreach Session for "${selectedVillage}" saved successfully!`)
    setTimeout(() => setToastMessage(null), 4000)

    handleClearForm()
  }

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-lg border border-white/20 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-primary-light text-brand-primary mb-1.5">
            OUTREACH SESSIONS
          </span>
          <h1 className="text-xl font-bold text-brand-text">Farmer Outreach &amp; Field Sessions</h1>
          <p className="text-xs text-brand-text-muted mt-0.5">Track village training camps, farmer leads, and awareness drives.</p>
        </div>

        <button
          onClick={() => setIsLogsModalOpen(true)}
          className="h-9 px-4 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Outreach Session Logs</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-extrabold">({sessionLogs.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Total Sessions Conducted</span>
          <div className="text-2xl font-extrabold text-brand-text">{totalSessions}</div>
          <span className="text-[11px] font-medium text-brand-text-muted">—</span>
        </div>

        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Total Farmers Reached</span>
          <div className="text-2xl font-extrabold text-brand-primary">{totalFarmersReached.toLocaleString('en-IN')}</div>
          <span className="text-[11px] font-medium text-brand-text-muted">—</span>
        </div>

        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Lead Conversion Rate</span>
          <div className="text-2xl font-extrabold text-brand-info">{conversionRate}</div>
          <span className="text-[11px] font-medium text-brand-text-muted">—</span>
        </div>

        <div className="card-enterprise p-4 space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Direct Field Sales</span>
          <div className="text-2xl font-extrabold text-brand-warning">{directSalesValue}</div>
          <span className="text-[11px] font-medium text-brand-text-muted">—</span>
        </div>
      </div>

      <div className="card-enterprise p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-primary" />
            <h2 className="text-sm font-bold text-brand-text uppercase tracking-wider">Record Village Outreach &amp; Farmer Event</h2>
          </div>
          <span className="text-[11px] font-bold text-brand-warning-dark bg-brand-warning-light px-2.5 py-0.5 rounded-full self-start sm:self-auto">
            Event Verification Required
          </span>
        </div>

        <form onSubmit={handleSaveSession} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-brand-text">
                Session Date <span className="text-brand-danger">*</span>
              </label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-brand-text">
                Activity Type <span className="text-brand-danger">*</span>
              </label>
              {!isAddingActivity ? (
                <select
                  value={selectedActivity}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setIsAddingActivity(true)
                    } else {
                      setSelectedActivity(e.target.value)
                    }
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
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
                    className="flex-1 h-9 px-3 text-xs rounded-xl border border-brand-primary bg-brand-bg-subtle text-brand-text"
                  />
                  <button
                    type="button"
                    onClick={handleAddActivityType}
                    className="h-9 px-3 bg-brand-primary text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-brand-primary-dark"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingActivity(false)
                      setNewActivityInput('')
                    }}
                    className="h-9 px-2.5 border border-brand-border text-xs font-semibold rounded-xl text-brand-text-muted hover:bg-brand-bg-subtle"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-brand-text">
                Village / Gram Panchayat <span className="text-brand-danger">*</span>
              </label>
              {!isAddingVillage ? (
                <select
                  value={selectedVillage}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setIsAddingVillage(true)
                    } else {
                      setSelectedVillage(e.target.value)
                    }
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
                >
                  {villages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                  <option value="__ADD_NEW__">+ Add Village</option>
                </select>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    placeholder="New village name..."
                    value={newVillageInput}
                    onChange={(e) => setNewVillageInput(e.target.value)}
                    className="flex-1 h-9 px-3 text-xs rounded-xl border border-brand-primary bg-brand-bg-subtle text-brand-text"
                  />
                  <button
                    type="button"
                    onClick={handleAddVillage}
                    className="h-9 px-3 bg-brand-primary text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-brand-primary-dark"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingVillage(false)
                      setNewVillageInput('')
                    }}
                    className="h-9 px-2.5 border border-brand-border text-xs font-semibold rounded-xl text-brand-text-muted hover:bg-brand-bg-subtle"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-brand-text">
              Brief Description of Activity <span className="text-brand-danger">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Key highlights, product trials, and farmer feedback..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-brand-text">
                Total Farmers Attended <span className="text-brand-danger">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 65"
                value={farmersAttended}
                onChange={(e) => setFarmersAttended(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-brand-border bg-brand-bg-subtle text-brand-text"
              />
            </div>

            <div className="p-3 rounded-xl bg-brand-primary-light/60 border border-brand-primary/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-primary tracking-wider uppercase block">AUTO CALCULATED NEW POTENTIAL LEADS</span>
                <span className="text-xs text-brand-text-muted">Estimated fresh lead prospects</span>
              </div>
              <div className="text-xl font-extrabold text-brand-primary">
                {calculatedNewLeads > 0 ? `+${calculatedNewLeads}` : calculatedNewLeads} <span className="text-xs font-semibold text-brand-text">New Farmers</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-brand-border/60">
            <label className="block text-xs font-semibold text-brand-text">Topics Covered in Session</label>
            <div className="flex flex-wrap items-center gap-2">
              {topics.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-bg-subtle border border-brand-border text-brand-text"
                >
                  <span>{tag}</span>
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="text-brand-text-subtle hover:text-brand-danger cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}

              {!isAddingTag ? (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-brand-primary border border-dashed border-brand-primary/40 hover:bg-brand-primary-light transition-colors cursor-pointer"
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
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    className="h-8 px-2.5 text-xs rounded-lg border border-brand-primary bg-brand-bg-subtle text-brand-text"
                  />
                  <button type="button" onClick={handleAddTag} className="h-8 px-3 bg-brand-primary text-white text-xs font-bold rounded-lg cursor-pointer">
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTag(false)
                      setNewTagInput('')
                    }}
                    className="text-xs text-brand-text-muted hover:text-brand-text px-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-brand-border/60">
            <button
              type="button"
              onClick={handleClearForm}
              className="h-9 px-4 rounded-xl border border-brand-border text-xs font-semibold text-brand-text-muted hover:bg-brand-bg-subtle cursor-pointer transition-colors"
            >
              Clear Form
            </button>

            <button
              type="submit"
              className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Outreach Session</span>
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
                <p className="text-xs text-brand-text-muted">Historical village sessions &amp; potential lead records</p>
              </div>
              <button onClick={() => setIsLogsModalOpen(false)} className="text-brand-text-subtle hover:text-brand-text cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {sessionLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-brand-text-muted">No outreach sessions logged yet.</div>
              ) : (
                sessionLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl bg-brand-bg-subtle border border-brand-border space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <h4 className="text-sm font-bold text-brand-text">{log.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-brand-text-muted">{log.date}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-success-light text-brand-success">{log.status}</span>
                      </div>
                    </div>

                    <p className="text-xs text-brand-text-muted">{log.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {log.topics.map((topic) => (
                        <span key={topic} className="px-2 py-0.5 rounded-md bg-brand-primary-light text-brand-primary text-[10px] font-semibold">
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-brand-border/60 text-center">
                      <div className="bg-brand-surface p-2 rounded-lg border border-brand-border">
                        <span className="text-[10px] font-bold text-brand-text-muted block uppercase">Attended</span>
                        <span className="text-sm font-extrabold text-brand-text">{log.attended}</span>
                      </div>

                      <div className="bg-brand-surface p-2 rounded-lg border border-brand-border">
                        <span className="text-[10px] font-bold text-brand-text-muted block uppercase">Existing</span>
                        <span className="text-sm font-extrabold text-brand-text">{log.existing}</span>
                      </div>

                      <div className="bg-brand-surface p-2 rounded-lg border border-brand-border">
                        <span className="text-[10px] font-bold text-brand-primary block uppercase">New Leads</span>
                        <span className="text-sm font-extrabold text-brand-primary">+{log.newLeads}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-brand-border/60 flex justify-end shrink-0">
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="h-9 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold cursor-pointer"
              >
                Close Logbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
