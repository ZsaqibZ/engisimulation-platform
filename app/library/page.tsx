import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import ProjectCard from '../components/ProjectCard'
import SearchFilter from '../components/SearchFilter'

export const dynamic = 'force-dynamic'

interface LibraryProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const ITEMS_PER_PAGE = 30

export default async function LibraryPage(props: LibraryProps) {
  const searchParams = await props.searchParams
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  // 1. Check User (To decide which Header to show)
  const { data: { user } } = await supabase.auth.getUser()

  let profileName = ""
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    if (profile?.full_name) profileName = profile.full_name.split(' ')[0]
  }

  // 2. Query Logic
  const page = Number(searchParams.page) || 1
  const viewMode = searchParams.view === 'my_projects' ? 'my_projects' : 'all'
  const currentQuery = searchParams.q as string || ''
  const currentType = searchParams.type as string || ''

  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  let query = supabase.from('projects').select('*', { count: 'exact' }).order('created_at', { ascending: false })

  if (viewMode === 'my_projects' && user) query = query.eq('author_id', user.id)
  if (currentQuery) query = query.or(`title.ilike.%${currentQuery}%,description.ilike.%${currentQuery}%`)
  if (currentType) query = currentType === 'MATLAB/Simulink' ? query.in('software_type', ['MATLAB', 'Simulink', 'MATLAB/Simulink']) : query.eq('software_type', currentType)

  query = query.range(from, to)
  const { data: projects, count } = await query
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

  const getPageLink = (newPage: number) => {
    const params = new URLSearchParams()
    if (viewMode !== 'all') params.set('view', viewMode)
    if (currentQuery) params.set('q', currentQuery)
    if (currentType) params.set('type', currentType)
    params.set('page', newPage.toString())
    return `/library?${params.toString()}`
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER LOGIC --- */}
        {!user ? (
          // GUEST HEADER
          <div className="mb-10 animate-fade-in border-b border-slate-800 pb-8">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
              Public Access
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Project Library
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl">
              Browse verified engineering simulations. <Link href="/login" className="text-blue-400 underline hover:text-blue-300">Log in</Link> to download source files.
            </p>
          </div>
        ) : (
          // MEMBER DASHBOARD HEADER
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 animate-fade-in border-b border-slate-800 pb-8">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
              <p className="text-slate-400 mt-1">Welcome back, {profileName}.</p>
            </div>
            <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 shadow-sm">
               <Link href="/library" className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>All Projects</Link>
               <Link href="/library?view=my_projects" className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'my_projects' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>My Projects</Link>
            </div>
          </div>
        )}

        {/* --- GRID CONTENT (Shared) --- */}
        <div className="mb-8"><SearchFilter /></div>

        {projects && projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-4 animate-fade-in">
                {page > 1 ? <Link href={getPageLink(page - 1)} className="px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg">← Previous</Link> : <span className="px-4 py-2 bg-slate-900/50 border border-slate-800 text-slate-600 rounded-lg cursor-not-allowed">← Previous</span>}
                <span className="text-slate-400 text-sm font-medium">Page {page} of {totalPages}</span>
                {page < totalPages ? <Link href={getPageLink(page + 1)} className="px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg">Next →</Link> : <span className="px-4 py-2 bg-slate-900/50 border border-slate-800 text-slate-600 rounded-lg cursor-not-allowed">Next →</span>}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-slate-900 rounded-2xl border border-dashed border-slate-800 animate-fade-in">
             <div className="text-4xl mb-4">📂</div>
             <h3 className="text-lg font-bold text-white">No projects found</h3>
             <p className="text-slate-400 text-sm mt-1">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </main>
  )
}