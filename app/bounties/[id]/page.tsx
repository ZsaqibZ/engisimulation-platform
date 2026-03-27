import { notFound } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import Bounty from '@/models/Bounty'
import User from '@/models/User'
import Project from '@/models/Project'
import Link from 'next/link'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export default async function BountyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  await dbConnect()
  
  const bounty = await Bounty.findById(id).lean() as any
  if (!bounty || bounty.isDeleted) return notFound()

  const requester = await User.findById(bounty.requesterId).select('username image name').lean() as any
  
  let solutionProject = null
  let solverUser = null
  if (bounty.solutionProjectId) {
    solutionProject = await Project.findById(bounty.solutionProjectId).select('title').lean() as any
    if (bounty.solverId) {
       solverUser = await User.findById(bounty.solverId).select('username').lean() as any
    }
  }

  const session = await getServerSession(authOptions)
  const isRequester = session?.user && (session.user as any).id === bounty.requesterId

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/bounties" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium mb-8">
          ← Back to Bounties
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

          <div className="flex justify-between items-start gap-4 mb-6 relative z-10">
            <span className={`px-4 py-2 rounded-lg text-sm font-black tracking-wider uppercase flex items-center gap-2 ${
              bounty.status === 'open' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
              : 'bg-green-500/10 text-green-500 border border-green-500/20'
            }`}>
              {bounty.status === 'open' ? '💎 Open Bounty' : '✓ Solved & Paid'}
            </span>
            <div className="text-right">
              <p className="text-3xl font-black text-amber-500">{bounty.reward_points}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">REP Reward</p>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight relative z-10">
            {bounty.title}
          </h1>

          <div className="flex items-center gap-4 py-6 border-y border-slate-800/50 mb-8 relative z-10">
             <div className="h-12 w-12 rounded-full bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-slate-500 font-bold">
                {requester?.image ? <img src={requester.image} className="w-full h-full object-cover" /> : (requester?.username?.charAt(0) || '?')}
             </div>
             <div>
               <p className="text-sm text-slate-400">Requested by</p>
               <Link href={requester?.username ? `/engineer/${requester.username}` : '#'} className="text-white font-bold hover:text-blue-400">
                 @{requester?.username || 'user'}
               </Link>
             </div>
             <div className="ml-auto text-right">
                <p className="text-sm text-slate-400">Posted on</p>
                <p className="text-white font-medium">{new Date(bounty.createdAt).toLocaleDateString()}</p>
             </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-slate-300 relative z-10 whitespace-pre-wrap leading-relaxed">
            {bounty.description}
          </div>

          {/* Solution Status Area */}
          <div className="mt-12 pt-8 border-t border-slate-800 relative z-10">
             {bounty.status === 'completed' && solutionProject && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-green-400">✓</span> Solution Accepted
                  </h3>
                  <p className="text-slate-300 mb-2">
                    This bounty was solved by <Link href={solverUser?.username ? `/engineer/${solverUser.username}` : '#'} className="text-blue-400 font-bold hover:underline">@{solverUser?.username || 'user'}</Link>.
                  </p>
                  <p className="text-slate-400">
                    Project: <Link href={`/project/${solutionProject._id}`} className="text-white font-medium hover:underline">{solutionProject.title}</Link>
                  </p>
                </div>
             )}

             {bounty.status === 'open' && isRequester && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-inner">
                  <h3 className="text-lg font-bold text-white mb-2">Award this Bounty</h3>
                  <p className="text-slate-400 text-sm mb-4">Paste the Project ID of the valid solution to transfer the escrowed points.</p>
                  
                  <form action="/api/bounties/client-solve" method="POST" className="flex gap-3" onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const input = form.elements.namedItem('projectId') as HTMLInputElement;
                      const pid = input.value;
                      if (!pid) return;

                      try {
                        const res = await fetch(`/api/bounties/${bounty._id}/solve`, {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ projectId: pid })
                        });
                        if (res.ok) window.location.reload();
                        else alert('Failed to award bounty. Verify the project ID.');
                      } catch (err) {
                        alert('Error awarding bounty.');
                      }
                  }}>
                    <input 
                      name="projectId"
                      required
                      placeholder="Paste Project ID..."
                      className="flex-1 p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-white text-sm"
                    />
                    <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors">
                      Award Escrow
                    </button>
                  </form>
                </div>
             )}

             {bounty.status === 'open' && !isRequester && (
               <div className="bg-amber-900/10 border border-amber-500/20 rounded-2xl p-6 text-center">
                 <h3 className="text-lg font-bold text-white mb-2">Think you can solve this?</h3>
                 <p className="text-slate-400 text-sm mb-4">Upload your solution as a standard project, then share the link with the requester in the comments or externally to claim the bounty.</p>
                 <Link href="/upload" className="inline-block bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                   Upload a Project
                 </Link>
               </div>
             )}
          </div>

        </div>
      </div>
    </main>
  )
}
