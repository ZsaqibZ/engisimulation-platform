'use client'

// import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BookmarkButton({ projectId }: { projectId: number }) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      // Check if logged in via session (can't easily do it here without passing session or making a call)
      // We'll just call the API which checks auth
      try {
        const res = await fetch(`/api/bookmarks?project_id=${projectId}`)
        const data = await res.json()
        if (data.success && data.saved) {
          setSaved(true)
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    checkStatus()
  }, [projectId])

  const toggleSave = async () => {
    if (loading) return

    // Optimistic UI
    const previousSaved = saved
    setSaved(!saved)

    try {
      if (!saved) { // If it WAS NOT saved, we are saving it
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId })
        })
        if (res.status === 401) return router.push('/login')
        if (!res.ok) throw new Error('Failed to save')
      } else { // If it WAS saved, we are unsaving it
        const res = await fetch('/api/bookmarks', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId })
        })
        if (res.status === 401) return router.push('/login')
        if (!res.ok) throw new Error('Failed to remove')
      }
      router.refresh()
    } catch (error) {
      console.error(error)
      setSaved(previousSaved) // Revert on error
    }
  }

  return (
    <button
      onClick={toggleSave}
      className={`p-2 rounded-full border transition-all ${saved
        ? 'bg-blue-50 border-blue-200 text-blue-600'
        : 'bg-white border-gray-300 text-gray-400 hover:text-gray-600'
        }`}
      title={saved ? "Remove from Saved" : "Save for Later"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  )
}