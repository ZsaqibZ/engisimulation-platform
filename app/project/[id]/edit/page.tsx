import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import EditForm from '@/app/components/EditForm'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Get Project Data
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  // 3. Security Check: Is this MY project?
  if (!project || project.author_id !== user.id) {
    return <div className="p-10 text-center text-red-600">Unauthorized Access</div>
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Project</h1>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <EditForm project={project} />
        </div>
      </div>
    </main>
  )
}