'use client'

import { createBrowserClient } from '@supabase/ssr' // Use the new library
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  
  // 1. Initialize the client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 2. Listen for Auth Changes (The Fix)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // Force the router to go to Home
        router.refresh() // Updates server components
        router.push('/') 
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow border border-gray-200">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to EngiSimulation
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the community to upload your projects
          </p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']} 
          theme="light"
          showLinks={true} // Shows "Sign Up" / "Forgot Password" links
          redirectTo="http://localhost:3000/auth/callback" // Important for Magic Links/OAuth
        />
      </div>
    </div>
  )
}