import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
// Remove the 'redirect' import

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // DELETED: The automatic redirect block. 
  // We no longer force user -> redirect('/library')

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      <section className="relative flex-1 flex flex-col justify-center items-center overflow-hidden pt-20 pb-20">
        
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-slate-950/90 z-10"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] z-0"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-20 text-center animate-fade-in">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-sm">
            Open Source Engineering
          </span>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white mb-8 leading-tight drop-shadow-2xl">
            The Standard for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Simulation
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Join the community. Download verified projects for MATLAB/Simulink, LabVIEW, Ansys and more.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-slide-up">
            {/* Both buttons now simply go to /library */}
            <Link 
              href="/library" 
              className="px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-500 transition-all shadow-xl hover:shadow-blue-500/25 hover:-translate-y-1"
            >
              {user ? 'Go to Dashboard' : 'Start Browsing'}
            </Link>
            
            {!user && (
              <Link 
                href="/login" 
                className="px-10 py-4 bg-slate-800/50 border border-slate-700 text-white font-bold text-lg rounded-xl hover:bg-slate-800 transition-all backdrop-blur-md"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="border-t border-slate-900 bg-slate-950 py-12 relative z-20">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div><div className="text-3xl mb-2">🚀</div><h3 className="text-white font-bold">Fast Downloads</h3></div>
            <div><div className="text-3xl mb-2">🛡️</div><h3 className="text-white font-bold">Verified Code</h3></div>
            <div><div className="text-3xl mb-2">👥</div><h3 className="text-white font-bold">Community Driven</h3></div>
         </div>
      </div>
    </main>
  )
}