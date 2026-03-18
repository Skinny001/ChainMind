import React from 'react'
import { Activity, Shield } from 'lucide-react'
import Link from 'next/link'
import "./globals.css"
import { headers } from 'next/headers'
import ContextProvider from '@/context'
import Navbar from '@/components/Navbar'

export default async function RootLayout({ children }) {
  const headersObj = await headers()
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <ContextProvider cookies={cookies}>
          <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-green-500/30">
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
            
            <footer className="border-t border-gray-800 bg-[#111111] mt-20">
              <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500">Built for Celo</span>
                </div>
                
                <div className="flex gap-8 text-xs text-gray-500 font-medium">
                   <span>© 2026 ChainMind — AI Agentic Security</span>
                   <Link href="#" className="hover:text-gray-300">Privacy Policy</Link>
                   <Link href="#" className="hover:text-gray-300">Terms of Service</Link>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                   <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                   <span>Agent ID: CM-8004-921</span>
                </div>
              </div>
            </footer>
          </div>
        </ContextProvider>
      </body>
    </html>
  )
}
