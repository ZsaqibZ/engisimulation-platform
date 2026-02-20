'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()

  // --- STATE ---
  const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [signupStep, setSignupStep] = useState<1 | 2>(1) // Step 1: Email, Step 2: Details

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // --- HANDLERS ---

  const handleGoogleLogin = async () => {
    // NextAuth Google Sign In
    await signIn('google', { callbackUrl: '/library' })
  }

  const handleContinueSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setMessage("Please enter a valid email address.")
      return
    }
    setMessage('')
    setSignupStep(2) // Move to Step 2
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (view === 'sign-up') {
        // --- SIGN UP LOGIC (Call API) ---
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName })
        })
        const data = await res.json()

        if (!data.success) throw new Error(data.error)

        setMessage('✅ Account created! Signing you in...')

        // Auto sign in
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password
        })

        if (result?.error) throw new Error(result.error)

        router.push('/library')
        router.refresh()

      } else {
        // --- SIGN IN LOGIC (NextAuth Credentials) ---
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password
        })

        if (result?.error) throw new Error("Invalid email or password")

        router.push('/library')
        router.refresh()
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 relative overflow-hidden font-sans">

      {/* --- BACKGROUND ENGINEERING GRID --- */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-700" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
        {/* Radial Fade to make content readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950"></div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 animate-fade-in hover:border-blue-500/30 transition-colors duration-500">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="EngiSimulation" className="h-12 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">
            {view === 'sign-in' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-400 text-sm">
            {view === 'sign-in'
              ? 'Enter your credentials to access the library.'
              : 'Join the engineering community today.'}
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`mb-6 p-3 rounded-lg text-sm font-medium border ${message.includes('Account created') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* --- VIEW: SIGN IN (Standard) --- */}
        {view === 'sign-in' && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl transition-all shadow-lg mb-4"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Sign in with Google
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase font-bold">Or with Email</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
              <input
                type="email" required
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="engineer@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
              <input
                type="password" required
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* --- VIEW: SIGN UP (Multi-Step) --- */}
        {view === 'sign-up' && (
          <form onSubmit={signupStep === 1 ? handleContinueSignup : handleFinalSubmit} className="space-y-4">

            {/* STEP 1: Email & Google */}
            {signupStep === 1 && (
              <div className="animate-slide-up">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl transition-all shadow-lg mb-4"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase font-bold">Or Sign Up with Email</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <input
                    type="email" required
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600 outline-none"
                    placeholder="engineer@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>

                <button type="submit" className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all">
                  Continue →
                </button>
              </div>
            )}

            {/* STEP 2: Personal Details */}
            {signupStep === 2 && (
              <div className="animate-slide-up space-y-4">
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg flex justify-between items-center">
                  <span className="text-sm text-slate-300">{email}</span>
                  <button type="button" onClick={() => setSignupStep(1)} className="text-xs text-blue-400 hover:underline">Edit</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                    <input type="text" required className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} autoFocus />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                    <input type="text" required className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Create Password</label>
                  <input type="password" required minLength={6} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50">
                  {loading ? 'Creating Account...' : 'Finish Sign Up'}
                </button>
              </div>
            )}
          </form>
        )}

        {/* Toggle View Footer */}
        <div className="mt-6 text-center pt-6 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            {view === 'sign-in' ? "New here?" : "Already have an account?"}
            <button
              onClick={() => {
                setView(view === 'sign-in' ? 'sign-up' : 'sign-in')
                setSignupStep(1) // Reset step
                setMessage('')
              }}
              className="ml-2 text-blue-400 font-bold hover:underline focus:outline-none"
            >
              {view === 'sign-in' ? 'Create Account' : 'Log In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}