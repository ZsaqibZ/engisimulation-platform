'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { SOFTWARE_LIST } from '@/lib/constants'
import DeleteProjectButton from '@/app/components/DeleteProjectButton'

interface Project {
    _id: string
    title: string
    description: string
    software_type: string
    screenshots?: string[]
    tags?: string[]
    author_id?: string
}

interface LibraryClientProps {
    projects: Project[]
    userId?: string
}

export default function LibraryClient({ projects, userId }: LibraryClientProps) {
    const [search, setSearch] = useState('')
    const [softwareFilter, setSoftwareFilter] = useState('All')

    const filtered = useMemo(() => {
        return projects.filter((p) => {
            const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
            const matchesSoftware = softwareFilter === 'All' || p.software_type === softwareFilter
            return matchesSearch && matchesSoftware
        })
    }, [projects, search, softwareFilter])

    return (
        <>
            {/* Search + Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by project name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                    />
                </div>

                {/* Software Filter Dropdown */}
                <select
                    value={softwareFilter}
                    onChange={(e) => setSoftwareFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer sm:w-64"
                >
                    <option value="All">All Software</option>
                    {SOFTWARE_LIST.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Results Count */}
            {(search || softwareFilter !== 'All') && (
                <p className="text-sm text-slate-500 mt-1">
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
                    {search && <span> for &ldquo;<span className="text-slate-300">{search}</span>&rdquo;</span>}
                    {softwareFilter !== 'All' && <span> in <span className="text-slate-300">{softwareFilter}</span></span>}
                </p>
            )}

            {/* Project Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filtered.map((project) => (
                        <Link
                            href={`/project/${project._id}`}
                            key={project._id}
                            className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
                        >
                            {/* Thumbnail */}
                            <div className="h-48 bg-slate-950 relative overflow-hidden border-b border-slate-800">
                                {project.screenshots && project.screenshots[0] ? (
                                    <img
                                        src={project.screenshots[0]}
                                        alt={project.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-800 text-4xl">⚡</div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <div className="bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white border border-slate-800">
                                        {project.software_type}
                                    </div>
                                    {userId && userId === project.author_id && (
                                        <DeleteProjectButton projectId={project._id} />
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col gap-3 flex-1">
                                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                                    {project.title}
                                </h3>
                                <p className="text-slate-400 text-sm line-clamp-2">{project.description}</p>
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
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 mt-6">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
                    <p className="text-slate-400 text-sm">
                        {search || softwareFilter !== 'All'
                            ? 'Try a different search term or software filter.'
                            : 'The library is currently empty.'}
                    </p>
                    {search || softwareFilter !== 'All' ? (
                        <button
                            onClick={() => { setSearch(''); setSoftwareFilter('All') }}
                            className="mt-4 px-4 py-2 text-sm text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-colors"
                        >
                            Clear Filters
                        </button>
                    ) : null}
                </div>
            )}
        </>
    )
}
