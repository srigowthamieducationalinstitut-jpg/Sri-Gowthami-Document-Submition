import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { FileText, ShieldCheck, Clock, XCircle, CalendarDays, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, ChevronRight, CheckCircle2, AlertCircle, User, FolderOpen } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar, Legend } from 'recharts'
import { useAuthStore } from '@/store/authStore'
import { useApplicationStore } from '@/store/applicationStore'
import { useDocumentStore } from '@/store/documentStore'
import { admissionTrendData, departmentWiseData, verificationProgressData, recentActivities } from '@/data/mockData'
import { cn, formatRelativeTime, getInitials } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'

// Animated counter hook
function useCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

// Stat Card
function StatCard({ title, value, change, icon: Icon, gradient, delay = 0 }: {
  title: string; value: number; change: number; icon: React.ComponentType<{ className?: string }>; gradient: string; delay?: number
}) {
  const animatedValue = useCounter(value)
  const isPositive = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      className="bg-white rounded-2xl border border-slate-200/60 p-5 card-hover shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg', gradient)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
          isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        )}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{animatedValue.toLocaleString()}</p>
      <p className="text-sm text-slate-400 mt-0.5">{title}</p>
    </motion.div>
  )
}

// Custom Tooltip for charts
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 px-4 py-2.5">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-800">{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#f43f5e']

const tasks = [
  { title: 'Review B.Tech CSE applications', count: 12, priority: 'high', due: 'Due today' },
  { title: 'Verify transfer certificates batch', count: 8, priority: 'medium', due: 'Due tomorrow' },
  { title: 'Send admission letters', count: 15, priority: 'high', due: 'Due today' },
  { title: 'Monthly admission report', count: 1, priority: 'low', due: 'Due in 3 days' },
  { title: 'Update course fee structure', count: 0, priority: 'medium', due: 'Due in 5 days' },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { applications, fetchApplications, isLoading: appsLoading } = useApplicationStore()
  const { documents, fetchDocuments, isLoading: docsLoading } = useDocumentStore()

  useEffect(() => {
    fetchApplications()
    fetchDocuments()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isLoading = appsLoading || docsLoading

  const totalApps = applications.length
  const verifiedApps = applications.filter(a => a.status === 'approved' || a.status === 'admission_completed').length
  const pendingDocs = documents.filter(d => d.status === 'pending' || d.status === 'uploaded').length
  const rejectedApps = applications.filter(a => a.status === 'rejected').length
  
  const todayApps = applications.filter(a => {
    const today = new Date().toDateString();
    return new Date(a.createdAt).toDateString() === today;
  }).length

  const monthlyApps = applications.filter(a => {
    const appDate = new Date(a.createdAt);
    const now = new Date();
    return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
  }).length

  const dynamicStatusData = [
    { name: 'Submitted', value: applications.filter(a => a.status === 'submitted').length, color: '#3B82F6' },
    { name: 'Under Review', value: applications.filter(a => a.status === 'under_review').length, color: '#F59E0B' },
    { name: 'Approved', value: verifiedApps, color: '#10B981' },
    { name: 'Rejected', value: rejectedApps, color: '#F43F5E' },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  if (!isLoading && applications.length === 0 && documents.length === 0) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-800">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
        </motion.div>
        <EmptyState
          icon={FolderOpen}
          title="No data available yet"
          description="Applications and documents will appear here once data is loaded from the system."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Here's what's happening with your institution today, {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Applications" value={totalApps} change={12.5} icon={FileText} gradient="gradient-primary" delay={0} />
        <StatCard title="Verified" value={verifiedApps} change={8.2} icon={ShieldCheck} gradient="gradient-emerald" delay={1} />
        <StatCard title="Pending Docs" value={pendingDocs} change={-3.1} icon={Clock} gradient="gradient-amber" delay={2} />
        <StatCard title="Rejected" value={rejectedApps} change={-15.2} icon={XCircle} gradient="gradient-rose" delay={3} />
        <StatCard title="Today's Submissions" value={todayApps} change={22.4} icon={CalendarDays} gradient="gradient-primary" delay={4} />
        <StatCard title="Monthly Admissions" value={monthlyApps} change={5.8} icon={TrendingUp} gradient="gradient-emerald" delay={5} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admission Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-800">Admission Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly applications over 12 months</p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 rounded-lg text-xs font-medium text-emerald-600">
              <ArrowUpRight className="w-3 h-3" /> 12.5%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={admissionTrendData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Application Status Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="font-semibold text-slate-800">Application Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">Current distribution of all applications</p>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={dynamicStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {dynamicStatusData.map((_, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => <span className="text-xs text-slate-600 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Department Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="font-semibold text-slate-800">Department-wise Applications</h3>
            <p className="text-xs text-slate-400 mt-0.5">Application count by department</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={departmentWiseData} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Verification Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="font-semibold text-slate-800">Verification Progress</h3>
            <p className="text-xs text-slate-400 mt-0.5">Document verification completion rates</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={verificationProgressData} startAngle={180} endAngle={0}>
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => <span className="text-xs text-slate-600 ml-1">{value}</span>}
              />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-500" /> Recent Activity
            </h3>
            <button className="text-xs text-primary-500 font-medium hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {recentActivities.slice(0, 6).map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                  activity.action === 'created' || activity.action === 'uploaded' ? 'bg-primary-100 text-primary-600' :
                  activity.action === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                  activity.action === 'rejected' ? 'bg-rose-100 text-rose-600' :
                  'bg-amber-100 text-amber-600'
                )}>
                  {activity.action === 'created' || activity.action === 'uploaded' ? <FileText className="w-3.5 h-3.5" /> :
                   activity.action === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                   activity.action === 'rejected' ? <XCircle className="w-3.5 h-3.5" /> :
                   <AlertCircle className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-slate-500">{activity.action}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(activity.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-500" /> Upcoming Tasks
            </h3>
            <span className="text-xs text-slate-400 font-medium">{tasks.length} tasks</span>
          </div>
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 group-hover:text-slate-900">{task.title}
                    {task.count > 0 && <span className="text-slate-400"> ({task.count})</span>}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{task.due}</p>
                </div>
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
                  task.priority === 'high' ? 'bg-rose-50 text-rose-500' :
                  task.priority === 'medium' ? 'bg-amber-50 text-amber-500' :
                  'bg-slate-50 text-slate-400'
                )}>
                  {task.priority}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
