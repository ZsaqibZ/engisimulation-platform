'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

// --- Same Master List (Copied for consistency) ---
// Ideally, you would move this to a shared file like `app/utils/constants.ts` in the future
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
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [type, setType] = useState(searchParams.get('type') || '')

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query, type), 500)
    return () => clearTimeout(timer)
  }, [query, type])

  function handleSearch(q: string, t: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set('q', q)
    else params.delete('q')
    if (t) params.set('type', t)
    else params.delete('type')
    router.replace(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Text Search */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-black"
          placeholder="Search for simulations, code, or methods..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Expanded Dropdown */}
      <div className="sm:w-64">
        <select
          className="block w-full pl-3 pr-10 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm rounded-lg bg-white text-black"
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