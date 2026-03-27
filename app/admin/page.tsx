'use client'

import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from "react"
import Link from 'next/link'

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated' || (session && (session.user as any).role !== 'admin')) {
      router.push('/')
      return
    }

    if (session && (session.user as any).role === 'admin') {
      fetch('/api/admin/stats')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats(data.data)
          }
          setLoading(false)
        })
    }
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Admin...</div>
  }

  if (!session || (session.user as any).role !== 'admin') {
    return null
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Platform overview and moderation tools.</p>
          </div>
          <div className="bg-red-900/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
            🛡️ God Mode Active
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-inner">
            <h3 className="text-slate-500 font-bold mb-1 uppercase tracking-wider text-sm">Total Users</h3>
            <p className="text-4xl font-black text-white">{stats?.totalUsers || 0}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-inner">
            <h3 className="text-slate-500 font-bold mb-1 uppercase tracking-wider text-sm">Total Projects</h3>
            <p className="text-4xl font-black text-white">{stats?.totalProjects || 0}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-inner relative overflow-hidden group">
             <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors pointer-events-none"></div>
             <h3 className="text-red-400 font-bold mb-1 uppercase tracking-wider text-sm">Flagged (Malware)</h3>
             <p className="text-4xl font-black text-white relative z-10">{stats?.flaggedProjects || 0}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-inner">
            <h3 className="text-slate-500 font-bold mb-1 uppercase tracking-wider text-sm">Open Bounties</h3>
            <p className="text-4xl font-black text-white">
              {stats?.openBounties || 0} <span className="text-xl text-slate-600 font-medium">/ {stats?.totalBounties || 0}</span>
            </p>
          </div>

        </div>

        {/* Moderation Tools Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/library" className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-8 group transition-all">
             <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400">Library Moderation</h3>
             <p className="text-slate-400">Browse and remove violating projects directly from the library.</p>
          </Link>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 opacity-50 cursor-not-allowed">
             <h3 className="text-xl font-bold text-white mb-2">User Management (Coming Soon)</h3>
             <p className="text-slate-400">Ban or restrict accounts that violate community guidelines.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
