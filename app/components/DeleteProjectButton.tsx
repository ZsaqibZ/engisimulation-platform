'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteProjectButton({ projectId }: { projectId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure? This action cannot be undone.")
    if (!confirmDelete) return

    setLoading(true)
    
    // Delete the row (RLS policy ensures only owner can do this)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      alert('Error deleting project: ' + error.message)
      setLoading(false)
    } else {
      alert('Project deleted successfully.')
      router.push('/') // Send them back home
      router.refresh()
    }
  }

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center gap-2"
    >
      {loading ? 'Deleting...' : (
        <>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
          Delete
        </>
      )}
    </button>
  )
}