'use client'

import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import UploadForm from '@/app/components/UploadForm' // Imports the correct component

export default function UploadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Upload Project</h1>
        <p className="text-slate-400">Share your engineering simulation with the world.</p>
      </div>

      <UploadForm user={session?.user} />
    </main>
  )
}