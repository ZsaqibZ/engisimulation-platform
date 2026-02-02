'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const pathname = usePathname()
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Sync Auth State
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_IN') router.refresh()
      if (event === 'SIGNED_OUT') setIsDropdownOpen(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  // Close menus on click-outside or route change
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsDropdownOpen(false)
  }, [pathname])

  if (pathname === '/login') return null

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Restoring the original image logo */}
            <img 
              src="/logo.png" 
              alt="EngiSimulation Logo" 
              className="h-10 w-auto transition-transform group-hover:scale-105" 
            />
            <span className="text-xl font-bold tracking-tight text-white">EngiSimulation</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="/library">Library</NavLink>
            
            {!isLoading && (
              user ? (
                <div className="flex items-center gap-6">
                  <Link href="/upload" className="text-sm font-bold text-blue-400 hover:text-blue-300">
                    + Upload
                  </Link>
                  
                  
                  {/* User Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 p-1 rounded-full border border-slate-700 hover:border-blue-500 transition-all"
                    >
                      <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                        {user.email?.[0].toUpperCase()}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-48 glass rounded-xl shadow-2xl py-2 z-[60]"
                        >
                          <DropdownItem href="/settings">Settings</DropdownItem>
                          <DropdownItem href="/saved">Saved Projects</DropdownItem>
                          <DropdownItem href="/library?view=my_projects">My Projects</DropdownItem>
                          <hr className="my-2 border-slate-800" />
                          <button 
                            onClick={() => supabase.auth.signOut()}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                          >
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                   <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-all">Log In</Link>
                   <Link href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95">
                    Sign Up
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden p-2 text-slate-300 hover:text-white"
          >
            <span className="text-2xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Slide-down */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-slate-800 bg-slate-950 overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              <Link href="/library" className="text-slate-300 px-2 py-1">Library</Link>
              {user ? (
                <>
                  <Link href="/saved" className="text-slate-300 px-2 py-1">Saved</Link>
                  <Link href="/settings" className="text-slate-300 px-2 py-1">Settings</Link>
                  <Link href="/upload" className="bg-blue-600 text-white p-3 rounded-lg text-center font-bold">Upload Project</Link>
                  <button onClick={() => supabase.auth.signOut()} className="text-red-400 text-left px-2 py-1">Sign Out</button>
                </>
              ) : (
                <Link href="/login" className="bg-blue-600 text-white p-3 rounded-lg text-center font-bold">Get Started</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

// Helper Components for cleaner code
function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-slate-400 hover:text-white transition-all duration-300 relative group">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full" />
    </Link>
  )
}

function DropdownItem({ href, children }: { href: string, children: React.ReactNode }) {
  
  return (
    <Link href={href} className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
      {children}
    </Link>
  )
}