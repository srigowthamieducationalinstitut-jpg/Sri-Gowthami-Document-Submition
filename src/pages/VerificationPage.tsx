import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { ShieldCheck, Check, X, RefreshCw, ChevronLeft, ChevronRight, MessageSquare, Clock, FileText, AlertCircle, Search, Filter, User } from 'lucide-react'
import { cn, getStatusColor, getStatusLabel, getDocumentTypeLabel, formatDate, formatDateTime, getInitials } from '@/lib/utils'
import { mockVerificationRecords } from '@/data/mockData'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDocumentStore } from '@/store/documentStore'
import type { Document } from '@/types'

// Mock document renderers for premium visuals
const renderMockAadhaar = (studentName: string) => {
  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl border-2 border-emerald-500/30 p-6 shadow-lg relative overflow-hidden font-sans text-slate-800">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b-2 border-orange-400 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-[10px] font-bold">印</div>
          <div>
            <h4 className="text-[10px] font-bold text-emerald-800 leading-tight">भारत सरकार</h4>
            <p className="text-[9px] text-slate-600 font-semibold leading-none">GOVERNMENT OF INDIA</p>
          </div>
        </div>
        <div className="text-right">
          <h4 className="text-[9px] font-bold text-slate-700">भारतीय विशिष्ट पहचान प्राधिकरण</h4>
          <p className="text-[8px] text-slate-500 font-semibold leading-none">UNIQUE IDENTIFICATION AUTHORITY OF INDIA</p>
        </div>
      </div>

      {/* Main Info */}
      <div className="flex gap-4">
        <div className="w-24 h-28 bg-white border border-slate-200 rounded-lg flex flex-col items-center justify-center p-1 shadow-sm shrink-0">
          <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center text-slate-400 relative overflow-hidden">
            <User className="w-12 h-12" />
            <div className="absolute bottom-0 inset-x-0 bg-emerald-600/10 text-emerald-800 text-[8px] font-bold py-0.5 text-center">PHOTO</div>
          </div>
        </div>
        <div className="flex-1 space-y-2 text-xs">
          <div>
            <p className="text-[9px] text-slate-400 font-medium">नाम / Name</p>
            <p className="font-bold text-slate-800">{studentName}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-medium">जन्म तिथि / DOB</p>
            <p className="font-semibold text-slate-700">15/08/2008</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-medium">लिंग / Gender</p>
            <p className="font-semibold text-slate-700">Male</p>
          </div>
        </div>
      </div>

      {/* Footer Aadhaar Number */}
      <div className="mt-5 pt-3 border-t border-slate-200/80 text-center space-y-1">
        <p className="text-sm font-bold tracking-[0.2em] text-slate-800">XXXX XXXX 5892</p>
        <p className="text-[9px] font-bold text-red-600 tracking-wide">मेरा आधार, मेरी पहचान</p>
      </div>

      {/* Security Hologram */}
      <div className="absolute right-4 bottom-4 w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-300 via-emerald-400 to-indigo-500 opacity-60 animate-pulse border border-white" />
    </div>
  )
}

