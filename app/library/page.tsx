import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import ProjectCard from '../components/ProjectCard'
import SearchFilter from '../components/SearchFilter'

export const dynamic = 'force-dynamic'

interface LibraryProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const ITEMS_PER_PAGE = 12 // Reduced for better visual balance on initial load

export default async function LibraryPage(props: LibraryProps) {
  const searchParams = await props.searchParams
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  // 1. User Context & Profile Logic
  const { data: { user } } = await supabase.auth.getUser()
  let profileName = ""
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    if (profile?.full_name) profileName = profile.full_name.split(' ')[0]
  }

  // 2. Query Parameters
  const page = Number(searchParams.page) || 1
  const viewMode = searchParams.view === 'my_projects' ? 'my_projects' : 'all'
  const currentQuery = searchParams.q as string || ''
  const currentType = searchParams.type as string || ''

  // 3. Efficient Server-Side Pagination Logic
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Filters
  if (viewMode === 'my_projects' && user) query = query.eq('author_id', user.id)
  if (currentQuery) query = query.or(`title.ilike.%${currentQuery}%,description.ilike.%${currentQuery}%`)
  if (currentType) {
    query = currentType.includes('MATLAB') 
      ? query.in('software_type', ['MATLAB', 'Simulink', 'MATLAB/Simulink']) 
      : query.eq('software_type', currentType)
  }

  // Execute range-limited query
  const { data: projects, count } = await query.range(from, to)
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
    <main className="min-h-screen bg-slate-950 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- DUAL-STATE HEADER --- */}
        {!user ? (
          <header className="mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Public Access
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Project <span className="text-slate-500">Library</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
              Explore open-source simulations and technical assets. 
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold ml-1 transition-colors">
                Sign in
              </Link> to download high-fidelity source files.
            </p>
          </header>
        ) : (
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 animate-fade-in border-b border-slate-900 pb-10">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white tracking-tight">Engineer Dashboard</h1>
              <p className="text-slate-400 font-medium">Welcome back, <span className="text-blue-400">{profileName}</span>. Ready for your next simulation?</p>
            </div>
            <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 shadow-inner">
               <ViewLink href="/library" active={viewMode === 'all'}>Global Library</ViewLink>
               <ViewLink href="/library?view=my_projects" active={viewMode === 'my_projects'}>My Projects</ViewLink>
            </div>
          </header>
        )}

        {/* --- SEARCH & FILTERS --- */}
        <div className="mb-12"><SearchFilter /></div>

        {/* --- GRID CONTENT --- */}
        {projects && projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* STYLIZED PAGINATION BAR */}
            {totalPages > 1 && (
              <nav className="mt-20 flex justify-center items-center gap-6 animate-fade-in">
                <PaginationButton 
                  href={getPageLink(page - 1)} 
                  disabled={page <= 1}
                  label="Previous"
                />
                
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
                    {page}
                  </span>
                  <span className="text-slate-600 text-sm font-bold">of {totalPages}</span>
                </div>

                <PaginationButton 
                  href={getPageLink(page + 1)} 
                  disabled={page >= totalPages}
                  label="Next"
                />
              </nav>
            )}
          </>
        ) : (
          /* EMPTY STATE CARD */
          <div className="flex flex-col items-center justify-center py-32 bg-slate-950 border-2 border-dashed border-slate-900 rounded-[3rem] animate-fade-in">
             <div className="h-20 w-20 bg-slate-900 rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-xl">📂</div>
             <h3 className="text-xl font-bold text-white mb-2">No simulations found</h3>
             <p className="text-slate-500 text-sm mb-8 max-w-xs text-center">Adjust your search or be the first to contribute a project to this category.</p>
             <Link href="/upload" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-95">
               + Upload Project
             </Link>
          </div>
        )}
      </div>
    </main>
  )
}

/** * Sub-components for cleaner library architecture 
 */

function ViewLink({ href, active, children }: { href: string, active: boolean, children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
        active 
          ? 'bg-slate-800 text-white shadow-lg' 
          : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      {children}
    </Link>
  )
}

function PaginationButton({ href, disabled, label }: { href: string, disabled: boolean, label: string }) {
  if (disabled) {
    return (
      <button disabled className="px-6 py-2.5 bg-slate-900/40 border border-slate-900 text-slate-700 rounded-xl cursor-not-allowed text-xs font-bold uppercase tracking-widest">
        {label === 'Previous' ? '← ' + label : label + ' →'}
      </button>
    )
  }
  return (
    <Link href={href} className="px-6 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/50 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
      {label === 'Previous' ? '← ' + label : label + ' →'}
    </Link>
  )
}