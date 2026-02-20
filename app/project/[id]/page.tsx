import { getServerSession } from "next-auth"
import Link from 'next/link'
import { notFound } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import Project from '@/models/Project'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

// 1. Define the Interface (Tells TypeScript what a Project is)
interface ProjectDoc {
  _id: mongoose.Types.ObjectId | string;
  title: string;
  description: string;
  software_type: string;
  tags: string[];
  file_url: string;
  screenshots: string[];
  youtube_url?: string;
  author_id: string;
  createdAt: Date | string;
  downloads: number;
  likes: number;
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // 2. Fix "isValid" Error: Use mongoose.Types.ObjectId
  if (!mongoose.isValidObjectId(id)) {
    return notFound()
  }

  // 3. Fetch & Type Cast
  await dbConnect()
  
  // We use 'as unknown as ProjectDoc' to force TypeScript to trust our data structure
  const rawProject = await Project.findById(id).lean() as unknown as ProjectDoc

  if (!rawProject) {
    return notFound()
  }

  // 4. Serialize Data (Convert ObjectId & Dates to Strings for Next.js)
  const project: ProjectDoc = {
    ...rawProject,
    _id: rawProject._id.toString(),
    createdAt: new Date(rawProject.createdAt).toISOString(),
  }

  // 5. Get User Session (NextAuth)
  const session = await getServerSession()
  const user = session?.user

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/library" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
            ← Back to Library
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* --- LEFT COLUMN: CONTENT --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header */}
            <div className="animate-fade-in">
              <div className="flex gap-2 mb-4">
                <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {project.software_type}
                </span>
                {project.tags?.map((tag: string) => (
                  <span key={tag} className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-medium">#{tag}</span>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                {project.title}
              </h1>
            </div>

            {/* Media Gallery */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 aspect-video animate-fade-in">
              {project.youtube_url ? (
                <iframe 
                  src={`https://www.youtube.com/embed/${project.youtube_url.split('v=')[1]?.split('&')[0]}`} 
                  className="w-full h-full"
                  allowFullScreen
                  title="Project Demo"
                />
              ) : project.screenshots && project.screenshots.length > 0 ? (
                <img 
                  src={project.screenshots[0]} 
                  className="w-full h-full object-contain" 
                  alt="Main Preview" 
                />
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900">
                    <span className="text-lg">No Preview Available</span>
                 </div>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-invert prose-lg max-w-none text-slate-300 animate-slide-up">
              <h3 className="text-white font-bold text-xl mb-4">Project Overview</h3>
              <div className="whitespace-pre-wrap leading-relaxed">
                {project.description}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <div className="space-y-6 animate-slide-up">
            
            {/* Download Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-28">
              <h3 className="text-white font-bold text-lg mb-2">Get the Files</h3>
              <p className="text-slate-400 text-sm mb-6">
                Includes source code, simulation files, and documentation.
              </p>

              {user ? (
                 <a 
                   href={project.file_url} 
                   download 
                   target="_blank"
                   rel="noopener noreferrer"
                   className="block w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-center font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-1"
                 >
                   Download Project 
                   <span className="ml-2 opacity-70 text-sm">(.zip)</span>
                 </a>
              ) : (
                 <div className="text-center p-4 bg-slate-950 rounded-xl border border-slate-800 border-dashed">
                    <p className="text-slate-400 text-sm mb-3">Sign in to access source files.</p>
                    <Link href="/login" className="block w-full py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-colors">
                      Log In to Download
                    </Link>
                 </div>
              )}

              {/* Author Info */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                    {project.author_id.substring(0, 2).toUpperCase()}
                 </div>
                 <div>
                    <p className="text-sm text-slate-400">Contributor ID</p>
                    <p className="text-white font-mono text-xs truncate w-32">
                      {project.author_id}
                    </p>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}