const renderMockMarksMemo = (studentName: string, is12th: boolean) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-amber-50/30 rounded-2xl border border-amber-200/60 p-6 shadow-md relative font-serif text-slate-800">
      {/* Border outline */}
      <div className="absolute inset-2 border-2 border-amber-600/10 rounded-xl pointer-events-none" />
      
      {/* Header */}
      <div className="text-center space-y-1 mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
          {is12th ? 'Board of Intermediate Education' : 'Board of Secondary Education'}
        </h4>
        <p className="text-[10px] text-amber-700 uppercase font-sans font-bold">Andhra Pradesh, India</p>
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 pt-1">
          {is12th ? 'Intermediate Pass Memo' : 'Secondary School Certificate'}
        </h3>
      </div>

      {/* Student details */}
      <div className="grid grid-cols-2 gap-4 text-xs font-sans mb-5 pb-4 border-b border-amber-200/40">
        <div>
          <span className="text-slate-400 block text-[9px] font-medium uppercase">Candidate Name</span>
          <span className="font-bold text-slate-800">{studentName}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[9px] font-medium uppercase">Hall Ticket No.</span>
          <span className="font-mono font-semibold text-slate-700">{is12th ? 'HT202612984' : 'HT202610738'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[9px] font-medium uppercase">Month & Year</span>
          <span className="font-semibold text-slate-700">March 2026</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[9px] font-medium uppercase">Result Status</span>
          <span className="font-bold text-emerald-600">PASS (A GRADE)</span>
        </div>
      </div>

      {/* Marks Table */}
      <table className="w-full text-left border-collapse font-sans text-xs mb-6">
        <thead>
          <tr className="border-b border-amber-200 bg-amber-50">
            <th className="py-2 px-3 text-slate-500 font-bold">Subject</th>
            <th className="py-2 px-3 text-slate-500 font-bold text-center">Max Marks</th>
            <th className="py-2 px-3 text-slate-500 font-bold text-center">Marks Obtained</th>
            <th className="py-2 px-3 text-slate-500 font-bold text-center">Result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-amber-100">
          {is12th ? (
            <>
              <tr>
                <td className="py-2 px-3 font-medium">Mathematics-A</td>
                <td className="py-2 px-3 text-center">75</td>
                <td className="py-2 px-3 text-center font-bold">71</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-semibold">P</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">Mathematics-B</td>
                <td className="py-2 px-3 text-center">75</td>
                <td className="py-2 px-3 text-center font-bold">73</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-semibold">P</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">Physics (Theory)</td>
                <td className="py-2 px-3 text-center">60</td>
                <td className="py-2 px-3 text-center font-bold">54</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-semibold">P</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">Chemistry (Theory)</td>
                <td className="py-2 px-3 text-center">60</td>
                <td className="py-2 px-3 text-center font-bold">56</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-semibold">P</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">English (General)</td>
                <td className="py-2 px-3 text-center">100</td>
                <td className="py-2 px-3 text-center font-bold">89</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-semibold">P</td>
              </tr>
            </>
          ) : (
            <>
              <tr>
                <td className="py-2 px-3 font-medium">First Language (Telugu)</td>
                <td className="py-2 px-3 text-center">100</td>
                <td className="py-2 px-3 text-center font-bold">92</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-semibold">P</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">English</td>
                <td className="py-2 px-3 text-center">100</td>
                <td className="py-2 px-3 text-center font-bold">88</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-semibold">P</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">Mathematics</td>
                <td className="py-2 px-3 text-center">100</td>
                <td className="py-2 px-3 text-center font-bold">98</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-semibold">P</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">Science</td>
                <td className="py-2 px-3 text-center">100</td>
                <td className="py-2 px-3 text-center font-bold">90</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-semibold">P</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">Social Studies</td>
                <td className="py-2 px-3 text-center">100</td>
                <td className="py-2 px-3 text-center font-bold">91</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-semibold">P</td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      {/* Signature and Stamp */}
      <div className="flex justify-between items-end font-sans pt-4 border-t border-amber-200/40">
        <div className="relative flex items-center justify-center w-16 h-16 text-slate-400">
          <div className="absolute inset-0 border border-dashed border-emerald-500 rounded-full flex items-center justify-center opacity-40">
            <span className="text-[6px] text-center font-bold text-emerald-700 leading-none">BOARD OFFICE<br/>SEAL AP</span>
          </div>
        </div>
        <div className="text-right">
          <span className="font-cursive text-slate-500 italic block text-xs">K. V. Subbarao</span>
          <span className="text-[9px] text-slate-400 block uppercase font-bold border-t border-slate-200 pt-1">Controller of Examinations</span>
        </div>
      </div>
    </div>
  )
}

const renderMockTC = (studentName: string, is12th: boolean) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-slate-50 rounded-2xl border border-slate-300 p-6 shadow-md relative font-serif text-slate-800">
      <div className="text-center space-y-1 mb-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          {is12th ? 'Adarsh Junior College' : 'Sri Gowthami English Medium School'}
        </h4>
        <p className="text-[10px] text-slate-500 uppercase font-sans">Affiliated to Board of Education, AP</p>
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 border-b border-slate-300 pb-2">
          TRANSFER CERTIFICATE
        </h3>
      </div>

      <div className="space-y-3 text-xs font-sans">
        <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
          <span className="text-slate-500 font-medium">1. Name of the Pupil</span>
          <span className="font-bold text-slate-800">{studentName}</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
          <span className="text-slate-500 font-medium">2. Father's / Guardian's Name</span>
          <span className="font-semibold text-slate-700">Ramesh Kumar</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
          <span className="text-slate-500 font-medium">3. Date of Birth</span>
          <span className="font-semibold text-slate-700">12/04/2008</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
          <span className="text-slate-500 font-medium">4. Class at leaving</span>
          <span className="font-semibold text-slate-700">{is12th ? 'Class XII (MPC)' : 'Class X'}</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
          <span className="text-slate-500 font-medium">5. Date of Admission</span>
          <span className="font-semibold text-slate-700">15/06/2022</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
          <span className="text-slate-500 font-medium">6. Reason for leaving</span>
          <span className="font-semibold text-slate-700">Completed Course of Study</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
          <span className="text-slate-500 font-medium">7. Character and Conduct</span>
          <span className="font-bold text-emerald-600">Excellent</span>
        </div>
      </div>

      <div className="flex justify-between items-end pt-8 font-sans">
        <div className="w-14 h-14 border border-dashed border-blue-400 rounded-full flex items-center justify-center text-[7px] text-blue-600 font-bold opacity-50 text-center leading-none">
          COLLEGE<br/>STAMP
        </div>
        <div className="text-right">
          <span className="font-cursive italic text-slate-500 block text-xs">M. R. Prasad</span>
          <span className="text-[9px] text-slate-400 block uppercase font-bold border-t border-slate-200 pt-1">Principal Signature</span>
        </div>
      </div>
    </div>
  )
}

