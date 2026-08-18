import { useState, useMemo } from 'react'
import { Users, Activity, Search, Filter, Eye, ShieldCheck, CheckCircle2, AlertTriangle, UserPlus } from 'lucide-react'

export default function SettingsTables({ adminUsers, systemActivity, onViewUser, onEditPermissions, onAddUser }) {
  const [activeTab, setActiveTab] = useState('users')

  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('All Roles')

  const [activitySearch, setActivitySearch] = useState('')
  const [activityModuleFilter, setActivityModuleFilter] = useState('All Modules')

  const filteredUsers = useMemo(() => {
    return adminUsers.filter((u) => {
      if (
        userSearch.trim() !== '' &&
        !u.name.toLowerCase().includes(userSearch.toLowerCase()) &&
        !u.email.toLowerCase().includes(userSearch.toLowerCase()) &&
        !(u.department || '').toLowerCase().includes(userSearch.toLowerCase())
      ) {
        return false
      }
      if (userRoleFilter !== 'All Roles' && u.role !== userRoleFilter) {
        return false
      }
      return true
    })
  }, [adminUsers, userSearch, userRoleFilter])

  const filteredActivities = useMemo(() => {
    return systemActivity.filter((act) => {
      if (
        activitySearch.trim() !== '' &&
        !act.action.toLowerCase().includes(activitySearch.toLowerCase()) &&
        !act.user.toLowerCase().includes(activitySearch.toLowerCase()) &&
        !act.module.toLowerCase().includes(activitySearch.toLowerCase())
      ) {
        return false
      }
      if (activityModuleFilter !== 'All Modules' && act.module !== activityModuleFilter) {
        return false
      }
      return true
    })
  }, [systemActivity, activitySearch, activityModuleFilter])

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-xs transition-all duration-200 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-brand-border/60">
        <div className="flex items-center gap-2 p-1 bg-brand-bg-subtle rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-brand-surface text-brand-text shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
            }`}
          >
            <Users className="w-4 h-4 text-brand-primary" />
            <span>Admin Users ({adminUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'activity' ? 'bg-brand-surface text-brand-text shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
            }`}
          >
            <Activity className="w-4 h-4 text-brand-info" />
            <span>System Activity Logs ({systemActivity.length})</span>
          </button>
        </div>

        {activeTab === 'users' && (
          <button
            onClick={onAddUser}
            className="px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Admin User</span>
          </button>
        )}
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-brand-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name, email, or department..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-brand-bg-subtle border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
              <Filter className="w-3.5 h-3.5 text-brand-text-subtle" />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full sm:w-auto bg-brand-bg-subtle border border-brand-border rounded-xl text-xs py-1.5 px-2.5 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="All Roles">All Roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="District Manager">District Manager</option>
                <option value="Auditor">Auditor</option>
                <option value="Mart Manager">Mart Manager</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-brand-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg-subtle text-brand-text-muted font-bold uppercase tracking-wider text-[10px] border-b border-brand-border">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Last Login</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-brand-text-subtle">
                      No admin users found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-brand-bg-subtle/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-brand-text">{u.name}</div>
                        <div className="text-[10px] text-brand-text-subtle truncate max-w-[180px]">{u.department}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.role === 'Super Admin'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : u.role === 'District Manager'
                              ? 'bg-brand-primary-light text-brand-primary-dark border-brand-primary/30'
                              : u.role === 'Auditor'
                              ? 'bg-brand-info-light text-brand-info-dark border-brand-info-border'
                              : 'bg-brand-warning-light text-brand-warning-dark border-brand-warning-border'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-brand-text-muted truncate max-w-[200px]">{u.email}</td>

                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.status === 'Active' ? 'bg-brand-primary-light text-brand-primary-dark' : 'bg-brand-bg-subtle text-brand-text-muted'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-brand-primary' : 'bg-brand-text-subtle'}`} />
                          {u.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-brand-text-muted text-[11px]">{u.lastLogin}</td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewUser(u)}
                            className="p-1.5 rounded-lg hover:bg-brand-bg-subtle text-brand-text-muted cursor-pointer"
                            title="View user details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditPermissions(u)}
                            className="px-2.5 py-1 rounded-lg bg-brand-bg-subtle hover:bg-brand-primary-light text-brand-text text-[11px] font-semibold flex items-center gap-1 border border-brand-border cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3 text-brand-primary" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-brand-text-muted">
            <span>
              Showing {filteredUsers.length} of {adminUsers.length} Users
            </span>
            <span className="font-semibold text-brand-text-subtle">Multi-Factor Auth (MFA): Not configured</span>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-brand-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search action or user..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-brand-bg-subtle border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
              <Filter className="w-3.5 h-3.5 text-brand-text-subtle" />
              <select
                value={activityModuleFilter}
                onChange={(e) => setActivityModuleFilter(e.target.value)}
                className="w-full sm:w-auto bg-brand-bg-subtle border border-brand-border rounded-xl text-xs py-1.5 px-2.5 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="All Modules">All Modules</option>
                <option value="System Settings">System Settings</option>
                <option value="Reports Module">Reports Module</option>
                <option value="Mart Management">Mart Management</option>
                <option value="User Permissions">User Permissions</option>
                <option value="Database Backup">Database Backup</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-brand-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg-subtle text-brand-text-muted font-bold uppercase tracking-wider text-[10px] border-b border-brand-border">
                <tr>
                  <th className="py-2.5 px-3">Date &amp; Time</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Module</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 font-medium">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-brand-text-subtle">
                      No system activity records found.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-brand-bg-subtle/60 transition-colors">
                      <td className="py-2.5 px-3 text-[11px] text-brand-text-muted whitespace-nowrap">{act.dateTime}</td>

                      <td className="py-2.5 px-3 font-semibold text-brand-text whitespace-nowrap">{act.user}</td>

                      <td className="py-2.5 px-3 text-brand-text font-medium">{act.action}</td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-bg-subtle text-brand-text-muted">{act.module}</span>
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            act.status === 'Completed' ? 'bg-brand-primary-light text-brand-primary-dark' : 'bg-brand-warning-light text-brand-warning-dark'
                          }`}
                        >
                          {act.status === 'Completed' ? <CheckCircle2 className="w-3 h-3 text-brand-primary" /> : <AlertTriangle className="w-3 h-3 text-brand-warning-dark" />}
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-brand-text-muted">
            <span>Log Retention: Current session</span>
            <span className="font-medium">System Activity Audit Trail</span>
          </div>
        </div>
      )}
    </div>
  )
}
