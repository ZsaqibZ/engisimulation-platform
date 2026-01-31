import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import ProjectCard from './components/ProjectCard'
import SearchFilter from './components/SearchFilter'

export const dynamic = 'force-dynamic'

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Home(props: HomeProps) {
  const searchParams = await props.searchParams
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ------------------------------------------------------------------
  // VIEW 1: THE GUEST LANDING PAGE
  // ------------------------------------------------------------------
  if (!user) {
    return (
      <main className="min-h-screen bg-white">
        <section className="relative pt-32 pb-40 overflow-hidden bg-white">
          <div className="absolute inset-0 z-0 opacity-30">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center animate-fade-in">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
              Version 1.0 Live
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
              The Standard for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Engineering Simulation
              </span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join the open-source community. Download verified projects for MATLAB, Ansys, and LabVIEW.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up">
              <Link href="/login" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Start Browsing
              </Link>
              <Link href="/login" className="px-8 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
                Contributor Login
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto py-20 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { icon: "🚀", title: "Version Control", desc: "Track every iteration of your simulation files automatically." },
             { icon: "🛡️", title: "Verified Security", desc: "Every upload is scanned and sandboxed for community safety." },
             { icon: "⚡", title: "Instant Deployment", desc: "Share your work with a simple link. No large email attachments." }
           ].map((feature, i) => (
             <div key={i} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
               <div className="text-4xl mb-4">{feature.icon}</div>
               <h3 className="font-bold text-xl text-gray-900 mb-2">{feature.title}</h3>
               <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
             </div>
           ))}
        </section>
      </main>
    )
  }

  // ------------------------------------------------------------------
  // VIEW 2: THE MEMBER DASHBOARD
  // ------------------------------------------------------------------
  
  // 1. Fetch Profile Name for Welcome Message
  let profileName = "Engineer"
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    if (profile?.full_name) {
      profileName = profile.full_name.split(' ')[0]
    }
  }

  const viewMode = searchParams.view === 'my_projects' ? 'my_projects' : 'all'
  const showSuccess = searchParams.success === 'true'

  let query = supabase.from('projects').select('*').order('created_at', { ascending: false })

  if (viewMode === 'my_projects') query = query.eq('author_id', user.id)
  
  if (searchParams.q) {
    const term = searchParams.q as string
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
  }
  
  // Smart Software Filter
  if (searchParams.type) {
    if (searchParams.type === 'MATLAB/Simulink') {
      // Find both legacy and new tags
      query = query.in('software_type', ['MATLAB', 'Simulink', 'MATLAB/Simulink'])
    } else {
      query = query.eq('software_type', searchParams.type)
    }
  }

  const { data: projects } = await query

  return (
    <main className="min-h-screen bg-gray-50/50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Banner */}
        {showSuccess && (
           <div className="mb-8 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-4 animate-fade-in shadow-sm">
             <div className="bg-green-100 p-2 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
             </div>
             <div>
               <p className="font-bold text-lg">Project Published Successfully!</p>
               <p className="text-sm text-green-700">Your simulation is now live in the library.</p>
             </div>
             <Link href="/" className="ml-auto text-sm text-green-700 hover:text-green-900 font-bold underline">
               Dismiss
             </Link>
           </div>
         )}

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome, {profileName}.</p>
          </div>
          
          <div className="flex gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
             <Link
              href="/"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'all' 
                  ? 'bg-gray-100 text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Library
            </Link>
            <Link
              href="/?view=my_projects"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'my_projects' 
                  ? 'bg-gray-100 text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              My Projects
            </Link>
          </div>
        </div>

        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
           <SearchFilter />
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 animate-fade-in">
            <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4 text-gray-400">📂</div>
            <h3 className="text-lg font-bold text-gray-900">No projects found</h3>
            <p className="text-gray-500 text-sm mt-1 mb-6 max-w-sm mx-auto">
              {viewMode === 'my_projects' 
                ? "You haven't uploaded anything yet." 
                : "Try adjusting your search filters."}
            </p>
            {viewMode === 'my_projects' && (
              <Link href="/upload" className="inline-block px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                Upload Project
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}