const renderMockPassportPhoto = (studentName: string) => {
  return (
    <div className="w-full max-w-xs mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-md font-sans text-center text-slate-800">
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Passport Size Photo</p>
      
      <div className="relative w-40 h-48 mx-auto bg-gradient-to-b from-blue-700 to-blue-900 rounded-xl overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
        {/* Photo Corner anchors */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/40" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/40" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/40" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/40" />
        
        {/* Avatar */}
        <User className="w-24 h-24 text-white/80" />

        {/* Semi-transparent Registrar Seal */}
        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full border-2 border-dashed border-emerald-400/40 flex items-center justify-center text-[5px] font-bold text-emerald-400/40 rotate-12 leading-none">
          REGISTRAR<br/>SEAL
        </div>
      </div>

      <p className="mt-4 font-bold text-sm text-slate-700">{studentName}</p>
      <p className="text-xs text-slate-400 mt-1">Dimensions: 3.5cm x 4.5cm</p>
    </div>
  )
}

const renderMockBonafide = (studentName: string, is12th: boolean) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border-4 border-double border-slate-400 p-8 shadow-md relative font-serif text-slate-800">
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-slate-400" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-slate-400" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-slate-400" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-slate-400" />

      <div className="text-center space-y-1 mb-6 border-b-2 border-slate-200 pb-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          {is12th ? 'Adarsh Junior College' : 'Sri Gowthami Educational Institutions'}
        </h4>
        <p className="text-[8px] text-slate-500 font-sans uppercase">Affiliated to Board of Education, AP</p>
        <p className="text-[9px] text-slate-500 font-sans">Main Road, Visakhapatnam - 530001</p>
      </div>

      <div className="text-center my-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border border-slate-900 px-3 py-1 inline-block">
          BONAFIDE CERTIFICATE
        </h3>
      </div>

      <div className="my-6 text-xs leading-relaxed text-slate-700 text-justify font-sans space-y-3">
        <p>
          This is to certify that Master/Miss <strong className="text-slate-900 border-b border-slate-400 pb-0.5 px-1">{studentName}</strong>, 
          son/daughter of Sri <strong className="text-slate-900 border-b border-slate-400 pb-0.5 px-1">Ramesh Kumar</strong>, 
          is a bonafide student of this institution.
        </p>
        <p>
          He/She studied in Class <strong className="text-slate-900">{is12th ? 'XII (MPC)' : 'X'}</strong> during the academic year <strong>2025 - 2026</strong>.
        </p>
        <p>
          To the best of our knowledge, his/her character and conduct during this period have been <strong className="text-slate-900">Good</strong>.
        </p>
      </div>

      <div className="flex justify-between items-end mt-10 pt-4 font-sans text-xs">
        <div>
          <span className="text-slate-400 block text-[9px] uppercase font-bold">Date</span>
          <span className="font-semibold text-slate-700">22 Jun 2026</span>
        </div>
        <div className="text-right">
          <span className="font-cursive italic text-slate-500 block text-xs">Principal</span>
          <span className="text-[9px] text-slate-400 block uppercase font-bold border-t border-slate-200 pt-1">Authorized Signatory</span>
        </div>
      </div>
    </div>
  )
}

