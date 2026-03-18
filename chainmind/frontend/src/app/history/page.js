"use client"
import React, { useEffect, useState } from 'react'
import { Shield, ArrowRight, History, ExternalLink, Trash2, Search, FileText } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function AuditHistory() {
  const [history, setHistory] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem('chainmind_history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const deleteEntry = (id) => {
    const newHistory = history.filter(item => item.id !== id)
    setHistory(newHistory)
    localStorage.setItem('chainmind_history', JSON.stringify(newHistory))
  }

  const filteredHistory = history.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                 <History className="w-6 h-6 text-green-500" />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Audit Archive</h1>
            </div>
            <p className="text-gray-400 font-medium">Manage and review your past smart contract security simulations.</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {filteredHistory.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden bg-black/40 border-white/5"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                      <th className="px-6 py-5">Security Proof</th>
                      <th className="px-6 py-5">Scan Date</th>
                      <th className="px-6 py-5">Risk Status</th>
                      <th className="px-6 py-5">Blockchain Proof</th>
                      <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-green-500/5 transition-all group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center border border-gray-800 text-green-500 group-hover:scale-110 transition-transform">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="block font-bold text-white uppercase tracking-wider text-xs">{item.name}</span>
                                <span className="text-[9px] text-gray-600 font-mono mt-1 block">ID: {item.id.slice(0, 16)}</span>
                              </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-gray-400 text-xs font-medium">{item.date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                              item.risk > 70 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                              item.risk > 30 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
                              'bg-green-500/10 text-green-500 border border-green-500/20'
                          }`}>
                              {item.risk > 70 ? 'CRITICAL' : item.risk > 30 ? 'CAUTION' : 'SECURE'} ({item.risk})
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link 
                            href={`https://sepolia.celoscan.io/tx/${item.tx}`} 
                            target="_blank"
                            className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-green-500 transition-all font-mono"
                          >
                              {item.tx?.slice(0, 10)}... <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={() => deleteEntry(item.id)}
                               className="p-2 text-gray-600 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                             <Link 
                               href={`/results/${item.id}`} 
                               className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white text-[10px] font-bold uppercase rounded-lg transition-all text-white hover:text-black border border-white/10"
                             >
                                View Results <ArrowRight className="w-3 h-3" />
                             </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 space-y-6"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                 <History className="w-10 h-10 text-gray-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-300">No Audits Found</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                  Your audit archive is empty. Start your first security simulation to see it here.
                </p>
              </div>
              <Link href="/" className="inline-flex items-center gap-2 bg-green-500 text-black font-bold px-8 py-3 rounded-xl hover:bg-green-600 transition-all">
                Audit New Contract
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
