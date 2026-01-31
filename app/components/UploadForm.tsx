'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import JSZip from 'jszip'

// --- THE MASTER LIST (50+ Tools) ---
const SOFTWARE_LIST = [
  // General / Math / Programming
  "MATLAB/Simulink", "Python", "LabVIEW", "Mathematica", "Maple", "R Studio", "Octave", "Scilab", "Excel/VBA",
  // CAD & 3D Modeling
  "SolidWorks", "AutoCAD", "Fusion 360", "CATIA", "Autodesk Inventor", "Siemens NX", "Creo Parametric", "Rhino 3D", "SketchUp", "FreeCAD", "Blender", "Onshape", "Solid Edge",
  // Simulation / FEA / CFD
  "Ansys Fluent", "Ansys Mechanical", "COMSOL Multiphysics", "Abaqus", "OpenFOAM", "SimScale", "Altair HyperWorks", "LS-DYNA", "Star-CCM+", "Autodesk CFD",
  // Electronics / PCB / Circuit Design
  "Altium Designer", "KiCad", "Eagle", "Proteus", "LTspice", "Multisim", "PSpice", "Cadence Virtuoso", "Synopsys", "Fritzing", "TinkerCAD",
  // FPGA / Embedded
  "Xilinx Vivado", "Quartus Prime", "Arduino IDE", "Keil µVision", "MPLAB X", "PlatformIO",
  // Civil / Structural / BIM
  "Revit", "SAP2000", "ETABS", "STAAD.Pro", "Civil 3D", "Tekla Structures",
  // Chemical / Process
  "Aspen Plus", "Aspen HYSYS", "DWSIM", "ChemCAD",
  // Robotics & Control
  "ROS (Robot Operating System)", "Gazebo", "Webots", "CoppeliaSim",
  // Other
  "Other / Custom" 
].sort() // Sort alphabetically for easier finding

