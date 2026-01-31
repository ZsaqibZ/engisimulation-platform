'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Comment {
  id: number
  content: string
  created_at: string
  user_id: string
  profiles: { full_name: string, avatar_url: string | null }
}

export default function CommentSection({ projectId }: { projectId: number }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      fetchComments()
    }
    init()
  }, [projectId])

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(full_name, avatar_url)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    if (data) setComments(data)
    setLoading(false)
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return
    const { error } = await supabase.from('comments').insert([{ content: newComment, project_id: projectId, user_id: user.id }])
    if (!error) { setNewComment(''); fetchComments() }
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return
    await supabase.from('comments').delete().eq('id', commentId)
    fetchComments()
  }

  return (
    <div className="space-y-8">
      {user ? (
        <form onSubmit={handlePost} className="flex gap-4 items-start">
          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold shrink-0 border border-slate-700">
             You
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question or share feedback..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-white min-h-[80px] placeholder-slate-500"
            />
            <button 
              type="submit" 
              disabled={!newComment.trim()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-800/50 p-4 rounded-lg text-center text-sm text-slate-400 border border-slate-700">
          <Link href="/login" className="text-blue-400 font-bold hover:underline">Log in</Link> to join the discussion.
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading discussion...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 text-xs font-bold uppercase">
                {comment.profiles?.avatar_url ? <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" /> : comment.profiles?.full_name?.charAt(0) || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 text-sm mr-2">{comment.profiles?.full_name || 'Anonymous'}</span>
                    <span className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  {user && user.id === comment.user_id && (
                    <button onClick={() => handleDelete(comment.id)} className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                  )}
                </div>
                <p className="text-slate-300 text-sm mt-1 leading-relaxed whitespace-pre-line">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-600 text-sm italic">No comments yet. Be the first to start the conversation!</p>
        )}
      </div>
    </div>
  )
}