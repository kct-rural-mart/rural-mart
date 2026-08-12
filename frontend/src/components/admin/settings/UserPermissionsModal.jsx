import { useState, useEffect } from 'react'
import { X, ShieldCheck, Check, Save, UserCheck, Mail, Building, KeyRound } from 'lucide-react'

const ALL_PERMISSIONS = [
  { id: 'view_overview', label: 'View Executive Dashboard', category: 'General' },
  { id: 'view_finance', label: 'Access Business & Finance Data', category: 'Finance' },
  { id: 'edit_finance', label: 'Modify Grants & Capital Allocations', category: 'Finance' },
  { id: 'view_inventory', label: 'Inspect Products & Stock Levels', category: 'Inventory' },
  { id: 'manage_inventory', label: 'Update Stock Thresholds & Reorders', category: 'Inventory' },
  { id: 'view_outreach', label: 'Access Farmers & SHG Outreach Records', category: 'Outreach' },
  { id: 'approve_marts', label: 'Approve New Rural Mart Onboarding', category: 'Mart Operations' },
  { id: 'export_reports', label: 'Compile & Download Official Reports', category: 'Reports' },
  { id: 'manage_users', label: 'Manage Admin Users & System Roles', category: 'Admin' },
  { id: 'system_backup', label: 'Trigger Database Backups & Restores', category: 'Admin' },
]

const DEFAULT_PERMISSIONS = ['view_overview', 'view_finance', 'view_inventory', 'view_outreach', 'export_reports']

export default function UserPermissionsModal({ isOpen, onClose, user, mode, onSaveUser }) {
  const [formData, setFormData] = useState({
    id: `usr-${Date.now()}`,
    name: '',
    role: 'District Manager',
    email: '',
    status: 'Active',
    lastLogin: 'Never',
    department: '',
    phone: '',
  })

  const [selectedPermissions, setSelectedPermissions] = useState(DEFAULT_PERMISSIONS)

  useEffect(() => {
    if (user) {
      setFormData(user)
      if (user.role === 'Super Admin') {
        setSelectedPermissions(ALL_PERMISSIONS.map((p) => p.id))
      } else if (user.role === 'Auditor') {
        setSelectedPermissions(['view_overview', 'view_finance', 'export_reports'])
      } else {
        setSelectedPermissions(DEFAULT_PERMISSIONS)
      }
    } else {
      setFormData({
        id: `usr-${Date.now()}`,
        name: '',
        role: 'District Manager',
        email: '',
        status: 'Active',
        lastLogin: 'Never',
        department: '',
        phone: '',
      })
      setSelectedPermissions(DEFAULT_PERMISSIONS)
    }
  }, [user, mode, isOpen])

  if (!isOpen) return null

  const togglePermission = (id) => {
    if (mode === 'view') return
    setSelectedPermissions((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }))
    if (role === 'Super Admin') {
      setSelectedPermissions(ALL_PERMISSIONS.map((p) => p.id))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      alert('Please fill out Name and Email.')
      return
    }
    onSaveUser(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-text/60 backdrop-blur-xs">
      <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-5 border-b border-brand-border/60 flex items-center justify-between bg-brand-bg-subtle sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-primary-light text-brand-primary-dark">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-text">
                {mode === 'add' ? 'Add New Admin User' : mode === 'edit' ? `Edit Access Matrix — ${formData.name}` : `User Profile & Access Scope — ${formData.name}`}
              </h3>
              <p className="text-xs text-brand-text-muted">
                {mode === 'add' ? 'Provision credentials & assign Role-Based Access Control (RBAC)' : 'Manage module-level permissions and regional operational scope'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl hover:bg-brand-border/40 text-brand-text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Full Name *</label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-brand-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={mode === 'view'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full pl-9 pr-3 py-2 bg-brand-bg-subtle border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-70"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Official Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled={mode === 'view'}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@ruralmart.in"
                  className="w-full pl-9 pr-3 py-2 bg-brand-bg-subtle border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-70"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Assigned Role *</label>
              <select
                disabled={mode === 'view'}
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-3 py-2 bg-brand-bg-subtle border border-brand-border rounded-xl text-xs font-medium text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-70"
              >
                <option value="Super Admin">Super Admin (Full Administrative Authority)</option>
                <option value="District Manager">District Manager (Regional Supervision)</option>
                <option value="Auditor">Auditor (Compliance & Read-Only Audit)</option>
                <option value="Mart Manager">Mart Manager (Outpost Inventory & Sales)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">Department / Cell</label>
              <div className="relative">
                <Building className="w-4 h-4 text-brand-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={mode === 'view'}
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Regional Office"
                  className="w-full pl-9 pr-3 py-2 bg-brand-bg-subtle border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-70"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-brand-primary" />
                Module Permissions Matrix ({selectedPermissions.length} Granted)
              </h4>

              {mode !== 'view' && (
                <button
                  type="button"
                  onClick={() => setSelectedPermissions(selectedPermissions.length === ALL_PERMISSIONS.length ? [] : ALL_PERMISSIONS.map((p) => p.id))}
                  className="text-[11px] font-bold text-brand-primary hover:underline"
                >
                  {selectedPermissions.length === ALL_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {ALL_PERMISSIONS.map((perm) => {
                const isSelected = selectedPermissions.includes(perm.id)
                return (
                  <div
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isSelected ? 'bg-brand-primary-light border-brand-primary/40 text-brand-primary-dark font-semibold' : 'bg-brand-bg-subtle border-brand-border text-brand-text-muted'
                    } ${mode !== 'view' ? 'cursor-pointer hover:border-brand-primary/60' : ''}`}
                  >
                    <div>
                      <p className="text-xs">{perm.label}</p>
                      <span className="text-[10px] text-brand-text-subtle font-normal">Category: {perm.category}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                        isSelected ? 'bg-brand-primary text-white border-brand-primary' : 'border-brand-border bg-brand-surface'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-brand-bg-subtle text-brand-text text-xs font-semibold hover:bg-brand-border/40 transition-colors"
            >
              {mode === 'view' ? 'Close' : 'Cancel'}
            </button>

            {mode !== 'view' && (
              <button type="submit" className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
                <Save className="w-4 h-4" />
                <span>{mode === 'add' ? 'Create User' : 'Save Permissions'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
