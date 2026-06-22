import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Users, BookOpen, Building2, Activity, Settings, Plus, Edit, Trash2, Search,
  Save, Mail, Phone, MessageSquare, Bot, Shield, Clock, Eye, EyeOff, ToggleLeft, ToggleRight
} from 'lucide-react'
import { cn, formatDate, formatDateTime, getInitials } from '@/lib/utils'
import { mockUsers, mockCourses, mockDepartments, mockActivityLogs } from '@/data/mockData'

const tabs = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'logs', label: 'Activity Logs', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Administration</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage system configuration, users, and settings</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['User', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockUsers.filter(u => !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                          {getInitials(user.name)}
                        </div>
                        <span className="font-medium text-slate-700">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{user.email}</td>
                    <td className="px-4 py-3 text-slate-500">{user.phone}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold capitalize',
                        user.role === 'super_admin' ? 'bg-violet-50 text-violet-600' :
                        user.role === 'admission_officer' ? 'bg-primary-50 text-primary-600' :
                        user.role === 'verification_officer' ? 'bg-emerald-50 text-emerald-600' :
                        user.role === 'student' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-50 text-slate-600'
                      )}>
                        {user.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('flex items-center gap-1.5 text-xs font-medium',
                        user.isActive ? 'text-emerald-600' : 'text-slate-400'
                      )}>
                        <div className={cn('w-2 h-2 rounded-full', user.isActive ? 'bg-emerald-500' : 'bg-slate-300')} />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-end mb-4">
            <button className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
              <Plus className="w-4 h-4" /> Add Course
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCourses.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{course.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{course.code}</p>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold',
                    course.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  )}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-500 mb-4">
                  <div className="flex justify-between"><span>Department</span><span className="text-slate-700 font-medium">{course.departmentName}</span></div>
                  <div className="flex justify-between"><span>Duration</span><span className="text-slate-700">{course.duration}</span></div>
                  <div className="flex justify-between"><span>Fee</span><span className="text-slate-700 font-medium">₹{course.fee.toLocaleString()}</span></div>
                </div>
                {/* Seats bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Seats Filled</span>
                    <span>{course.filledSeats}/{course.totalSeats}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(course.filledSeats / course.totalSeats) * 100}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button className="flex-1 py-2 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">Edit</button>
                  <button className="flex-1 py-2 text-xs font-medium text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">Delete</button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-end mb-4">
            <button className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockDepartments.map((dept, i) => (
              <motion.div key={dept.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm card-hover"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{dept.name}</h3>
                    <p className="text-xs text-slate-400">{dept.headOfDept}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-primary-700">{dept.totalCourses}</p>
                    <p className="text-[10px] text-primary-500">Courses</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-emerald-700">{dept.totalStudents}</p>
                    <p className="text-[10px] text-emerald-500">Students</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'logs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['Timestamp', 'User', 'Role', 'Action', 'Entity', 'Details'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockActivityLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-[9px] font-bold">
                          {getInitials(log.userName)}
                        </div>
                        <span className="text-sm text-slate-700">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400 capitalize">{log.userRole.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        log.action.includes('creat') || log.action.includes('add') ? 'bg-primary-50 text-primary-600' :
                        log.action.includes('approv') ? 'bg-emerald-50 text-emerald-600' :
                        log.action.includes('reject') || log.action.includes('delet') ? 'bg-rose-50 text-rose-600' :
                        log.action.includes('login') ? 'bg-violet-50 text-violet-600' :
                        'bg-amber-50 text-amber-600'
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 capitalize">{log.entityType}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* General */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-500" /> General Settings
            </h3>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Institution Name</label>
                <input defaultValue="Sri Gowthami Educational Institutions" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Contact Email</label>
                <input defaultValue="admissions@srigowthami.edu.in" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Contact Phone</label>
                <input defaultValue="+91 98765 43210" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-500" /> Notification Settings
            </h3>
            <div className="space-y-4 max-w-lg">
              {[
                { label: 'Email Notifications', desc: 'Send email for status updates', enabled: true, icon: Mail },
                { label: 'SMS Notifications', desc: 'Send SMS alerts to students', enabled: true, icon: Phone },
                { label: 'WhatsApp Notifications', desc: 'WhatsApp messages for updates', enabled: false, icon: MessageSquare },
                { label: 'Auto Reminders', desc: 'Auto-remind for pending documents', enabled: true, icon: Clock },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <s.icon className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{s.label}</p>
                      <p className="text-xs text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                  <div className={cn('w-10 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors',
                    s.enabled ? 'bg-primary-500 justify-end' : 'bg-slate-200 justify-start'
                  )}>
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-500" /> AI Assistant Settings
            </h3>
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Enable AI Assistant</p>
                    <p className="text-xs text-slate-400">Show floating AI chat on all pages</p>
                  </div>
                </div>
                <div className="w-10 h-6 rounded-full bg-primary-500 flex items-center justify-end px-0.5 cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Welcome Message</label>
                <textarea defaultValue="Hello! I'm your AI assistant for Sri Gowthami admissions. How can I help you today?"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none h-20" />
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
