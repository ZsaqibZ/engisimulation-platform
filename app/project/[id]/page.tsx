import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import LikeButton from '@/app/components/LikeButton'
import CommentSection from '@/app/components/CommentSection'
import DeleteProjectButton from '@/app/components/DeleteProjectButton'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  // 1. Fetch Project Data with Author Profile
  const { data: project } = await supabase
    .from('projects')
    .select('*, profiles(full_name, job_title, avatar_url)')
    .eq('id', id)
    .single()

  if (!project) return <div className="p-20 text-center text-white">Project not found</div>

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthor = user && user.id === project.author_id

  // 2. Fetch Like Info
  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id)

  let userHasLiked = false
  if (user) {
    const { data: likeData } = await supabase
      .from('likes')
      .select('id')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .single()
    if (likeData) userHasLiked = true
  }

  const getEmbedUrl = (url: string) => {
    if (!url) return null
    const v = url.split('v=')[1] || url.split('/').pop()
    return `https://www.youtube.com/embed/${v}`
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-900 to-slate-950 z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- HEADER SECTION --- */}
        <div className="mb-8 animate-fade-in">
          <Link href="/" className="text-slate-400 hover:text-blue-400 text-sm font-medium mb-4 inline-block transition-colors">
            ← Back to Library
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                 <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-300 shadow-sm">
                   {project.software_type}
                 </span>
                 <span className="text-slate-500 text-sm font-mono">
                   v1.0 • {new Date(project.created_at).toLocaleDateString()}
                 </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {project.title}
              </h1>
            </div>
            
            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-3">
               <LikeButton projectId={project.id} initialLikes={likeCount || 0} initialHasLiked={userHasLiked} />
               
               {isAuthor && (
                 <>
                   <Link 
                     href={`/project/${project.id}/edit`}
                     className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition-colors text-sm flex items-center gap-2"
                   >
                     <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                     Edit
                   </Link>
                   <DeleteProjectButton projectId={project.id} />
                 </>
               )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-2 space-y-8 animate-slide-up">
            
            {/* MEDIA */}
            <div className="bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-800">
              {project.youtube_url ? (
                <div className="aspect-video w-full">
                  <iframe src={getEmbedUrl(project.youtube_url)!} className="w-full h-full" allowFullScreen />
                </div>
              ) : project.screenshots && project.screenshots.length > 0 ? (
                <img src={project.screenshots[0]} className="w-full h-auto object-cover" alt="Main Preview" />
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-600">No Preview Available</div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-2">About this Project</h2>
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                {project.description}
              </div>
              
              {project.tags && project.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-md text-sm border border-slate-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* COMMENTS */}
            <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 shadow-sm">
               <h2 className="text-xl font-bold text-white mb-6">Discussion</h2>
               <CommentSection projectId={project.id} />
            </div>
          </div>

          {/* --- RIGHT COLUMN (SIDEBAR) --- */}
          <div className="space-y-6">
            
            {/* DOWNLOAD CARD */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg lg:sticky lg:top-24">
              <div className="mb-6">
                 <h3 className="text-lg font-bold text-white">Get the Files</h3>
                 <p className="text-sm text-slate-400">Includes source code and documentation.</p>
              </div>

              {user ? (
                <a 
                  href={project.file_url} 
                  download 
                  className="block w-full text-center py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 transition-all"
                >
                  Download File
                </a>
              ) : (
                <Link 
                  href="/login" 
                  className="block w-full text-center py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-all border border-slate-700"
                >
                  Log In to Download
                </Link>
              )}

              <div className="mt-6 space-y-3 pt-6 border-t border-slate-800 text-sm text-slate-400">
                 <div className="flex justify-between"><span>License</span><span className="font-mono text-white">MIT Open Source</span></div>
                 <div className="flex justify-between"><span>Verified</span><span className="text-green-400 font-bold">Yes ✅</span></div>
              </div>
            </div>

            {/* AUTHOR CARD */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Published By</h3>
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md border border-slate-700">
                     {project.profiles?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-white">{project.profiles?.full_name || 'Anonymous Engineer'}</div>
                    <div className="text-xs text-slate-400">{project.profiles?.job_title || 'Community Member'}</div>
                  </div>
               </div>
               <Link href={`/profile/${project.author_id}`} className="block mt-4 text-center text-sm text-blue-400 font-medium hover:text-blue-300">
                 View Portfolio
               </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}