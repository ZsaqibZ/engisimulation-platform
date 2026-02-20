import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" // We import the config we just created
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  // 1. Get User Session (The MongoDB Way)
  const session = await getServerSession(authOptions)
  const user = session?.user

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-50 relative overflow-hidden">
      
      {/* --- BACKGROUND ENGINEERING GRID --- */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-700"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
        {/* Radial Fade to make content readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950"></div>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 flex-1 flex flex-col justify-center items-center pt-32 pb-24 text-center px-4">
        
        {/* Glow Effect behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>

        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 backdrop-blur-md mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">v1.0 Public Beta</span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          The Standard for <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
            Engineering Simulation
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-slide-up" style={{ animationDelay: '0.2s' }}>
          A unified repository for verifying, sharing, and discovering high-fidelity models. 
          Optimized for MATLAB/Simulink ,LabVIEW ,Python and more.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Link 
            href="/library" 
            className="group relative px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg overflow-hidden transition-all hover:bg-blue-500 hover:shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              {user ? 'Go to Dashboard' : 'Explore Library'}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </span>
          </Link>

          {!user && (
            <Link 
              href="/api/auth/signin" 
              className="px-8 py-4 bg-transparent border border-slate-700 text-slate-300 font-semibold text-lg rounded-lg hover:bg-slate-800/50 hover:text-white transition-all backdrop-blur-sm"
            >
              Contributor Access
            </Link>
          )}
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="relative z-10 border-t border-slate-800 bg-slate-950/50 backdrop-blur-lg py-24">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="group p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">High Performance</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Direct download links for optimized source code. No wait times, no ads, just raw engineering files ready for implementation.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Verified Integrity</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Every simulation is reviewed for syntax errors and logic flaws. We ensure the models run correctly on standard environments.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Collaborative</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Built by engineers, for engineers. Contribute your own research, get feedback, and build your professional portfolio.
                </p>
              </div>

            </div>
         </div>
      </section>

      {/* --- STATS FOOTER --- */}
      <div className="border-t border-slate-900 py-10 text-center">
        <p className="text-slate-600 text-sm font-mono uppercase tracking-widest">
          Trusted by engineers from top institutions
        </p>
      </div>
    </main>
  )
}