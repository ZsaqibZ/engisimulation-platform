'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BookmarkButton({ projectId }: { projectId: number }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single()

      if (data) setSaved(true)
      setLoading(false)
    }
    checkStatus()
  }, [projectId, supabase])

  const toggleSave = async () => {
    if (loading) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const newSavedState = !saved
    setSaved(newSavedState) // Optimistic UI

    if (newSavedState) {
      await supabase.from('bookmarks').insert({ project_id: projectId, user_id: user.id })
    } else {
      await supabase.from('bookmarks').delete().eq('project_id', projectId).eq('user_id', user.id)
    }
    router.refresh()
  }

  return (
    <button 
      onClick={toggleSave}
      className={`p-2 rounded-full border transition-all ${
        saved 
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