const renderMockMigration = (studentName: string) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-gradient-to-br from-amber-50/20 to-orange-50/20 rounded-2xl border-2 border-dashed border-orange-400/40 p-6 shadow-md relative font-serif text-slate-800">
      <div className="text-center space-y-1 mb-6 border-b border-orange-200 pb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-orange-950">
          Board of Intermediate Education
        </h4>
        <p className="text-[9px] text-orange-700 uppercase font-sans font-bold">Andhra Pradesh, India</p>
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 pt-1">
          MIGRATION CERTIFICATE
        </h3>
      </div>

      <div className="my-6 text-xs leading-relaxed text-slate-700 text-center font-sans space-y-4">
        <p>This is to certify that the Board has no objection to the candidate</p>
        <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">{studentName}</p>
        <p>proceeding with his/her higher studies in any other recognized Board or University in India.</p>
      </div>

      <div className="flex justify-between items-end mt-10 pt-4 border-t border-orange-200/50 font-sans text-xs">
        <div className="w-12 h-12 rounded-full border border-dashed border-orange-400 flex items-center justify-center text-[5px] font-bold text-orange-600/70 rotate-6 leading-none">
          BOARD<br/>SEAL
        </div>
        <div className="text-right">
          <span className="font-cursive italic text-slate-500 block text-xs">K. V. Subbarao</span>
          <span className="text-[9px] text-slate-400 block uppercase font-bold border-t border-slate-200 pt-1">Joint Secretary</span>
        </div>
      </div>
    </div>
  )
}

const renderMockRankCard = (studentName: string) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-indigo-200 p-6 shadow-md font-sans text-slate-800">
      <div className="text-center mb-6">
        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">APEAPCET - 2026</h4>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mt-1">RANK CARD</h3>
      </div>

      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
          <div>
            <p className="text-slate-400 block text-[9px] uppercase font-bold">Candidate Name</p>
            <p className="font-bold text-slate-800">{studentName}</p>
          </div>
          <div>
            <p className="text-slate-400 block text-[9px] uppercase font-bold">Hall Ticket Number</p>
            <p className="font-semibold text-slate-700 font-mono">E268840192</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-center">
          <div>
            <p className="text-[8px] text-indigo-500 font-bold uppercase">Marks</p>
            <p className="text-sm font-bold text-indigo-900 mt-0.5">124 / 160</p>
          </div>
          <div>
            <p className="text-[8px] text-indigo-500 font-bold uppercase">Percentile</p>
            <p className="text-sm font-bold text-indigo-900 mt-0.5">98.42%</p>
          </div>
          <div>
            <p className="text-[8px] text-indigo-500 font-bold uppercase">Status</p>
            <p className="text-xs font-bold text-emerald-600 mt-1 uppercase">Qualified</p>
          </div>
        </div>

        <div className="bg-indigo-600 text-white rounded-xl p-4 text-center">
          <p className="text-[9px] uppercase tracking-wider font-bold opacity-80">State Rank Secured</p>
          <p className="text-2xl font-black tracking-wide mt-1">4,812</p>
        </div>
      </div>
    </div>
  )
}

const renderMockCaste = (studentName: string) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-slate-50 rounded-2xl border border-slate-300 p-6 shadow-md font-sans text-slate-800 text-xs">
      <div className="text-center space-y-1 mb-5">
        <h4 className="font-bold text-slate-900">GOVERNMENT OF ANDHRA PRADESH</h4>
        <p className="text-[9px] text-slate-500 font-semibold uppercase">Revenue Department</p>
        <p className="text-[10px] font-bold text-slate-700 uppercase pt-1">Integrated Caste Certificate</p>
      </div>

      <div className="space-y-3 leading-relaxed text-justify text-slate-700">
        <p>This is to certify that:</p>
        <div className="pl-4 space-y-2">
          <p>1. Candidate Name: <strong className="text-slate-900 uppercase">{studentName}</strong></p>
          <p>2. Father's Name: <strong className="text-slate-900">Ramesh Kumar</strong></p>
          <p>3. Community: <strong className="text-slate-900">OBC (Other Backward Classes)</strong></p>
          <p>4. Sub-caste: <strong className="text-slate-900">BC-B (Yadava)</strong></p>
          <p>5. Native Place: <strong className="text-slate-900">Visakhapatnam, Andhra Pradesh</strong></p>
        </div>
        <p className="pt-2 text-[10px] text-slate-400">This certificate is issued digitally by the Revenue Authority and does not require a physical signature.</p>
      </div>

      <div className="flex justify-between items-end mt-8 pt-4 border-t border-slate-200">
        <div className="w-10 h-10 rounded-full border border-dashed border-red-500 flex items-center justify-center text-[5px] font-bold text-red-500 rotate-6 leading-none">
          GOVT<br/>SEAL
        </div>
        <div className="text-right text-[10px]">
          <p className="font-bold text-slate-700">Tahsildar</p>
          <p className="text-slate-400">Visakhapatnam Urban</p>
        </div>
      </div>
    </div>
  )
}

