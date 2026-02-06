import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import CommentSection from '@/app/components/CommentSection'
import DeleteProjectButton from '@/app/components/DeleteProjectButton'
import ProjectGallery from '@/app/components/ProjectGallery' // Integrated the new gallery

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: project } = await supabase
    .from('projects')
    .select('*, profiles(full_name, job_title, avatar_url)')
    .eq('id', id)
    .single()

  if (!project) return <div className="p-20 text-center text-white">Project not found</div>

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthor = user && user.id === project.author_id

  // Formatting YouTube URLs for Cinema Mode
  const getEmbedUrl = (url: string) => {
    if (!url) return null
    const v = url.split('v=')[1] || url.split('/').pop()
    return `https://www.youtube.com/embed/${v}`
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* --- STYLIZED BACK BUTTON --- */}
        <Link 
          href="/library" 
          className="group flex items-center gap-2 text-slate-400 hover:text-blue-400 text-sm font-semibold mb-8 transition-all w-fit"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Back to Library
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* --- LEFT COLUMN: CONTENT & MEDIA --- */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Header Info */}
            <header className="space-y-4">
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                   {project.software_type}
                 </span>
                 <span className="text-slate-500 text-xs font-mono italic">
                   Last Updated: {new Date(project.created_at).toLocaleDateString()}
                 </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {project.title}
              </h1>
            </header>

            {/* CINEMA MODE MEDIA GALLERY */}
            <div className="space-y-6">
              {project.youtube_url ? (
                /* Video takes priority in Cinema Mode */
                <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 aspect-video">
                  <iframe 
                    src={getEmbedUrl(project.youtube_url)!} 
                    className="w-full h-full" 
                    allowFullScreen 
                  />
                </div>
              ) : (
                /* The Gallery handles 1 or many images with nav controls */
                <ProjectGallery images={project.screenshots || []} />
              )}
            </div>

            {/* DESCRIPTION: TYPOGRAPHY FOCUS */}
            <section className="bg-slate-900/50 rounded-3xl p-8 md:p-12 border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-1 bg-blue-600 rounded-full inline-block"></span>
                Project Documentation
              </h2>
              
              <article className="prose prose-invert prose-blue max-w-none prose-headings:font-bold prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300 leading-relaxed whitespace-pre-line">
                {project.description}
              </article>
              
              {project.tags?.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-2 pt-8 border-t border-white/5">
                  {project.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-medium border border-white/5 transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* DISCUSSION */}
            <section className="space-y-6">
               <h3 className="text-xl font-bold text-white px-2">Community Discussion</h3>
               <div className="bg-slate-900/50 rounded-3xl border border-white/5 p-6">
                 <CommentSection projectId={project.id} />
               </div>
            </section>
          </div>

          {/* --- RIGHT COLUMN: STICKY SIDEBAR --- */}
          <aside className="space-y-6">
            <div className="lg:sticky lg:top-28 space-y-6">
              
              {/* DOWNLOAD & STATS CARD */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/20 transition-all duration-500"></div>
                
                <h3 className="text-lg font-bold text-white mb-2">Access Project Files</h3>
                <p className="text-sm text-slate-400 mb-6">Commercial use license included with all verified simulation assets.</p>

                {user ? (
                  <a 
                    href={project.file_url} 
                    className="block w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-center font-bold rounded-xl shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] transition-all active:scale-95"
                  >
                    Download Source Files
                  </a>
                ) : (
                  <Link 
                    href="/login" 
                    className="block w-full py-4 bg-white/5 hover:bg-white/10 text-white text-center font-bold rounded-xl border border-white/10 transition-all"
                  >
                    Log In to Access
                  </Link>
                )}

                
              </div>

              {/* AUTHOR CARD */}
              <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Lead Engineer</p>
                 <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                       {project.profiles?.full_name?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <div className="font-bold text-white leading-tight">{project.profiles?.full_name || 'Verified Member'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{project.profiles?.job_title || 'Simulation Specialist'}</div>
                    </div>
                 </div>
                 <Link href={`/profile/${project.author_id}`} className="block w-full text-center py-2.5 text-xs font-bold text-blue-400 hover:text-blue-300 border border-blue-400/20 rounded-xl transition-all">
                   View Full Portfolio
                 </Link>
              </div>

              {isAuthor && (
                <div className="flex gap-2">
                  <DeleteProjectButton projectId={project.id} />
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}