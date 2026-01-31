import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import ProjectCard from '@/app/components/ProjectCard'

export default async function SavedProjectsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  // Fetch bookmarks AND the related project data
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*, projects(*)') // Join with projects table
    .order('created_at', { ascending: false })

  // Extract the project objects from the join
  // @ts-ignore
  const projects = bookmarks?.map(b => b.projects) || []

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Saved Collections</h1>
        
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p: any) => (
               <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">You haven't saved any projects yet.</div>
        )}
      </div>
    </main>
  )
}