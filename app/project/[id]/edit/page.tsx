import { redirect } from 'next/navigation'
import EditForm from '@/app/components/EditForm'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from '@/lib/mongodb'
import Project from '@/models/Project'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 1. Get User
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) redirect('/login')

  await dbConnect()

  // 2. Get Project Data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawProject: any = await Project.findById(id).lean()

  if (!rawProject) {
    return <div className="p-10 text-center text-red-600">Project Not Found</div>
  }

  const project = {
    ...rawProject,
    _id: rawProject._id.toString(),
    createdAt: rawProject.createdAt ? rawProject.createdAt.toISOString() : null,
    author_id: rawProject.author_id.toString(),
  }

  // 3. Security Check: Is this MY project?
  // user.id from NextAuth might be string, author_id is string (from my model usage)
  if (project.author_id !== user.id) {
    return <div className="p-10 text-center text-red-600">Unauthorized Access</div>
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Project</h1>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <EditForm project={project} />
        </div>
      </div>
    </main>
  )
}