import { notFound } from 'next/navigation'
import ProjectCard from '@/app/components/ProjectCard'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Project from '@/models/Project'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  await dbConnect()

  // 1. Fetch Profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let profile: any;
  try {
    profile = await User.findById(id).lean();
  } catch {
    // Potentially invalid ID
  }

  if (!profile) return <div className="p-20 text-center">User not found</div>

  // 2. Fetch User's Projects
  const projects = await Project.find({ author_id: id }).sort({ createdAt: -1 }).lean();

  // Normalize _id to string for serialization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedProjects = projects.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt.toISOString(),
    author_id: p.author_id.toString(),
  }))

  const serializedProfile = {
    ...profile,
    _id: profile._id.toString(),
    updated_at: profile.updated_at ? new Date(profile.updated_at).toISOString() : null,
    createdAt: profile.createdAt ? new Date(profile.createdAt).toISOString() : null,
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* 1. COVER HEADER (Gradient) */}
      <div className="h-48 bg-gradient-to-r from-gray-900 via-brand-900 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20 mb-12 animate-slide-up">

        {/* 2. PROFILE CARD */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-end gap-6">

          {/* Avatar */}
          <div className="relative">
            <div className="h-32 w-32 rounded-xl bg-white p-1 shadow-md">
              {serializedProfile.image ? (
                <img src={serializedProfile.image} alt={serializedProfile.name || "User Avatar"} className="h-full w-full object-cover rounded-lg" />
              ) : (
                <div className="h-full w-full bg-brand-100 text-brand-600 flex items-center justify-center text-4xl font-bold rounded-lg uppercase">
                  {serializedProfile.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-gray-900">{serializedProfile.name || 'Anonymous User'}</h1>
            <p className="text-lg text-gray-600 font-medium mb-2">{serializedProfile.job_title || 'Engineering Enthusiast'}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
              {serializedProfile.linkedin_url && (
                <a href={serializedProfile.linkedin_url} target="_blank" className="flex items-center gap-1 hover:text-blue-700 transition-colors">
                  <span className="font-bold">in</span> LinkedIn Profile
                </a>
              )}
              <span className="flex items-center gap-1">
                📅 Joined {serializedProfile.createdAt ? new Date(serializedProfile.createdAt).toLocaleDateString() : 'recently'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 text-center bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div>
              <div className="text-2xl font-bold text-gray-900">{serializedProjects?.length || 0}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Projects</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROJECT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-brand-500 pl-3">
          Contributions
        </h2>

        {serializedProjects && serializedProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {serializedProjects.map((project: any) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">This user has not uploaded any projects yet.</p>
          </div>
        )}
      </div>
    </main>
  )
}