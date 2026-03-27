import { notFound } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Project from '@/models/Project'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EngineerPortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  await dbConnect();
  
  // 1. Find User by Username
  const user = await User.findOne({ username }).lean() as any;
  
  if (!user) {
    return notFound();
  }
  
  // Fetch all public projects by this author, excluding deleted
  const projects = await Project.find({ author_id: user._id.toString(), isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
  
  // 3. Aggregate Metrics
  const totalDownloads = projects.reduce((sum: number, p: any) => sum + (p.downloads || 0), 0);
  const totalLikes = projects.reduce((sum: number, p: any) => sum + (p.likes || 0), 0);
  
  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Profile Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden mb-12 animate-fade-in">
          {/* Decorative Background Flare */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
            {/* Avatar */}
            <div className="h-32 w-32 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-950 shrink-0">
              {(user.avatar_url || user.image) ? (
                <img src={user.avatar_url || user.image} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-slate-700 font-bold">
                  {(user.name || user.full_name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-3xl font-black text-white">{user.full_name || user.name || 'Anonymous Engineer'}</h1>
                <p className="text-blue-400 font-mono text-sm mt-1">@{user.username}</p>
                {user.job_title && <p className="text-slate-400 mt-1">{user.job_title}</p>}
              </div>
              
              {user.bio && (
                <p className="text-slate-300 max-w-2xl leading-relaxed">{user.bio}</p>
              )}
              
              {/* Links */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                {user.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                    🌐 Website
                  </a>
                )}
                {user.github_url && (
                  <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                    📦 GitHub
                  </a>
                )}
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex md:flex-col gap-6 md:gap-8 bg-slate-950/50 p-6 rounded-2xl border border-slate-800 shrink-0">
              <div className="text-center">
                <p className="text-3xl font-black text-amber-500">{user.reputation || 0}</p>
                <p className="text-xs font-bold text-amber-500/50 uppercase tracking-widest mt-1">Reputation</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-white">{projects.length}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-blue-400">{totalDownloads}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Downloads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <h2 className="text-2xl font-bold text-white mb-6">Published Simulations</h2>
        
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-slate-500 text-lg">No projects published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {projects.map((project: any) => (
              <Link href={`/project/${project._id}`} key={project._id.toString()} className="group">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 h-full flex flex-col">
                  {/* Badge */}
                  <div className="mb-4">
                    <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      {project.software_type}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {project.title}
                  </h3>
                  
                  {/* Footer Stats */}
                  <div className="mt-auto pt-6 border-t border-slate-800 flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-500 flex items-center gap-2">
                      ⬇ {project.downloads || 0}
                    </span>
                    <span className="text-slate-600">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
