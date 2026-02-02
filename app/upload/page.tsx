import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UploadForm from '../components/UploadForm'
import { Suspense } from 'react'

export default async function UploadPage() {
  const cookieStore = await cookies()
  
  // 1. Initialize Supabase with the cookie store
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  // 2. Perform a fast Auth Check
  // We wrap this to ensure if Supabase hangs, the whole page request doesn't stay pending forever
  const { data: { user }, error } = await supabase.auth.getUser().catch((err) => {
    console.error("Auth hanging error:", err)
    return { data: { user: null }, error: err }
  })

  // 3. If no user is found, send them back to login immediately
  if (!user || error) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Upload <span className="text-blue-500">Project</span>
          </h1>
        </header>

        {/* 4. Use Suspense to prevent the page from waiting for the Form's client-side JS */}
        <Suspense fallback={<div className="text-white text-center animate-pulse">Loading uploader...</div>}>
          <UploadForm user={user} />
        </Suspense>
      </div>
    </main>
  )
}