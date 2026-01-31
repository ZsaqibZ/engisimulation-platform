'use client'

import Link from 'next/link'
import BookmarkButton from './BookmarkButton'

interface ProjectProps {
  project: {
    id: number
    title: string
    description: string
    software_type: string
    created_at: string
    screenshots: string[] | null
    tags?: string[] | null
  }
}

// Helper to get color classes based on software
const getBadgeColor = (type: string) => {
  const t = type.toLowerCase()
  if (t.includes('matlab') || t.includes('simulink')) return 'bg-matlab-bg text-matlab-text border-matlab-border'
  if (t.includes('python')) return 'bg-python-bg text-python-text border-python-border'
  if (t.includes('ansys')) return 'bg-ansys-bg text-ansys-text border-ansys-border'
  if (t.includes('labview')) return 'bg-labview-bg text-labview-text border-labview-border'
  return 'bg-gray-100 text-gray-700 border-gray-200' // Default
}

export default function ProjectCard({ project }: ProjectProps) {
  const thumbnail = (project.screenshots && project.screenshots.length > 0) 
    ? project.screenshots[0] 
    : null;

  return (
    <Link href={`/project/${project.id}`} className="group block h-full relative">
      <div className="bg-white flex flex-col h-full rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        
        {/* Thumbnail Area */}
        <div className="h-44 bg-gray-50 relative overflow-hidden">
          
          <div 
            className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
             <div className="bg-white rounded-full shadow-md p-0.5">
               <BookmarkButton projectId={project.id} />
             </div>
          </div>

          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={project.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 font-bold bg-gray-50/50">
               {/* Generative Pattern Background could go here */}
               <span className="text-4xl opacity-20">{project.software_type.charAt(0)}</span>
            </div>
          )}
          
          {/* Software Badge (Now using dynamic colors) */}
          <div className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border shadow-sm ${getBadgeColor(project.software_type)}`}>
            {project.software_type}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
              {project.title}
            </h3>
            {/* Date using Mono font */}
            <span className="font-mono-tech text-[10px] text-gray-400 mt-1 shrink-0">
               {new Date(project.created_at).toLocaleDateString(undefined, { month:'short', day:'numeric' })}
            </span>
          </div>
          
          <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
            {project.description}
          </p>
          
          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-2 overflow-hidden">
            {project.tags && project.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded-md font-medium border border-gray-100">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}