import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from '@/lib/mongodb'
import Project from '@/models/Project'
import LibraryClient from '@/app/components/LibraryClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  let projects: any[] = []
  let dbError = false

  try {
    await dbConnect()
    const raw = await Project.find({}).sort({ createdAt: -1 }).lean()
    projects = raw.map((p: any) => ({ ...p, _id: p._id.toString() }))
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
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Simulation Library</h1>
            <p className="text-slate-400">Explore verified engineering models from the community.</p>
          </div>
          {session?.user && (
            <Link href="/upload" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors text-sm">
              + Upload Project
            </Link>
          )}
        </div>

        {/* Client-side Search + Filter + Grid */}
        <LibraryClient projects={projects} userId={userId} />

      </div>
    </main>
  )
}