import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import dbConnect from '@/lib/mongodb'
import Project from '@/models/Project'
import LibraryClient from '@/app/components/LibraryClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MyProjectsPage() {
    const session = await getServerSession(authOptions)

    // Must be logged in to see this page
    if (!session?.user) {
        redirect('/login')
    }

    const userId = (session.user as any).id

    let projects: any[] = []
    let dbError = false

    try {
        await dbConnect()
        const raw = await Project.find({ author_id: userId }).sort({ createdAt: -1 }).lean()
        projects = raw.map((p: any) => ({ ...p, _id: p._id.toString() }))
    } catch (err) {
        console.error('My Projects page DB error:', err)
        dbError = true
    }

    if (dbError) {
        return (
            <main className="min-h-screen bg-slate-950 pt-24 pb-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Could not load your projects</h2>
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
                        <h1 className="text-3xl font-bold text-white mb-2">My Projects</h1>
                        <p className="text-slate-400">
                            {projects.length > 0
                                ? `You have uploaded ${projects.length} project${projects.length !== 1 ? 's' : ''}.`
                                : "You haven't uploaded any projects yet."}
                        </p>
                    </div>
                    <Link href="/upload" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors text-sm">
                        + Upload New Project
                    </Link>
                </div>

                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                        <div className="text-5xl mb-4">📂</div>
                        <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
                        <p className="text-slate-400 mb-6 text-sm">Upload your first engineering simulation to get started.</p>
                        <Link
                            href="/upload"
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
                        >
                            Upload First Project
                        </Link>
                    </div>
                ) : (
                    /* Reuse LibraryClient for filtering within own projects */
                    <LibraryClient projects={projects} userId={userId} />
                )}

            </div>
        </main>
    )
}
