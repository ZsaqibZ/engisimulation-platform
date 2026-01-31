'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form Fields
  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [userId, setUserId] = useState('')

  // Load current data
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      
      setUserId(user.id)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setFullName(data.full_name || '')
        setJobTitle(data.job_title || '')
        setLinkedin(data.linkedin_url || '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase, router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        job_title: jobTitle,
        linkedin_url: linkedin,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      alert('Error saving profile')
    } else {
      alert('Profile updated!')
      router.refresh()
    }
    setSaving(false)
  }

  if (loading) return <div className="p-10 text-center">Loading settings...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title / Major</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black"
              placeholder="e.g. Electrical Engineer @ Tesla or PhD Student"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-black"
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push(`/profile/${userId}`)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              View Public Profile
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}