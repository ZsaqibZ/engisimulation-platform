'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateBountyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title')
    const description = formData.get('description')
    const reward_points = Number(formData.get('reward_points'))

    try {
      const res = await fetch('/api/bounties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, reward_points })
      })
      const data = await res.json()
      
      if (data.success) {
        router.push('/bounties')
      } else {
        setError(data.error || 'Failed to post bounty')
      }
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl animate-slide-up">
          <h1 className="text-3xl font-extrabold text-white mb-2">Post a Bounty</h1>
          <p className="text-slate-400 mb-8">Offer some of your reputation points to anyone who can solve your engineering need.</p>
          
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Bounty Title</label>
              <input 
                name="title" 
                required 
                maxLength={100}
                placeholder="e.g., Finite Element Analysis of a Wind Turbine Blade in Ansys"
                className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-white transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Reward (Reputation Points)</label>
              <p className="text-xs text-slate-500 mb-3">This amount will be deducted from your account immediately and held in escrow.</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 font-black">💎</span>
                <input 
                  type="number"
                  name="reward_points" 
                  required 
                  min={10}
                  defaultValue={50}
                  step={10}
                  className="w-full pl-12 p-4 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-white font-bold transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Detailed Requirements</label>
              <textarea 
                name="description" 
                required 
                rows={6}
                placeholder="Describe exactly what software, versions, parameters, and outputs you need..."
                className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-white transition-all shadow-inner"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 text-lg"
            >
              {loading ? 'Posting...' : 'Escrow Points & Post Bounty'}
            </button>

          </form>
        </div>

      </div>
    </main>
  )
}
