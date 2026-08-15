import React, { useState, useMemo } from 'react';
import {
  Users,
  Activity,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';
import { AdminUserItem, SystemActivityRecord } from '../../../shared/types';

interface SettingsTablesProps {
  adminUsers: AdminUserItem[];
  systemActivity: SystemActivityRecord[];
  onViewUser: (user: AdminUserItem) => void;
  onEditPermissions: (user: AdminUserItem) => void;
  onAddUser: () => void;
}

export const SettingsTables: React.FC<SettingsTablesProps> = ({
  adminUsers,
  systemActivity,
  onViewUser,
  onEditPermissions,
  onAddUser,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');

  // Users Filters
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('All Roles');

  // Activity Filters
  const [activitySearch, setActivitySearch] = useState<string>('');
  const [activityModuleFilter, setActivityModuleFilter] = useState<string>('All Modules');

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return adminUsers.filter((u) => {
      if (
        userSearch.trim() !== '' &&
        !u.name.toLowerCase().includes(userSearch.toLowerCase()) &&
        !u.email.toLowerCase().includes(userSearch.toLowerCase()) &&
        !(u.department || '').toLowerCase().includes(userSearch.toLowerCase())
      ) {
        return false;
      }
      if (userRoleFilter !== 'All Roles' && u.role !== userRoleFilter) {
        return false;
      }
      return true;
    });
  }, [adminUsers, userSearch, userRoleFilter]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return systemActivity.filter((act) => {
      if (
        activitySearch.trim() !== '' &&
        !act.action.toLowerCase().includes(activitySearch.toLowerCase()) &&
        !act.user.toLowerCase().includes(activitySearch.toLowerCase()) &&
        !act.module.toLowerCase().includes(activitySearch.toLowerCase())
      ) {
        return false;
      }
      if (
        activityModuleFilter !== 'All Modules' &&
        act.module !== activityModuleFilter
      ) {
        return false;
      }
      return true;
    });
  }, [systemActivity, activitySearch, activityModuleFilter]);

  return (
    <div className="bg-white dark:bg-[#121E19] border border-[#DDE6E0] dark:border-[#1E3129] rounded-2xl p-5 shadow-xs transition-all duration-200 space-y-4">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-emerald-900/40">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-emerald-900/40 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Admin Users ({adminUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>System Activity Logs ({systemActivity.length})</span>
          </button>
        </div>

        {activeTab === 'users' && (
          <button
            onClick={onAddUser}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Admin User</span>
          </button>
        )}
      </div>

      {/* ADMIN USERS TAB CONTENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Role Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name, email, or department..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-800 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 rounded-xl text-xs py-1.5 px-2.5 text-slate-800 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All Roles">All Roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="District Manager">District Manager</option>
                <option value="Auditor">Auditor</option>
                <option value="Mart Manager">Mart Manager</option>
              </select>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-emerald-800/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-emerald-900/40 text-slate-500 dark:text-emerald-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-emerald-800/40">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Last Login</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-emerald-500">
                      No admin users found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-emerald-900/20 transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-emerald-400/70 truncate max-w-[180px]">
                          {u.department}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.role === 'Super Admin'
                              ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800'
                              : u.role === 'District Manager'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-700'
                              : u.role === 'Auditor'
                              ? 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800'
                              : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                        {u.email}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {u.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 dark:text-emerald-400/80 text-[11px]">
                        {u.lastLogin}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewUser(u)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-emerald-900/50 text-slate-600 dark:text-emerald-300 cursor-pointer"
                            title="View user details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditPermissions(u)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-800/60 text-slate-700 dark:text-emerald-200 text-[11px] font-semibold flex items-center gap-1 border border-slate-200 dark:border-emerald-800/60 cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
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

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-emerald-400/80">
            <span>Showing {filteredUsers.length} of {adminUsers.length} Users</span>
            <span className="font-semibold text-slate-500 dark:text-emerald-400/70">
              Multi-Factor Auth (MFA): Not configured
            </span>
          </div>
        </div>
      )}

      {/* SYSTEM ACTIVITY TAB CONTENT */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          {/* Search & Module Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search action or user..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-800 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={activityModuleFilter}
                onChange={(e) => setActivityModuleFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/60 rounded-xl text-xs py-1.5 px-2.5 text-slate-800 dark:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

          {/* Table Element */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-emerald-800/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-emerald-900/40 text-slate-500 dark:text-emerald-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-emerald-800/40">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Module</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30 font-medium">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-emerald-500">
                      No system activity records found.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((act) => (
                    <tr
                      key={act.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-emerald-900/20 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 dark:text-emerald-400/80 whitespace-nowrap">
                        {act.dateTime}
                      </td>

                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {act.user}
                      </td>

                      <td className="py-2.5 px-3 text-slate-900 dark:text-white font-medium">
                        {act.action}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-emerald-900/60 text-slate-700 dark:text-emerald-300">
                          {act.module}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            act.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          }`}
                        >
                          {act.status === 'Completed' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          )}
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-emerald-400/80">
            <span>Log Retention: Current session</span>
            <span className="font-medium">System Activity Audit Trail</span>
          </div>
        </div>
      )}
    </div>
  );
};
