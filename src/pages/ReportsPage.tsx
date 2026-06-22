import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { FileText, ShieldCheck, Clock, Users, Download, FileSpreadsheet, FileDown, Calendar, BarChart3, Printer, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { cn, formatDate } from '@/lib/utils'
import { useApplicationStore } from '@/store/applicationStore'
import { departmentWiseData } from '@/data/mockData'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

const reportTypes = [
  { id: 'admission', label: 'Admission Report', desc: 'Applications and admission statistics', icon: BarChart3, color: 'bg-primary-50 text-primary-600 border-primary-200' },
  { id: 'verification', label: 'Verification Report', desc: 'Document verification status summary', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 'pending', label: 'Pending Documents', desc: 'Outstanding and incomplete documents', icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'student', label: 'Student Summary', desc: 'Complete student data overview', icon: Users, color: 'bg-violet-50 text-violet-600 border-violet-200' },
]

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('2026-01-01')
  const [dateTo, setDateTo] = useState('2026-06-15')

  const { applications, fetchApplications } = useApplicationStore()

  useEffect(() => {
    fetchApplications()
  }, [])

  const reportData = applications.map(a => ({
    'Application #': a.applicationNumber,
    'Student Name': a.studentName,
    'Course': a.courseName,
    'Department': a.departmentName,
    'Status': a.status.replace(/_/g, ' '),
    'Date': formatDate(a.createdAt),
    'Email': a.studentEmail,
    'Phone': a.studentPhone,
  }))

  const statusCounts = [
    { name: 'Submitted', value: applications.filter(a => a.status === 'submitted').length },
    { name: 'Under Review', value: applications.filter(a => a.status === 'under_review').length },
    { name: 'Approved', value: applications.filter(a => a.status === 'approved').length },
    { name: 'Rejected', value: applications.filter(a => a.status === 'rejected').length },
    { name: 'Completed', value: applications.filter(a => a.status === 'admission_completed').length },
  ]

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Sri Gowthami - Admission Report', 14, 22)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} | Period: ${dateFrom} to ${dateTo}`, 14, 32)
    doc.setFontSize(8)
    let y = 45
    doc.setFont('helvetica', 'bold')
    doc.text('App #', 14, y); doc.text('Student', 45, y); doc.text('Course', 100, y); doc.text('Status', 150, y); doc.text('Date', 180, y)
    doc.setFont('helvetica', 'normal')
    reportData.slice(0, 25).forEach(row => {
      y += 7
      if (y > 280) { doc.addPage(); y = 20 }
      doc.text(row['Application #'], 14, y)
      doc.text(row['Student Name'].substring(0, 25), 45, y)
      doc.text(row['Course'].substring(0, 25), 100, y)
      doc.text(row['Status'], 150, y)
      doc.text(row['Date'], 180, y)
    })
    doc.save('sri-gowthami-report.pdf')
  }

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Report')
    XLSX.writeFile(wb, 'sri-gowthami-report.xlsx')
  }

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(reportData)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'sri-gowthami-report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-sm text-slate-400 mt-0.5">Generate and export institutional reports</p>
      </motion.div>

      {/* Report Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((r, i) => (
          <motion.button
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedReport(r.id)}
            className={cn(
              'p-5 rounded-2xl border text-left transition-all card-hover',
              selectedReport === r.id ? 'ring-2 ring-primary-500 shadow-md' : '',
              r.color
            )}
          >
            <r.icon className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="font-semibold text-sm mb-1">{r.label}</h3>
            <p className="text-xs opacity-70">{r.desc}</p>
          </motion.button>
        ))}
      </div>

      {selectedReport && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Filters & Export */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={exportPDF} className="px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-medium hover:bg-rose-100 flex items-center gap-1.5 transition-colors">
                  <FileDown className="w-4 h-4" /> PDF
                </button>
                <button onClick={exportExcel} className="px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-sm font-medium hover:bg-emerald-100 flex items-center gap-1.5 transition-colors">
                  <FileSpreadsheet className="w-4 h-4" /> Excel
                </button>
                <button onClick={exportCSV} className="px-4 py-2.5 bg-primary-50 text-primary-600 border border-primary-200 rounded-xl text-sm font-medium hover:bg-primary-100 flex items-center gap-1.5 transition-colors">
                  <Download className="w-4 h-4" /> CSV
                </button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {statusCounts.map((s, i) => (
              <div key={s.name} className="bg-white rounded-xl border border-slate-200/60 p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.name}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Department Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={departmentWiseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                    {statusCounts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Report Data</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {['App #', 'Student', 'Course', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.slice(0, 15).map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-primary-600">{row['Application #']}</td>
                      <td className="px-4 py-3 text-slate-700">{row['Student Name']}</td>
                      <td className="px-4 py-3 text-slate-500">{row['Course']}</td>
                      <td className="px-4 py-3 capitalize text-slate-600">{row['Status']}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{row['Date']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
