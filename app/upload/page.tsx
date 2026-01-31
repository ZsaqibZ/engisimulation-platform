import UploadForm from '../components/UploadForm'

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Text */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
            Share Your Simulation
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Contribute to the open-source engineering library. Your project will be verified and made available to thousands of engineers.
          </p>
        </div>

        {/* The Form Component */}
        <UploadForm />
        
      </div>
    </main>
  )
}