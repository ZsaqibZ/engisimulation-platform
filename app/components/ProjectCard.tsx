'use client'

import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProjectCard({ project }: { project: any }) {
  const router = useRouter()
  const [likes, setLikes] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    let isMounted = true

    const fetchLikeStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      // 1. Get total likes
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)

      // 2. Check if *current user* liked it
      let userLiked = false
      if (user) {
        const { data } = await supabase
          .from('likes')
          .select('id')
          .eq('project_id', project.id)
          .eq('user_id', user.id)
          .single()
        if (data) userLiked = true
      }

      if (isMounted) {
        setLikes(count || 0)
        setHasLiked(userLiked)
        setLoading(false)
      }
    }

    fetchLikeStatus()
    return () => { isMounted = false }
  }, [project.id])

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent clicking the card link
    e.stopPropagation()

    const { data: { user } } = await supabase.auth.getUser()
    
    // Redirect if not logged in
    if (!user) {
      return router.push('/login')
    }

    // Optimistic Update (Make it feel instant)
    const originalLikes = likes
    const originalHasLiked = hasLiked
    
    setHasLiked(!hasLiked)
    setLikes(hasLiked ? likes - 1 : likes + 1)

    try {
      if (originalHasLiked) {
        // UNLIKE: Delete the row
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('project_id', project.id)
          .eq('user_id', user.id)
        
        if (error) throw error
      } else {
        // LIKE: Insert a row
        const { error } = await supabase
          .from('likes')
          .insert({ project_id: project.id, user_id: user.id })
        
        if (error) throw error
      }
    } catch (err: any) {
      // Revert changes if it fails
      console.error('Like Error:', err.message)
      setHasLiked(originalHasLiked)
      setLikes(originalLikes)
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
      <Link href={`/project/${project.id}`} className="block flex-1">
        
        {/* Thumbnail Section */}
        <div className="h-48 bg-slate-950 relative overflow-hidden">
          {project.screenshots && project.screenshots[0] ? (
            <img 
              src={project.screenshots[0]} 
              alt={project.title} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-slate-800 bg-slate-950/50">
              ⚡
            </div>
          )}
          <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white border border-slate-800">
            {project.software_type}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col gap-3 flex-1">
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
            {project.title}
          </h3>
          <p className="text-slate-400 text-sm line-clamp-2">
            {project.description}
          </p>
          
          {/* Footer: Tags & Like Button */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-800/50">
            <div className="flex gap-2">
               {/* Display first tag only to keep it clean */}
               {project.tags && project.tags[0] && (
                 <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">#{project.tags[0]}</span>
               )}
            </div>

            <button 
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                 hasLiked 
                   ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' 
                   : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className={hasLiked ? 'scale-110' : ''}>
                {hasLiked ? '❤️' : '🤍'}
              </span>
              {likes}
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}