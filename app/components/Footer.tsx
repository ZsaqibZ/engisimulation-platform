export default function Footer() {
    return (
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="text-center md:text-left">
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Engi<span className="text-brand-600">Simulation</span>
            </span>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              The open-source platform for engineering simulations. Verified, secure, and community-driven.
            </p>
          </div>
  
          <div className="flex gap-8 text-sm text-gray-600 font-medium">
            <a href="#" className="hover:text-brand-600">About</a>
            <a href="#" className="hover:text-brand-600">Guidelines</a>
            <a href="#" className="hover:text-brand-600">Privacy</a>
            <a href="#" className="hover:text-brand-600">Contact</a>
          </div>
  
          <div className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} EngiSimulation Inc.
          </div>
        </div>
      </footer>
    )
  }