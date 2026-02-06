import type { Metadata } from "next";
import { Inter } from "next/font/google";
//import "./app.css";
import Navbar from './components/Navbar';

// Initialize Inter font with technical subsets
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "EngiSimulation | Engineering Simulation Marketplace",
    template: "%s | EngiSimulation",
  },
  description: "The premier marketplace for high-fidelity engineering simulations, CAD models, and computational fluid dynamics (CFD) assets.",
  keywords: ["Engineering", "Simulation", "CAD", "CFD", "FEA", "3D Modeling", "Marketplace"],
  authors: [{ name: "EngiSimulation Team" }],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} bg-slate-950 text-slate-50 antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        
        {/* Main content area expands to push footer down */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Placeholder Footer for future development */}
        <Footer />
      </body>
    </html>
  );
}

/** * Temporary Footer Component 
 * You can move this to its own file in /components later 
 */
function Footer() {
  return (
    <footer className="border-t border-slate-800 py-8 px-4 text-center text-sm text-slate-500">
      <div className="container mx-auto">
        <p>© {new Date().getFullYear()} EngiSimulation. All rights reserved.</p>
      </div>
    </footer>
  );
}