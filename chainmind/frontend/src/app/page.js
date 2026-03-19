"use client"
import React, { useState } from 'react'
import { Upload, Shield, Zap, Lock, DollarSign, ArrowRight, Loader2, CheckCircle2, History, ExternalLink } from 'lucide-react'
import { useAccount, useSwitchChain } from 'wagmi'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { ethers } from 'ethers'
import { payForAudit } from '@/lib/web3'

export default function Home() {
  const router = useRouter()
  const { isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('idle') // idle, paying, uploading, analyzing
  const [status, setStatus] = useState("")

  const CELO_SEPOLIA_ID = 11142220
  const isWrongChain = isConnected && chainId !== CELO_SEPOLIA_ID

  const [history, setHistory] = React.useState([])

  React.useEffect(() => {
    const saved = localStorage.getItem('chainmind_history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return

    try {
      setLoading(true)
      setStatus("Initializing Payment...")
      setStep('paying')
      
      // Compute a simple hash for the contract file
      const text = await file.text()
      const contractHash = ethers.sha256(ethers.toUtf8Bytes(text))
      
      setStatus("Waiting for USDC Payment...")
      const paymentId = await payForAudit(contractHash)
      console.log("Payment successful! ID:", paymentId)
      
      setStatus("Parsing contract...")
      setStep('uploading')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('payment_id', paymentId)

      let pIdx = 0;
      const fakePhases = ['analyzing', 'simulating'];
      const pInterval = setInterval(() => {
        if (pIdx < fakePhases.length) {
          setStep(fakePhases[pIdx])
          pIdx++
        }
      }, 5000);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/simulate`, formData)
      
      clearInterval(pInterval)
      setStep('recording')
      
      const simId = response.data.simulation_id
      localStorage.setItem(`chainmind_sim_${simId}`, JSON.stringify(response.data))

      // Update Audit History
      const history = JSON.parse(localStorage.getItem('chainmind_history') || '[]')
      const newEntry = {
        id: simId,
        name: response.data.contract_name || file.name,
        date: new Date().toLocaleDateString(),
        risk: response.data.risk_score || 0,
        tx: response.data.on_chain_tx
      }
      localStorage.setItem('chainmind_history', JSON.stringify([newEntry, ...history].slice(0, 10)))
      
      setTimeout(() => {
        router.push(`/results/${simId}`)
      }, 1500)

    } catch (err) {
      console.error(err)
      setStatus(err.message || "Simulation failed. Check console.")
      setStep('idle')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-20">
      {/* Hero */}
      <div className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold uppercase tracking-widest animate-pulse-slow">
            <Activity className="w-3 h-3" />
            AI Auditor Online — Celo Sepolia
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
          Autonomous Security <br />
          <span className="gradient-text">powered by AI.</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
          Upload any Solidity contract. ChainMind's agentic AI detects bugs, simulates 1,000+ attacks, and records the results immutably on Celo.
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <DollarSign className="w-4 h-4" />
                <span>1 USDC PER AUDIT</span>
             </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-8">
            <div className="border-2 border-dashed border-gray-800 rounded-xl p-12 text-center group hover:border-green-500/50 transition-all cursor-pointer relative bg-black/20">
              <input 
                type="file" 
                accept=".sol"
                disabled={!isConnected || isWrongChain}
                onChange={(e) => setFile(e.target.files[0])}
                className={`absolute inset-0 w-full h-full opacity-0 z-10 ${(!isConnected || isWrongChain) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              />
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform border border-gray-800 group-hover:border-green-500/30">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {file ? file.name : "Upload Contract"}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : "Drop your .sol file here"}
                  </p>
                </div>
              </div>
            </div>

            {loading && (
              <div className="space-y-4 bg-black/40 rounded-xl p-6 border border-gray-800 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 h-full w-1 bg-green-500 shadow-[0_0_15px_#22c55e]"></div>
                {[
                  { id: 'paying', text: 'Initializing USDC Payment...' },
                  { id: 'uploading', text: 'Parsing & compiling contract...' },
                  { id: 'analyzing', text: 'Gemini AI vulnerability analysis...' },
                  { id: 'simulating', text: 'Groq simulating 10,000 txs in Foundry...' },
                  { id: 'recording', text: 'Recording final result on Celo registry...' }
                ].map((s, idx) => {
                  const stepIndex = ['idle', 'paying', 'uploading', 'analyzing', 'simulating', 'recording'].indexOf(step);
                  const currentIdx = stepIndex - 1; // Since idle is 0
                  const isPast = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={s.id} className={`flex items-center gap-4 text-sm font-bold transition-all ${isPast ? 'text-green-500' : isCurrent ? 'text-white' : 'text-gray-600'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-colors ${isPast ? 'bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : isCurrent ? 'bg-white/10 border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.2)] animate-pulse' : 'bg-transparent border-gray-600'}`}>
                        {isPast ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      {s.text}
                    </div>
                  )
                })}
              </div>
            )}

            <button 
              type={(!isConnected || isWrongChain) ? "button" : "submit"}
              onClick={() => {
                if (!isConnected) return // Handled by standard layout connect button usually, but safe here
                if (isWrongChain) switchChain({ chainId: CELO_SEPOLIA_ID })
              }}
              disabled={loading || (isConnected && !isWrongChain && !file)}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                !isConnected ? 'bg-orange-500 hover:bg-orange-600 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]' :
                isWrongChain ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
                !file ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 
                loading ? 'bg-green-500/20 text-green-500 animate-pulse' : 
                'bg-green-500 hover:bg-green-600 text-black primary-glow transform hover:-translate-y-1'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Security Proof...
                </>
              ) : !isConnected ? (
                <>
                   <Lock className="w-5 h-5" />
                   Connect Wallet to Audit
                </>
              ) : isWrongChain ? (
                <>
                   <Zap className="w-5 h-5" />
                   Switch to Celo Sepolia
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Audit with ChainMind
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-gray-600">
               Secured by SelfClaw human-backed ZK proofs. Results are immutably logged on SimulationRegistry.
            </p>
          </form>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
        <div className="glass-card p-8 hover:border-green-500/30 transition-all">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 border border-green-500/20">
            <Zap className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-bold mb-3">AI Sim Simulation</h3>
          <p className="text-gray-400 text-sm leading-relaxed font-medium">
            Generates 1,000+ realistic user transactions with Llama 3 via Groq to stress test every function.
          </p>
        </div>
        
        <div className="glass-card p-8 hover:border-green-500/30 transition-all">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 border border-green-500/20">
            <Lock className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-bold mb-3">Vulnerability Detection</h3>
          <p className="text-gray-400 text-sm leading-relaxed font-medium">
            Gemini 2.0 Flash identifies reentrancy, flash loans, and logic flaws with surgical precision.
          </p>
        </div>
        
        <div className="glass-card p-8 hover:border-green-500/30 transition-all">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 border border-green-500/20">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-bold mb-3">On-Chain Reputation</h3>
          <p className="text-gray-400 text-sm leading-relaxed font-medium">
            ERC-8004 agent identity ensures all results are authentic and the agent builds reputation per audit.
          </p>
        </div>
      </div>

    </div>
  )
}

function Activity({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
    )
}
