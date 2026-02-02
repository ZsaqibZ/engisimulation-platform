'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* COLUMN 1: BRAND & MISSION */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
                 <span className="text-white font-black text-sm">E</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">EngiSimulation</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              The leading marketplace for high-fidelity engineering simulations, 
              CAD models, and technical assets for professionals worldwide.
            </p>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Platform</h3>
            <ul className="space-y-4">
              <FooterLink href="/library">Browse Library</FooterLink>
              <FooterLink href="/upload">Upload Project</FooterLink>
              <FooterLink href="/pricing">Premium Plans</FooterLink>
              <FooterLink href="/docs">API Documentation</FooterLink>
            </ul>
          </div>

          {/* COLUMN 3: SOCIALS & LEGAL */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Community</h3>
            <ul className="space-y-4">
              <FooterLink href="https://github.com">GitHub Repository</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/contact">Contact Support</FooterLink>
            </ul>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">
            © {currentYear} EngiSimulation Inc. Built for engineers, by engineers.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-mono text-slate-700 uppercase tracking-tighter">
              v1.2.0-stable
            </span>
            <div className="flex gap-4">
              <SocialIcon icon="𝕏" href="#" />
              <SocialIcon icon="In" href="#" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

/**
 * Sub-component for navigation links with premium hover effects
 */
function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <li>
      <Link 
        href={href} 
        className="text-slate-500 hover:text-white text-sm transition-colors duration-300 ease-in-out"
      >
        {children}
      </Link>
    </li>
  )
}

/**
 * Simple icon wrapper for social links
 */
function SocialIcon({ icon, href }: { icon: string, href: string }) {
  return (
    <a 
      href={href} 
      className="text-slate-600 hover:text-blue-500 transition-colors duration-300 text-sm font-bold"
    >
      {icon}
    </a>
  )
}