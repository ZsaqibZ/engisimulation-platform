'use client'

import Link from 'next/link'
import SignOutButton from './SignOutButton'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false) // <--- New State for Mobile Menu

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user)
        router.refresh()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsOpen(false) // Close menu on logout
        router.refresh()
      }
    })

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [supabase, router])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (pathname === '/login') return null

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled || isOpen
          ? 'bg-white/95 backdrop-blur-md border-gray-200 py-2 shadow-sm' 
          : 'bg-white/50 backdrop-blur-sm border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group z-50">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
              E
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Engi<span className="text-blue-600">Simulation</span>
            </span>
          </Link>
          
          {/* --- DESKTOP MENU (Hidden on Mobile) --- */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Library</Link>
                <Link href="/saved" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Saved</Link>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <Link href="/upload" className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  + Upload
                </Link>
                <SignOutButton />
              </>
            ) : (
              <div className="flex items-center gap-4">
                 <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">Log In</Link>
                 <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* --- MOBILE HAMBURGER BUTTON (Visible on Mobile) --- */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 z-50"
          >
            {isOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl animate-fade-in px-4 py-6 flex flex-col gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900">Signed In</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
              <Link href="/" className="text-lg font-medium text-gray-800 py-2">Library</Link>
              <Link href="/saved" className="text-lg font-medium text-gray-800 py-2">Saved Projects</Link>
              <Link href="/upload" className="bg-blue-600 text-white text-center py-3 rounded-lg font-bold shadow-md">
                + Upload Project
              </Link>
              <div className="pt-2">
                 <SignOutButton /> 
                 {/* Note: You might need to style SignOutButton to be full width in its own component, or wrap it here */}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" className="text-center py-3 border border-gray-200 rounded-lg font-bold text-gray-700">
                Log In
              </Link>
              <Link href="/login" className="text-center py-3 bg-blue-600 text-white rounded-lg font-bold shadow-md">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}