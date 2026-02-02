'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Project {
  id: string;
  title: string;
  description: string;
  software_type: string;
  screenshots: string[];
  created_at: string;
}

export default function ProjectCard({ project }: { project: Project }) {
  // Mapping for engineering-specific software branding
  const badgeStyles: Record<string, string> = {
    matlab: 'bg-red-500/10 text-red-400 border-red-500/20',
    simulink: 'bg-red-500/10 text-red-400 border-red-500/20',
    python: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    ansys: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    labview: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    solidworks: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
  }

  const softwareKey = project.software_type.toLowerCase();
  const currentBadgeStyle = badgeStyles[softwareKey] || 'bg-slate-700/20 text-slate-300 border-slate-600/30';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Link href={`/project/${project.id}`} className="group block h-full">
        <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]">
          
          {/* Thumbnail Section with Skeleton Placeholder */}
          <div className="relative h-52 w-full bg-slate-800 overflow-hidden">
            {project.screenshots?.[0] ? (
              <img 
                src={project.screenshots[0]} 
                alt={project.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800 animate-pulse">
                 <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                 </svg>
              </div>
            )}
            
            {/* Glossy Badge Overlay */}
            <div className="absolute top-4 left-4">
               <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${currentBadgeStyle}`}>
                 {project.software_type}
               </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col flex-1">
            <h3 className="font-bold text-xl text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
              {project.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
              {project.description}
            </p>
            
            <div className="flex items-center justify-between pt-5 border-t border-slate-800/50 mt-auto">
               <div className="flex flex-col">
                 <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Released</span>
                 <span className="text-xs text-slate-300 font-mono">
                   {new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                 </span>
               </div>
               
               <div className="flex items-center gap-2 text-blue-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 Explore 
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                 </svg>
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}