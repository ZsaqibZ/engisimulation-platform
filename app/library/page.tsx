import Link from 'next/link'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from '@/lib/mongodb'
import Project from '@/models/Project'
import DeleteProjectButton from '@/app/components/DeleteProjectButton'


export default async function LibraryPage() {
  // 1. Get User Session (NextAuth)
  const session = await getServerSession(authOptions)
  const user = session?.user

  // 2. Fetch Projects (with error handling to avoid server crash)
  let projects: any[] = []
  let dbError = false
  try {
    await dbConnect()
    projects = await Project.find({}).sort({ createdAt: -1 }).lean()
    // Convert _id to string for safe serialisation
    projects = projects.map((p) => ({ ...p, _id: p._id.toString() }))
  } catch (err) {
    console.error('Library page DB error:', err)
    dbError = true
  }

  if (dbError) {
    return (
      <main className="min-h-screen bg-slate-950 pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Could not load library</h2>
          <p className="text-slate-400">There was a problem connecting to the database. Please try again later.</p>
        </div>
      </main>
    )
  }


  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Simulation Library</h1>
            <p className="text-slate-400">Explore verified engineering models.</p>
          </div>

          {/* Search/Filter Placeholder (We can activate this later) */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search models..."
              className="bg-slate-900 border border-slate-800 text-slate-200 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Project Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {projects.map((project: any) => (
              <Link
                href={`/project/${project._id}`}
                key={project._id.toString()}
                className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
              >
                {/* Thumbnail Area */}
                <div className="h-48 bg-slate-950 relative overflow-hidden border-b border-slate-800">
                  {project.screenshots && project.screenshots[0] ? (
                    <img
                      src={project.screenshots[0]}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-800 text-4xl">
                      ⚡
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <div className="bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white border border-slate-800">
                      {project.software_type}
                    </div>
                    {user && user.id === project.author_id && (
                      <DeleteProjectButton projectId={project._id.toString()} />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-auto pt-4 flex gap-2 overflow-hidden">
                    {project.tags?.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <div className="text-4xl mb-4">📂</div>
            <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
            <p className="text-slate-400 mb-6">The library is currently empty.</p>
            {user && (
              <Link href="/upload" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors">
                Upload First Project
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}