const renderMockIncome = (studentName: string) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-slate-50 rounded-2xl border border-slate-300 p-6 shadow-md font-sans text-slate-800 text-xs">
      <div className="text-center space-y-1 mb-5">
        <h4 className="font-bold text-slate-900">GOVERNMENT OF ANDHRA PRADESH</h4>
        <p className="text-[9px] text-slate-500 font-semibold uppercase">Revenue Department</p>
        <p className="text-[10px] font-bold text-slate-700 uppercase pt-1">Income Certificate</p>
      </div>

      <div className="space-y-3 leading-relaxed text-justify text-slate-700">
        <p>This is to certify that the annual family income from all sources of:</p>
        <div className="pl-4 space-y-2">
          <p>Candidate Name: <strong className="text-slate-900 uppercase">{studentName}</strong></p>
          <p>Father's Name: <strong className="text-slate-900">Ramesh Kumar</strong></p>
          <p>Address: <strong className="text-slate-900">MIG-42, Lawson's Bay, Visakhapatnam</strong></p>
          <p>Total Family Income: <strong className="text-emerald-700 font-bold">INR 1,80,000/-</strong> (One Lakh Eighty Thousand Rupees Only)</p>
        </div>
        <p className="pt-2 text-[10px] text-slate-400">This certificate is valid for the financial year 2026-2027.</p>
      </div>

      <div className="flex justify-between items-end mt-8 pt-4 border-t border-slate-200">
        <div className="w-10 h-10 rounded-full border border-dashed border-emerald-500 flex items-center justify-center text-[5px] font-bold text-emerald-500 rotate-6 leading-none">
          REVENUE<br/>AP
        </div>
        <div className="text-right text-[10px]">
          <p className="font-bold text-slate-700">Tahsildar</p>
          <p className="text-slate-400">Visakhapatnam Urban</p>
        </div>
      </div>
    </div>
  )
}

const renderMockMedical = (studentName: string) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-md font-sans text-slate-800 text-xs">
      <div className="text-center mb-6">
        <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Medical Fitness Board</h4>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mt-1">CERTIFICATE OF PHYSICAL FITNESS</h3>
      </div>

      <div className="space-y-4">
        <p className="leading-relaxed">
          I do hereby certify that I have examined <strong className="text-slate-900 uppercase">{studentName}</strong>, a candidate for admission to professional colleges, and cannot discover that he/she has any disease, constitutional affection or bodily infirmity.
        </p>

        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Height</span>
            <span className="font-semibold text-slate-700">172 cm</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Weight</span>
            <span className="font-semibold text-slate-700">64 kg</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Blood Group</span>
            <span className="font-bold text-rose-600">B+ (Positive)</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Vision</span>
            <span className="font-semibold text-slate-700">6/6 (Normal)</span>
          </div>
        </div>

        <p className="text-emerald-600 font-bold flex items-center gap-1.5">
          <Check className="w-4 h-4" /> Fit for higher education courses.
        </p>
      </div>

      <div className="flex justify-between items-end mt-8 pt-4 border-t border-slate-100">
        <div>
          <span className="text-[8px] text-slate-400 block uppercase font-bold">Reg. No.</span>
          <span className="font-mono text-slate-500">APMC/58129</span>
        </div>
        <div className="text-right">
          <p className="font-cursive italic text-slate-500 text-xs">Dr. K. S. Rao</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase border-t border-slate-200 pt-1">Civil Surgeon, GH Vizag</p>
        </div>
      </div>
    </div>
  )
}

