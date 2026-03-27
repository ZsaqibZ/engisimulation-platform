'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function BookmarkButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    async function fetchCollections() {
      try {
        setLoading(true)
        const res = await fetch('/api/collections')
        if (res.status === 401) {
          router.push('/login')
          return
        }
        const data = await res.json()
        if (data.success) {
          setCollections(data.collections)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchCollections()
  }, [isOpen, router])

  const toggleCollection = async (collectionId: string) => {
    try {
      // Optimistic upate
      const updatedCollections = collections.map(c => {
        if (c._id === collectionId) {
          const hasProject = c.projects?.some((p: any) => p._id === projectId || p === projectId)
          if (hasProject) {
            return { ...c, projects: c.projects.filter((p: any) => p._id !== projectId && p !== projectId) }
          } else {
            return { ...c, projects: [...(c.projects || []), projectId] }
          }
        }
        return c
      })
      setCollections(updatedCollections)

      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', collectionId, projectId })
      })
      if (!res.ok) throw new Error('Toggle failed')
    } catch (e) {
      console.error(e)
      // Revert optimistic update by refetching
      setIsOpen(false)
    }
  }

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCollectionName.trim()) return
    setIsCreating(true)
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name: newCollectionName, projectId })
      })
      const data = await res.json()
      if (data.success) {
        setCollections([data.collection, ...collections])
        setNewCollectionName('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:border-blue-500 rounded-xl text-white font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/20 group"
        title="Save to Collection"
      >
        <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
        Save
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-slate-800 bg-slate-950/50">
            <h4 className="text-white font-bold text-sm mb-3">Save to Collection</h4>
            
            {/* Create New Collection Form */}
            <form onSubmit={handleCreateCollection} className="flex gap-2">
              <input 
                type="text" 
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                placeholder="New collection name..." 
                className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
              />
              <button 
                type="submit" 
                disabled={isCreating || !newCollectionName.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 border border-blue-500 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
              >
                +
              </button>
            </form>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {loading ? (
              <div className="p-4 text-center text-slate-500 text-sm">Loading folders...</div>
            ) : collections.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs">No collections found. Create one above!</div>
            ) : (
              <div className="space-y-1">
                {collections.map(c => {
                  const isSaved = c.projects?.some((p: any) => p._id === projectId || p === projectId)
                  return (
                    <button
                      key={c._id}
                      onClick={() => toggleCollection(c._id)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-800 rounded-lg transition-colors group text-left"
                    >
                      <span className="text-sm text-slate-300 font-medium truncate pr-4 group-hover:text-white transition-colors">
                        📁 {c.name}
                      </span>
                      {isSaved ? (
                        <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0 group-hover:border-blue-500 transition-colors"></div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}