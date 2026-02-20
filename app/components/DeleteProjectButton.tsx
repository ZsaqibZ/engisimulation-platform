'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if button is inside a Link
    e.stopPropagation()

    const confirmDelete = window.confirm("Are you sure? This action cannot be undone.")
    if (!confirmDelete) return

    setLoading(true)

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete')
      }

      router.refresh() // Refresh the list
    } catch (error: any) {
      alert('Error deleting project: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all border border-transparent hover:border-red-500/50"
      title="Delete Project"
    >
      {loading ? (
        <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      )}
    </button>
  )
}