const renderMockGeneral = (doc: Document) => {
  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-md font-sans text-center text-slate-800">
      <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h4 className="font-bold text-slate-800">{getDocumentTypeLabel(doc.type)}</h4>
      <p className="text-xs text-slate-500 mt-1 font-mono truncate">{doc.fileName}</p>
      
      <div className="mt-6 p-4 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600 text-left border border-slate-100">
        <div className="flex justify-between">
          <span className="font-medium text-slate-400">File Type:</span>
          <span className="font-semibold">{doc.mimeType}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-slate-400">Size:</span>
          <span className="font-semibold">{(doc.fileSize / 1024).toFixed(1)} KB</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-slate-400">Upload Date:</span>
          <span className="font-semibold">{formatDate(doc.uploadedAt)}</span>
        </div>
      </div>
    </div>
  )
}

const renderMockDocument = (doc: Document) => {
  switch (doc.type) {
    case 'aadhaar':
      return renderMockAadhaar(doc.studentName);
    case 'marks_memo_10':
      return renderMockMarksMemo(doc.studentName, false);
    case 'marks_memo_12':
      return renderMockMarksMemo(doc.studentName, true);
    case 'tc_10':
      return renderMockTC(doc.studentName, false);
    case 'tc_12':
      return renderMockTC(doc.studentName, true);
    case 'passport_photo':
      return renderMockPassportPhoto(doc.studentName);
    case 'bonafide_10':
      return renderMockBonafide(doc.studentName, false);
    case 'bonafide_12':
      return renderMockBonafide(doc.studentName, true);
    case 'migration_certificate':
      return renderMockMigration(doc.studentName);
    case 'rank_card':
      return renderMockRankCard(doc.studentName);
    case 'caste_certificate':
      return renderMockCaste(doc.studentName);
    case 'income_certificate':
      return renderMockIncome(doc.studentName);
    case 'medical_certificate':
      return renderMockMedical(doc.studentName);
    default:
      return renderMockGeneral(doc);
  }
}

const renderPreview = (doc: Document) => {
  if (doc.fileUrl && doc.fileUrl.startsWith('data:')) {
    if (doc.mimeType.startsWith('image/')) {
      return (
        <div className="w-full bg-slate-100 flex items-center justify-center p-4 min-h-[400px]">
          <img
            src={doc.fileUrl}
            alt={doc.fileName}
            className="max-w-full max-h-[500px] object-contain rounded-xl shadow-md border border-slate-200"
          />
        </div>
      )
    } else if (doc.mimeType === 'application/pdf') {
      return (
        <div className="w-full h-[550px] bg-slate-100">
          <iframe
            src={doc.fileUrl}
            className="w-full h-full border-0 bg-white"
            title="PDF Preview"
          />
        </div>
      )
    } else {
      return (
        <div className="w-full bg-slate-50 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
          <FileText className="w-16 h-16 text-slate-300 mb-4" />
          <p className="text-sm font-medium text-slate-700">{doc.fileName}</p>
          <p className="text-xs text-slate-400 mt-1">Preview not available for this file type</p>
          <a
            href={doc.fileUrl}
            download={doc.fileName}
            className="mt-4 px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            Download to View
          </a>
        </div>
      )
    }
  }

  return renderMockDocument(doc)
}

