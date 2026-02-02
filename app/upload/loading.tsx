// app/upload/loading.tsx
export default function Loading() {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-mono text-sm animate-pulse">Initializing Contributor Portal...</p>
      </div>
    )
  }