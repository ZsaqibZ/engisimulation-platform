import Link from 'next/link'

export default function ProjectCard({ project }: { project: any }) {
  // Color badges for software types
  const getBadgeColor = (type: string) => {
    const t = type.toLowerCase()
    if (t.includes('matlab') || t.includes('simulink')) return 'bg-red-500/20 text-red-300 border-red-500/30'
    if (t.includes('python')) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    if (t.includes('ansys')) return 'bg-yellow-600/20 text-yellow-500 border-yellow-600/30'
    if (t.includes('labview')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    return 'bg-slate-700 text-slate-300 border-slate-600'
  }

  return (
    <Link href={`/project/${project.id}`} className="group block h-full">
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        
        {/* Thumbnail Section */}
        <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
          {project.screenshots && project.screenshots.length > 0 ? (
            <img 
              src={project.screenshots[0]} 
              alt={project.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-800">
               <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}
          
          {/* Badge Overlay */}
          <div className="absolute top-3 left-3">
             <span className={`px-2 py-1 rounded-md text-xs font-bold border backdrop-blur-sm ${getBadgeColor(project.software_type)}`}>
               {project.software_type}
             </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
            {project.title}
          </h3>
          <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">
            {project.description}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-auto">
             <span className="text-xs text-slate-500 font-mono">
               {new Date(project.created_at).toLocaleDateString()}
             </span>
             <span className="text-xs font-medium text-blue-400 group-hover:underline">
               View Project →
             </span>
          </div>
        </div>
      </div>
    </Link>
  )
}