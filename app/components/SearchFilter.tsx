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
].sort()

export default function SearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname() // <--- 1. Get current path (e.g., '/library')
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [type, setType] = useState(searchParams.get('type') || '')
  const [isMounted, setIsMounted] = useState(false)

  // Prevents the filter from triggering immediately on load
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (query) params.set('q', query)
      else params.delete('q')
      
      if (type) params.set('type', type)
      else params.delete('type')

      // 2. Use 'pathname' instead of hardcoded '/'
      // This ensures we stay on '/library' or '/browse' or wherever we are.
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      
    }, 500)

    return () => clearTimeout(timer)
  }, [query, type, isMounted, pathname, router, searchParams])

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm text-white"
          placeholder="Search for simulations..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Software Filter */}
      <div className="sm:w-64">
        <select
          className="block w-full pl-3 pr-10 py-2 text-base border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-slate-900 text-white"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Software</option>
          {SOFTWARE_LIST.map(s => (
             <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  )
}