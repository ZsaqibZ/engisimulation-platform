'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh() // Clear server cache
    router.push('/login') // Send back to login
  }

  return (
    <button 
      onClick={handleSignOut}
      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors border border-red-200 hover:border-red-400 px-3 py-1 rounded"
    >
      Sign Out
    </button>
  )
}