import { getServerSession } from "next-auth"
import Link from 'next/link'
import { notFound } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import Project from '@/models/Project'
import User from '@/models/User'
import mongoose from 'mongoose'
import ProjectGallery from '@/app/components/ProjectGallery'
import BookmarkButton from '@/app/components/BookmarkButton'
import CommentSection from '@/app/components/CommentSection'

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
  verified_version?: string | null;
  security_status?: string;
  scan_results?: string | null;
  isDeleted?: boolean;
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
  const rawProject = await Project.findById(id).lean() as unknown as ProjectDoc | null

  if (!rawProject || rawProject.isDeleted) {
    return notFound()
  }

  // Also fetch the author's reputation
  const authorUser = await User.findById(rawProject.author_id).select('reputation username').lean() as any;
  const authorReputation = authorUser ? (authorUser.reputation || 0) : 0;
  const authorUsername = authorUser ? authorUser.username : null;

  // 4. Serialize Data (Convert ObjectId & Dates to Strings for Next.js)
  const project: ProjectDoc = {
    ...rawProject,
    _id: rawProject._id.toString(),
    createdAt: new Date(rawProject.createdAt).toISOString(),
  }

  // 5. Get User Session (NextAuth)
  const session = await getServerSession()
  const user = session?.user

  // 6. Fetch Similar Projects via Vector Search (or Fallback keywords)
  let similarProjects = []
  try {
    if ((rawProject as any).embedding && Array.isArray((rawProject as any).embedding) && (rawProject as any).embedding.length > 0) {
      similarProjects = await Project.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: (rawProject as any).embedding,
            numCandidates: 10,
            limit: 4
          }
        },
        {
          $match: {
            _id: { $ne: rawProject._id },
            isDeleted: { $ne: true } // Exclude deleted projects
          }
        }
      ])
    } else {
      similarProjects = await Project.find({
        _id: { $ne: rawProject._id },
        isDeleted: { $ne: true }, // Exclude deleted projects
        $or: [
          { tags: { $in: project.tags || [] } },
          { software_type: project.software_type }
        ]
      }).limit(4).lean()
    }
  } catch (err) {
    // Fallback if vector index doesn't exist yet
    similarProjects = await Project.find({
      _id: { $ne: rawProject._id },
      isDeleted: { $ne: true }, // Exclude deleted projects
      $or: [
        { tags: { $in: project.tags || [] } },
        { software_type: project.software_type }
      ]
    }).limit(4).lean()
  }

  const related = similarProjects.map((p: any) => ({
    _id: p._id.toString(),
    title: p.title,
    software_type: p.software_type,
    author_id: p.author_id,
    downloads: p.downloads || 0
  }))

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
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {project.software_type}
                  </span>
                  {project.verified_version && (
                    <span className="bg-green-600/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1" title="Verified Version via Automated Scan">
                      ✓ {project.verified_version}
                    </span>
                  )}
                  {project.security_status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 border ${
                      project.security_status === 'safe' ? 'bg-green-600/10 text-green-400 border-green-500/20' : 
                      project.security_status === 'flagged' ? 'bg-red-600/10 text-red-400 border-red-500/20' : 
                      'bg-yellow-600/10 text-yellow-500 border-yellow-500/20'
                    }`} title={(project as any).scan_results || 'VirusTotal Scan Pending'}>
                      {project.security_status === 'safe' ? '🛡️ Safe' : 
                       project.security_status === 'flagged' ? '⚠️ Malware Detected' : 
                       '⏳ Pending Scan'}
                    </span>
                  )}
                  {project.tags?.map((tag: string) => (
                    <span key={tag} className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-medium">#{tag}</span>
                  ))}
                </div>
                {user && (
                  <div className="shrink-0 z-10">
                    <BookmarkButton projectId={project._id as string} />
                  </div>
                )}
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
                <ProjectGallery images={project.screenshots} />
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
                <>
                  <a
                    href={project.file_url}
                    download={`${project.title.replace(/\s+/g, '_')}.zip`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-center font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-1"
                  >
                    Download Latest Version
                    <span className="ml-2 opacity-70 text-sm">(.zip)</span>
                  </a>

                  {(project as any).versions && (project as any).versions.length > 0 && (
                    <div className="mt-4 animate-fade-in">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Previous Versions</label>
                      <select 
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all text-sm mb-3"
                        onChange={(e) => {
                          if (e.target.value) window.open(e.target.value, '_blank');
                        }}
                      >
                        <option value="">Select an older version...</option>
                        {(project as any).versions.map((ver: any, i: number) => (
                          <option key={i} value={ver.file_url}>
                            {ver.version_string} - {new Date(ver.uploaded_at).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                      
                      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Changelog History</p>
                        <ul className="text-xs text-slate-500 space-y-2">
                          {(project as any).versions.slice().reverse().slice(0, 3).map((ver: any, i: number) => (
                            <li key={i} className="border-l-2 border-slate-800 pl-2 py-1">
                              <span className="font-bold text-blue-400 block">{ver.version_string}</span>
                              <span className="italic">{ver.changelog}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {project.author_id === user.id && (
                    <Link
                      href={`/project/${project._id}/edit`}
                      className="mt-6 block w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-center font-bold rounded-xl border border-slate-700 transition-colors"
                    >
                      ✏️ Edit Project & Push Updates
                    </Link>
                  )}
                </>
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
                  <Link href={authorUsername ? `/engineer/${authorUsername}` : `#`} className="text-white font-bold hover:text-blue-400 transition-colors block">
                    {authorUsername ? `@${authorUsername}` : 'Unknown'}
                  </Link>
                  <p className="text-xs text-amber-500 font-bold mt-1">
                    {authorReputation} rep
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* --- RELATED SIMULATIONS CAROUSEL --- */}
        {related.length > 0 && (
          <div className="mt-20 pt-10 border-t border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-6">Related Simulations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((sim: any) => (
                <Link href={`/project/${sim._id}`} key={sim._id} className="block group">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
                    <div className="mb-3">
                      <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md uppercase tracking-wide">
                        {sim.software_type}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {sim.title}
                    </h3>
                    <div className="flex justify-between items-center text-sm text-slate-500 mt-4">
                      <span>By {sim.author_id.substring(0, 8)}...</span>
                      <span>{sim.downloads} ↓</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* --- DISCUSSION (COMMENTS) --- */}
        <div className="mt-20 pt-10 border-t border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-8">Discuss this Simulation</h2>
          <CommentSection projectId={project._id.toString()} authorId={project.author_id} />
        </div>

      </div>
    </main>
  )
}