export default function VerificationPage() {
  const { documents, fetchDocuments, updateDocumentStatus, addComment } = useDocumentStore()
  const { user } = useAuthStore()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [comment, setComment] = useState('')
  const [nameVerified, setNameVerified] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const queue = useMemo(() => {
    let items = documents.filter(d => d.status !== 'verified')
    if (statusFilter) items = items.filter(d => d.status === statusFilter)
    return items
  }, [statusFilter, documents])

  const selected = queue[selectedIdx] || queue[0]
  const relatedRecords = selected ? mockVerificationRecords.filter(r => r.documentId === selected.id) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Document Verification</h1>
        <p className="text-sm text-slate-400 mt-0.5">{queue.length} documents in queue · Use A to approve, R to reject, N for next</p>
      </motion.div>

      {/* Three column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left: Queue */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input placeholder="Search queue..." className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none">
              <option value="">All Status</option>
              <option value="uploaded">Uploaded</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {queue.map((doc, i) => (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedIdx(i);
                  setNameVerified(false);
                  setComment('');
                }}
                className={cn(
                  'px-4 py-3 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50',
                  selectedIdx === i && 'bg-primary-50 border-l-2 border-l-primary-500'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 truncate">{getDocumentTypeLabel(doc.type)}</span>
                  <span className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-semibold', getStatusColor(doc.status))}>
                    {getStatusLabel(doc.status)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{doc.studentName}</p>
                <p className="text-[10px] text-slate-300 mt-0.5">{formatDate(doc.uploadedAt)}</p>
              </div>
            ))}
            {queue.length === 0 && (
              <div className="p-8 text-center">
                <ShieldCheck className="w-10 h-10 text-emerald-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Queue is empty!</p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Preview */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-semibold text-sm text-slate-800">{getDocumentTypeLabel(selected.type)}</h3>
                  <p className="text-xs text-slate-400">{selected.fileName}</p>
                </div>
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', getStatusColor(selected.status))}>
                  {getStatusLabel(selected.status)}
                </span>
              </div>
              <div className="flex-1 bg-slate-50 flex items-center justify-center p-8 overflow-y-auto max-h-[60vh] min-h-[450px]">
                {renderPreview(selected)}
              </div>
              {/* Navigation */}
              <div className="p-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                <button
                  onClick={() => {
                    setSelectedIdx(Math.max(0, selectedIdx - 1));
                    setNameVerified(false);
                    setComment('');
                  }}
                  disabled={selectedIdx === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-xs text-slate-400">{selectedIdx + 1} of {queue.length}</span>
                <button
                  onClick={() => {
                    setSelectedIdx(Math.min(queue.length - 1, selectedIdx + 1));
                    setNameVerified(false);
                    setComment('');
                  }}
                  disabled={selectedIdx === queue.length - 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-slate-400">Select a document to review</p>
            </div>
          )}
        </div>

        {/* Right: Actions & History */}
        <div className="lg:col-span-4 space-y-4">
          {/* Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
            <h3 className="font-semibold text-sm text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-500" /> Verification Action
            </h3>
            {selected && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-slate-400">Registered Name</p><p className="font-medium text-slate-700">{selected.studentName}</p></div>
                  <div><p className="text-xs text-slate-400">Application</p><p className="font-mono text-xs text-primary-600">{selected.applicationId}</p></div>
                </div>
                
                <label className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={nameVerified}
                    onChange={(e) => setNameVerified(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-blue-300 text-blue-600 focus:ring-blue-500" 
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Verify Student Name</p>
                    <p className="text-xs text-blue-700 mt-0.5">I confirm the name on this document perfectly matches the registered name above.</p>
                  </div>
                </label>

                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add verification notes..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none h-24"
                />
                <div className="space-y-2">
                  <button 
                    disabled={!nameVerified}
                    onClick={() => {
                      updateDocumentStatus(selected.id, 'verified', user?.name || 'Dr. Sharma');
                      if (comment) addComment(selected.id, { documentId: selected.id, userId: user?.id || 'admin_1', userName: user?.name || 'Dr. Sharma', userRole: user?.role || 'verification_officer', content: comment });
                      setComment('');
                      setNameVerified(false);
                      setSelectedIdx(Math.max(0, Math.min(queue.length - 2, selectedIdx)));
                    }}
                    className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" /> Approve Document
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        updateDocumentStatus(selected.id, 'rejected', user?.name || 'Dr. Sharma', comment || 'Please re-upload a clearer copy.');
                        if (comment) addComment(selected.id, { documentId: selected.id, userId: user?.id || 'admin_1', userName: user?.name || 'Dr. Sharma', userRole: user?.role || 'verification_officer', content: comment });
                        setComment('');
                        setNameVerified(false);
                        setSelectedIdx(Math.max(0, Math.min(queue.length - 2, selectedIdx)));
                      }}
                      className="py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                    <button 
                      onClick={() => {
                        updateDocumentStatus(selected.id, 'pending');
                        setComment('');
                        setNameVerified(false);
                      }}
                      className="py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" /> Resubmit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
            <h3 className="font-semibold text-sm text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Verification History
            </h3>
            <div className="space-y-3">
              {relatedRecords.length > 0 ? relatedRecords.map((record) => (
                <div key={record.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                    record.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                    record.status === 'rejected' ? 'bg-rose-100 text-rose-600' :
                    'bg-amber-100 text-amber-600'
                  )}>
                    {record.status === 'approved' ? <Check className="w-3.5 h-3.5" /> :
                     record.status === 'rejected' ? <X className="w-3.5 h-3.5" /> :
                     <RefreshCw className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{record.verifierName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{record.comments}</p>
                    <p className="text-[10px] text-slate-300 mt-1">{formatDateTime(record.verifiedAt)}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-400 text-center py-4">No verification history yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
