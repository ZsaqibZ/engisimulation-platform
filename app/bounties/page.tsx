import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import Bounty from '@/models/Bounty';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export default async function BountiesPage() {
  await dbConnect();
  
  const rawBounties = await Bounty.find({ status: 'open', isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
  
  // Attach user info
  const bounties = await Promise.all(rawBounties.map(async (b: any) => {
      const user = await User.findById(b.requesterId).select('username name image').lean() as any;
      return {
          ...b,
          _id: b._id.toString(),
          createdAt: b.createdAt.toISOString(),
          requester: user ? { username: user.username, name: user.name, image: user.image } : null
      }
  }));

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Simulation Bounties</h1>
            <p className="text-slate-400">Earn reputation by solving engineering challenges requested by the community.</p>
          </div>
          <Link 
            href="/bounties/create" 
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-transform transform hover:-translate-y-1 shadow-lg shadow-amber-600/20"
          >
            + Post a Bounty
          </Link>
        </div>

        {bounties.length === 0 ? (
           <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl">
             <div className="text-6xl mb-4">🎯</div>
             <h3 className="text-xl font-bold text-white mb-2">No Open Bounties</h3>
             <p className="text-slate-500">Be the first to request a specific simulation or script!</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {bounties.map((bounty: any) => (
              <Link href={`/bounties/${bounty._id}`} key={bounty._id} className="group flex flex-col h-full">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col h-full relative overflow-hidden">
                  
                  {/* Decorative background flare */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-black tracking-wider flex items-center gap-1">
                      💎 {bounty.reward_points} REP
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors line-clamp-2">
                    {bounty.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                    {bounty.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 text-xs font-bold uppercase">
                      {bounty.requester?.image ? <img src={bounty.requester.image} className="w-full h-full object-cover" /> : bounty.requester?.username?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Requested by</p>
                      <p className="text-sm text-slate-300 font-bold">@{bounty.requester?.username || 'user'}</p>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
