import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from 'next/link'
import ProjectCard from '../components/ProjectCard'
import dbConnect from '@/lib/mongodb'
import Like from '@/models/Like'
import Project from '@/models/Project'

export const dynamic = 'force-dynamic'

export default async function SavedPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user

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

  await dbConnect()

  // 1. Find all likes by this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const likes = await Like.find({ user_id: (user as any).id }).lean()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectIds = likes.map((like: any) => like.project_id)

  // 2. Fetch projects
  const rawProjects = await Project.find({ _id: { $in: projectIds } }).lean()

  // 3. Serialize
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = rawProjects.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    author_id: p.author_id.toString(),
  }))

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
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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