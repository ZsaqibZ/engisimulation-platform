'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LikeButtonProps {
  projectId: number
  initialLikes: number
  initialHasLiked: boolean // <--- NEW PROP
}

export default function LikeButton({ projectId, initialLikes, initialHasLiked }: LikeButtonProps) {
  const router = useRouter()
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(initialHasLiked)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleToggleLike = async () => {
    setLoading(true)

    // 1. Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return router.push('/login')
    }

    // 2. Optimistic UI Update (Update screen instantly)
    const previousLikes = likes
    const previousHasLiked = hasLiked

    if (hasLiked) {
      setLikes(l => Math.max(0, l - 1)) // Prevent negative numbers
      setHasLiked(false)
    } else {
      setLikes(l => l + 1)
      setHasLiked(true)
    }

    try {
      if (hasLiked) {
        // UNLIKE: Delete the row
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id)
        
        if (error) throw error
      } else {
        // LIKE: Insert a row
        const { error } = await supabase
          .from('likes')
          .insert([{ project_id: projectId, user_id: user.id }])
        
        if (error) throw error
      }
    } catch (error) {
      // Revert if API fails
      console.error('Like failed:', error)
      setLikes(previousLikes)
      setHasLiked(previousHasLiked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleToggleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
        hasLiked 
          ? 'bg-pink-50 border-pink-200 text-pink-600' 
          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
      }`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill={hasLiked ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={`transition-transform ${hasLiked ? 'scale-110' : ''}`}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <span className="font-bold text-sm">{likes}</span>
    </button>
  )
}