export default function UploadForm() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // --- STATE ---
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // Form Data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  
  // Software Selection State
  const [software, setSoftware] = useState(SOFTWARE_LIST[0]) 
  const [customSoftware, setCustomSoftware] = useState('') // For "Other" input

  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [screenshots, setScreenshots] = useState<FileList | null>(null)

  // --- HELPERS ---
  const convertToAvif = async (imageFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = URL.createObjectURL(imageFile)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject('Canvas error')
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (!blob) return reject('Conversion failed')
          const newName = imageFile.name.replace(/\.[^/.]+$/, "") + ".avif"
          resolve(new File([blob], newName, { type: 'image/avif' }))
        }, 'image/avif', 0.8)
      }
      img.onerror = (e) => reject(e)
    })
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = tagInput.trim().toLowerCase()
      if (val && !tags.includes(val)) {
        setTags([...tags, val])
        setTagInput('')
      }
    }
  }

  // --- UPLOAD LOGIC ---
  async function handleUpload() {
    if (!file) return alert('Please select a file!')
    
    // Determine Final Software Name
    const finalSoftware = software === "Other / Custom" ? customSoftware.trim() : software
    if (!finalSoftware) return alert("Please specify the software used.")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    try {
      // 1. Process Screenshots
      let screenshotUrls: string[] = []
      if (screenshots && screenshots.length > 0) {
        setStatus('Optimizing images...')
        for (let i = 0; i < screenshots.length; i++) {
          const original = screenshots[i]
          let fileToUpload = original
          try {
             fileToUpload = await convertToAvif(original)
          } catch (err) {
             console.warn("AVIF conversion failed, using original.")
          }
          const sName = `${Date.now()}_${i}_${fileToUpload.name}`
          await supabase.storage.from('project-images').upload(sName, fileToUpload)
          const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(sName)
          screenshotUrls.push(publicUrl)
        }
      }

      // 2. Process Main File
      let finalFile = file
      const isZip = file.name.endsWith('.zip') || file.name.endsWith('.rar') || file.type.includes('zip')
      
      if (!isZip) {
        setStatus('Zipping your file...')
        const zip = new JSZip()
        zip.file(file.name, file)
        const blob = await zip.generateAsync({ type: "blob" })
        finalFile = new File([blob], `${title.replace(/\s/g, '_')}.zip`, { type: "application/zip" })
      }

      // 3. Upload Zip
      setStatus('Uploading project files...')
      const fileExt = finalFile.name.split('.').pop()
      const fileName = `${Date.now()}_${title.replace(/\s/g, '_')}.${fileExt}`
      const { error: upErr } = await supabase.storage.from('project-files').upload(fileName, finalFile)
      if (upErr) throw upErr
      const { data: { publicUrl: fileUrl } } = supabase.storage.from('project-files').getPublicUrl(fileName)

      // 4. Save Database
      setStatus('Finalizing...')
      const { error: dbError } = await supabase.from('projects').insert([{
        title, 
        description, 
        software_type: finalSoftware, // <--- Using the dynamic variable
        file_url: fileUrl,
        author_id: user.id, 
        youtube_url: youtubeUrl, 
        screenshots: screenshotUrls, 
        tags
      }])

      if (dbError) throw dbError
      router.push('/?success=true')
      
    } catch (err: any) {
      alert(err.message)
      setStatus('')
    }
  }

  // --- UI HELPERS ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0])
  }
  const NextButton = ({ disabled, onClick }: any) => (
    <button type="button" disabled={disabled} onClick={onClick} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md disabled:opacity-50">Next →</button>
  )
  const BackButton = () => (
    <button type="button" onClick={() => setStep(step - 1)} className="text-gray-500 hover:text-gray-900 font-medium px-4">Back</button>
  )

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="mb-10">
        <div className="flex justify-between text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">
          <span className={step >= 1 ? 'text-blue-600' : ''}>1. Details</span>
          <span className={step >= 2 ? 'text-blue-600' : ''}>2. Media</span>
          <span className={step >= 3 ? 'text-blue-600' : ''}>3. Assets</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900">Project Essentials</h2>
            
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Project Title</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Solar Panel MPPT Controller" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
            </div>

            {/* Software Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Software Used</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={software} 
                onChange={e => setSoftware(e.target.value)}
              >
                {SOFTWARE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Custom Input (Only shows if "Other" is picked) */}
              {software === "Other / Custom" && (
                <div className="mt-3 animate-fade-in">
                  <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Specify Custom Software</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border-2 border-blue-100 bg-blue-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-blue-900 font-medium"
                    placeholder="Type the software name..." 
                    value={customSoftware} 
                    onChange={e => setCustomSoftware(e.target.value)} 
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea className="w-full p-3 border border-gray-300 rounded-lg h-32 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe the methodology, results, and how to run it..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div className="flex justify-end mt-8"><NextButton onClick={() => setStep(2)} disabled={!title || !description} /></div>
          </div>
        )}

        {/* STEP 2 & 3 are identical to before - keeping UI consistent */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900">Visual Proof</h2>
            <input type="url" className="w-full p-3 border rounded-lg" placeholder="YouTube Link (Optional)" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
               <input type="file" multiple accept="image/*" id="screens" className="hidden" onChange={e => setScreenshots(e.target.files)} />
               <label htmlFor="screens" className="cursor-pointer text-blue-600 font-bold hover:underline">
                 {screenshots ? `${screenshots.length} images selected` : "Click to upload screenshots"}
               </label>
               <p className="text-xs text-gray-400 mt-2">Auto-converted to AVIF</p>
            </div>
            <div className="flex justify-between mt-8"><BackButton /><NextButton onClick={() => setStep(3)} /></div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900">Final Assets</h2>
            <div 
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <input type="file" id="zipfile" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              <label htmlFor="zipfile" className="cursor-pointer block">
                {file ? (
                    <div>...</div>
                ) : (
                    <div>
                      <div className="text-4xl mb-2">📦</div>
                      <p className="font-bold">Tap to Select File</p> {/* Changed Text */}
                      <p className="text-sm text-gray-500">or Drag & Drop on Desktop</p> {/* Clarified */}
                    </div>
                )}
              </label>
            </div>

            <div className="border border-gray-300 p-2 rounded-lg flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                    #{tag} <button onClick={() => setTags(tags.filter(t => t !== tag))}>×</button>
                  </span>
                ))}
                <input type="text" className="outline-none flex-1 bg-transparent" placeholder="Add keywords..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag} />
            </div>

            <div className="flex justify-between items-center mt-8">
              <BackButton />
              <button 
                onClick={handleUpload}
                disabled={!!status || !file}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {status ? status : '🚀 Launch Project'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}