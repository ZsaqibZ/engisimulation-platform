'use client'

import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // 1. Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // 2. Listen for changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user)
        router.refresh()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsOpen(false)
        router.refresh()
        // Note: We do NOT redirect here anymore.
        // If they logout on /library, let them stay on /library as a guest.
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  // Close mobile menu on route change
  useEffect(() => setIsOpen(false), [pathname])

  if (pathname === '/login') return null

  // --- RENDER ---
  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-white">EngiSimulation</span>
          </Link>
          
          {/* MENU */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/library" className="text-sm font-medium text-slate-300 hover:text-white">Library</Link>
            
            {user ? (
              <>
                <Link href="/saved" className="text-sm font-medium text-slate-300 hover:text-white">Saved</Link>
                <Link href="/settings" className="text-sm font-medium text-slate-300 hover:text-white">Settings</Link>
                <div className="h-6 w-px bg-slate-700 mx-2"></div>
                <Link href="/upload" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  + Upload
                </Link>
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut()
                    // Optional: Redirect home ONLY when clicking Logout explicitly
                    router.push('/')
                  }} 
                  className="text-sm text-slate-400 hover:text-white"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                 <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white">Log In</Link>
                 <Link href="/login" className="bg-white text-slate-900 px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-200">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 p-4 flex flex-col gap-4">
          <Link href="/library" className="text-slate-200">Library</Link>
          {user ? (
            <>
               <Link href="/saved" className="text-slate-200">Saved</Link>
               <Link href="/upload" className="text-blue-400 font-bold">Upload Project</Link>
            </>
          ) : (
             <Link href="/login" className="text-white font-bold">Log In</Link>
          )}
        </div>
      )}
    </nav>
  )
}