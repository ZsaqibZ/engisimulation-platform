import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from '@/lib/mongodb'
import Collection from '@/models/Collection'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CollectionsDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  await dbConnect()
  const collections = await Collection.find({ userId: (session.user as any).id })
    .populate({
      path: 'projects',
      select: 'title software_type file_url _id downloads screenshots'
    })
    .sort({ createdAt: -1 })
    .lean()

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">My Collections</h1>
            <p className="text-slate-400 mt-2">Curate and organize your favorite engineering simulations.</p>
          </div>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-bold text-white mb-2">No collections yet</h3>
            <p className="text-slate-400 mb-6">Start browsing the library and save projects to custom folders.</p>
            <Link href="/library" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-colors inline-block">
              Browse Library
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {collections.map((collection: any) => (
              <div key={collection._id.toString()} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl animate-fade-in">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-800">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-blue-500">📁</span>
                    {collection.name}
                  </h2>
                  <span className="bg-slate-800 text-slate-300 font-bold text-xs px-3 py-1 rounded-full">
                    {collection.projects?.length || 0} Items
                  </span>
                </div>

                {(!collection.projects || collection.projects.length === 0) ? (
                  <p className="text-slate-500 italic py-4">This collection is empty.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {collection.projects.map((project: any) => (
                      <Link href={`/project/${project._id}`} key={project._id.toString()} className="group block h-full">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all h-full flex flex-col">
                          
                          {/* Thumbnail */}
                          <div className="h-32 bg-slate-900 relative overflow-hidden">
                            {project.screenshots && project.screenshots[0] ? (
                              <img src={project.screenshots[0]} alt={project.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-800">⚡</div>
                            )}
                            <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white border border-slate-800">
                              {project.software_type}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4 flex flex-col flex-1">
                            <h3 className="text-white font-bold text-sm mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                              {project.title}
                            </h3>
                            <div className="mt-auto pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-500 font-medium">
                              <span>Download</span>
                              <span>⬇ {project.downloads || 0}</span>
                            </div>
                          </div>

                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
