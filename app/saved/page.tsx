import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import ProjectCard from '../components/ProjectCard'

export const dynamic = 'force-dynamic'

export default async function SavedPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold text-white mb-2">Login Required</h1>
        <p className="text-slate-400 mb-6">You must be logged in to view your saved projects.</p>
        <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition-colors">
          Go to Login
        </Link>
      </div>
    )
  }

  // Fetch the projects that the user has 'liked'
  // We join the 'likes' table with the 'projects' table
  const { data: savedItems } = await supabase
    .from('likes')
    .select('project_id, projects(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Extract the actual project objects from the nested response
  const projects = savedItems?.map((item) => item.projects).filter(Boolean) || []

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 animate-fade-in border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Saved Projects</h1>
          <p className="text-slate-400 mt-2">
            Your personal collection of bookmarked simulations.
          </p>
        </div>

        {/* Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {projects.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-900 rounded-2xl border border-dashed border-slate-800 animate-fade-in">
            <div className="mx-auto h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-4 text-slate-500">
              ❤️
            </div>
            <h3 className="text-lg font-bold text-white">No saved projects yet</h3>
            <p className="text-slate-400 text-sm mt-1 mb-6 max-w-sm mx-auto">
              Browse the library and click the heart icon to save projects for later.
            </p>
            <Link 
              href="/" 
              className="inline-block px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors shadow-lg hover:shadow-blue-500/20"
            >
              Browse Library
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}