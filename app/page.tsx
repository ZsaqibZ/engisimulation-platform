import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col selection:bg-blue-500/30">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-20 px-4">
        
        {/* Advanced CSS Background Effects */}
        <div className="absolute inset-0 z-0">
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-slate-950/40 z-10"></div>
            
            {/* Technical Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px:32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            
            {/* Glowing Mesh Orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] opacity-50 z-0 animate-pulse-subtle"></div>
        </div>
        
        {/* Content Container */}
        <div className="max-w-7xl mx-auto relative z-20 text-center">
          {/* Animated Badge */}
          <div className="animate-fade-in opacity-0 [animation-fill-mode:forwards]">
            <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-10 backdrop-blur-md">
              The Future of Engineering
            </span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white mb-8 leading-[0.9] animate-slide-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
            The Standard <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-700">
              for Simulation.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium animate-slide-up opacity-0 [animation-fill-mode:forwards] [animation-delay:400ms]">
            Accelerate your workflow with a curated marketplace of verified 
            MATLAB, Ansys, and Python-driven engineering assets.
          </p>
          
          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 animate-slide-up opacity-0 [animation-fill-mode:forwards] [animation-delay:600ms]">
            <Link 
              href="/library" 
              className="group relative px-10 py-4 bg-blue-600 text-white font-black text-lg rounded-2xl transition-all hover:bg-blue-500 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:-translate-y-1 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10">Start Browsing</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Link>
            
            <Link 
              href="/login" 
              className="px-10 py-4 glass text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all active:scale-95"
            >
              Contributor Login
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* --- TRUST & FEATURES GRID --- */}
      <section className="relative z-20 py-24 border-t border-slate-900 bg-slate-950/50 backdrop-blur-xl">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               
               <FeatureCard 
                 icon="🚀" 
                 title="Fast Deployment" 
                 desc="Instant access to source code and simulation parameters to jumpstart your next project."
               />
               <FeatureCard 
                 icon="🛡️" 
                 title="Verified Assets" 
                 desc="Every project is reviewed for structural integrity and code accuracy by our peer network."
               />
               <FeatureCard 
                 icon="🌐" 
                 title="Open Standards" 
                 desc="Built on a philosophy of transparency and collaborative engineering advancement."
               />

            </div>
         </div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="group p-8 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 hover:border-blue-500/30 transition-all duration-500">
      <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-400 transition-colors">
        {desc}
      </p>
    </div>
  )
}