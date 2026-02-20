'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form State
  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.status === 401) {
          router.push('/login')
          return
        }
        if (!res.ok) throw new Error('Failed to fetch profile')

        const data = await res.json()

        setFullName(data.full_name || '')
        setJobTitle(data.job_title || '')
        setWebsite(data.website || '')
        setAvatarUrl(data.avatar_url || '')
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    getProfile()
  }, [router])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          job_title: jobTitle,
          website,
          avatar_url: avatarUrl
        })
      })

      if (!res.ok) throw new Error('Failed to update profile')

      alert('Profile updated successfully!')
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading settings...</div>

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleUpdate} className="space-y-6">

            {/* Avatar Input (Simple URL for now, or file upload logic similar to projects) */}
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Avatar URL</label>
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                  {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500">?</div>}
                </div>
                <input
                  type="url"
                  className="flex-1 p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="https://github.com/yourname.png"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Tip: Use your GitHub avatar link or any public image URL.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="e.g. Alex Engineer"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Job Title</label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="e.g. Systems Architect"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Website / Portfolio</label>
              <input
                type="url"
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="https://your-portfolio.com"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  )
}