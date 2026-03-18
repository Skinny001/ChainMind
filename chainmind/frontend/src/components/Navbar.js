"use client"
import React from 'react'
import { Shield, Github } from 'lucide-react'
import Link from 'next/link'
import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'

export const Navbar = () => {
    const { open } = useAppKit()
    const { address, isConnected } = useAccount()

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-green-500/10 p-2 rounded-lg group-hover:bg-green-500/20 transition-all border border-green-500/20">
                        <Shield className="w-6 h-6 text-green-500" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        Chain<span className="text-green-500">Mind</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold">Features</Link>
                    <Link href="/history" className="text-sm font-medium text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold">My Audits</Link>
                    <Link href="/#security" className="text-sm font-medium text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold">Security</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="https://github.com" target="_blank" className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Github className="w-5 h-5" />
                    </Link>
                    <button 
                        onClick={() => open()}
                        className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-all primary-glow"
                    >
                        {isConnected ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Connect Wallet'}
                    </button>
                    {/* Alternatively, use the built-in component: */}
                    {/* <appkit-button /> */}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
