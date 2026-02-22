'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from "next-auth/react"
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { data: session, status } = useSession()
  const user = session?.user

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()

  // Close menus on click-outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menus on route change
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
            {/* If you don't have logo.png, just delete the img tag */}
            {/* Logo Image */}
            <img src="/logo.png" alt="EngiSimulation Logo" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
            <span className="text-xl font-bold tracking-tight text-white">EngiSimulation</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="/library">Library</NavLink>

            {status === "loading" ? (
              // Loading Skeleton
              <div className="h-8 w-20 bg-slate-800 rounded animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center gap-6">
                <Link href="/upload" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  + Upload
                </Link>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full border border-slate-700 hover:border-blue-500 transition-all"
                  >
                    {user.image ? (
                      <img src={user.image} alt="User" className="h-8 w-8 rounded-full" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-3 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-[60] backdrop-blur-xl"
                      >
                        <div className="px-4 py-2 border-b border-slate-800 mb-2">
                          <p className="text-xs text-slate-500">Signed in as</p>
                          <p className="text-sm font-bold text-white truncate">{user.name || user.email}</p>
                        </div>

                        <DropdownItem href="/my-projects">My Projects</DropdownItem>
                        <DropdownItem href="/settings">Settings</DropdownItem>
                        <hr className="my-2 border-slate-800" />
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
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
                <button onClick={() => signIn()} className="text-sm font-medium text-slate-300 hover:text-white transition-all">
                  Log In
                </button>
                <button
                  onClick={() => signIn()}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95"
                >
                  Sign Up
                </button>
              </div>
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
              <Link href="/library" className="text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-900">Library</Link>
              {user ? (
                <>
                  <Link href="/my-projects" className="text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-900">My Projects</Link>
                  <Link href="/settings" className="text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-900">Settings</Link>
                  <Link href="/upload" className="bg-blue-600 text-white p-3 rounded-lg text-center font-bold">Upload Project</Link>
                  <button onClick={() => signOut()} className="text-red-400 text-left px-3 py-2 rounded-lg hover:bg-slate-900">Sign Out</button>
                </>
              ) : (
                <button onClick={() => signIn()} className="bg-blue-600 text-white p-3 rounded-lg text-center font-bold">Get Started</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

// Helper Components
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