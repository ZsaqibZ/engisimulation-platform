'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const SOFTWARE_LIST = [
  "MATLAB/Simulink", "Python", "LabVIEW", "Mathematica", "Maple", "R Studio", "Octave", "Scilab", "Excel/VBA",
  "SolidWorks", "AutoCAD", "Fusion 360", "CATIA", "Autodesk Inventor", "Siemens NX", "Creo Parametric", "Rhino 3D", "SketchUp", "FreeCAD", "Blender", "Onshape", "Solid Edge",
  "Ansys Fluent", "Ansys Mechanical", "COMSOL Multiphysics", "Abaqus", "OpenFOAM", "SimScale", "Altair HyperWorks", "LS-DYNA", "Star-CCM+", "Autodesk CFD",
  "Altium Designer", "KiCad", "Eagle", "Proteus", "LTspice", "Multisim", "PSpice", "Cadence Virtuoso", "Synopsys", "Fritzing", "TinkerCAD",
  "Xilinx Vivado", "Quartus Prime", "Arduino IDE", "Keil µVision", "MPLAB X", "PlatformIO",
  "Revit", "SAP2000", "ETABS", "STAAD.Pro", "Civil 3D", "Tekla Structures",
  "Aspen Plus", "Aspen HYSYS", "DWSIM", "ChemCAD",
  "ROS (Robot Operating System)", "Gazebo", "Webots", "CoppeliaSim"
].sort() // Simplified for display; keep your full list!

export default function SearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [type, setType] = useState(searchParams.get('type') || '')
  const [isTyping, setIsTyping] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  useEffect(() => {
    if (!isMounted) return

    // Visual feedback: User has stopped typing, now we "process"
    const timer = setTimeout(() => {
      setIsTyping(false)
      const params = new URLSearchParams(searchParams.toString())
      
      if (query) params.set('q', query)
      else params.delete('q')
      
      if (type) params.set('type', type)
      else params.delete('type')

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, 500)

    return () => clearTimeout(timer)
  }, [query, type, isMounted, pathname, router, searchParams])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsTyping(true) // Start the "spinner"
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl mx-auto">
      {/* Premium Search Input */}
      <div className="relative flex-1 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          type="text"
          className="block w-full pl-11 pr-12 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 group-hover:border-slate-700"
          placeholder="Search for simulations..."
          value={query}
          onChange={handleQueryChange}
        />

        {/* Debounce Spinner */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          {isTyping && (
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </div>
      </div>

      {/* Styled Software Dropdown */}
      <div className="relative md:w-72">
        <select
          className="appearance-none block w-full pl-4 pr-10 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover:border-slate-700 cursor-pointer"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Software</option>
          {SOFTWARE_LIST.map(s => (
             <option key={s} value={s}>{s}</option>
          ))}
        </select>
        
        {/* Custom Chevron Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}