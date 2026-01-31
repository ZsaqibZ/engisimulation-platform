'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Comment {
  id: number
  content: string
  created_at: string
  user_id: string
  profiles: {
    full_name: string
    avatar_url: string | null
  }
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
    fetchComments()
    getUser()
  }, [projectId])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchComments = async () => {
    // We fetch the comment AND the profile of the person who wrote it
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(full_name, avatar_url)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }) // Newest first

    if (data) setComments(data)
    setLoading(false)
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    const { error } = await supabase
      .from('comments')
      .insert([{ 
        content: newComment, 
        project_id: projectId,
        user_id: user.id 
      }])

    if (!error) {
      setNewComment('')
      fetchComments() // Refresh list
    }
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return
    
    await supabase.from('comments').delete().eq('id', commentId)
    fetchComments()
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Comment Input Form */}
      {user ? (
        <form onSubmit={handlePost} className="flex gap-4 items-start">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
             {/* Initials of current user (placeholder) */}
             You
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question or share feedback..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[80px]"
            />
            <button 
              type="submit" 
              disabled={!newComment.trim()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-sm text-gray-600">
          <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link> to join the discussion.
        </div>
      )}

      {/* 2. Comments List */}
      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading discussion...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                {comment.profiles?.avatar_url ? (
                  <img src={comment.profiles.avatar_url} alt="User" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                    {comment.profiles?.full_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900 text-sm mr-2">
                      {comment.profiles?.full_name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Delete Button (Only for author) */}
                  {user && user.id === comment.user_id && (
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm italic">No comments yet. Be the first to start the conversation!</p>
        )}
      </div>

    </div>
  )
}