'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import JSZip from 'jszip'

import { SOFTWARE_LIST } from '@/lib/constants'


export default function UploadForm({ user }: { user: any }) {
  const router = useRouter()

  // --- STATE ---
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // Form Data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [software, setSoftware] = useState(SOFTWARE_LIST[0])
  const [customSoftware, setCustomSoftware] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [screenshots, setScreenshots] = useState<FileList | null>(null)

  // --- HELPERS ---
  const convertToAvif = async (imageFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject('Processing timeout'), 10000)
      const img = new Image()
      const objectUrl = URL.createObjectURL(imageFile)

      img.src = objectUrl
      img.onload = () => {
        clearTimeout(timeout)
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(objectUrl)
          return reject('Canvas error')
        }
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl)
          if (!blob) return reject('Conversion failed')
          const newName = imageFile.name.replace(/\.[^/.]+$/, "") + ".avif"
          resolve(new File([blob], newName, { type: 'image/avif' }))
        }, 'image/avif', 0.8)
      }
      img.onerror = () => {
        clearTimeout(timeout)
        URL.revokeObjectURL(objectUrl)
        reject('Load error')
      }
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
    if (!file) return alert('Please select a project file!')
    if (!user) return router.push('/login')

    const finalSoftware = software === "Other / Custom" ? customSoftware.trim() : software
    if (!finalSoftware) return alert("Please specify the software used.")

    try {
      // 1. Process Screenshots
      const screenshotUrls: string[] = []
      if (screenshots && screenshots.length > 0) {
        setStatus('Optimizing images...')
        for (let i = 0; i < screenshots.length; i++) {
          const original = screenshots[i]
          let fileToUpload = original
          try {
            fileToUpload = await convertToAvif(original)
          } catch (err) {
            console.warn("Using original image:", err)
          }

          const formData = new FormData()
          formData.append('file', fileToUpload)

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          const data = await res.json()
          if (!data.success) throw new Error(data.error)

          screenshotUrls.push(data.url)
        }
      }

      // 2. Process Main File (ZIP if not already zipped)
      let finalFile = file
      const isZip = file.name.endsWith('.zip') || file.name.endsWith('.rar') || file.type.includes('zip')

      if (!isZip) {
        setStatus('Generating archive...')
        const zip = new JSZip()
        zip.file(file.name, file)
        const blob = await zip.generateAsync({ type: "blob" })
        finalFile = new File([blob], `${title.replace(/\s+/g, '_')}.zip`, { type: "application/zip" })
      }

      // 3. Upload File to Storage
      setStatus('Uploading assets...')
      const fileFormData = new FormData()
      fileFormData.append('file', finalFile)

      const fileRes = await fetch('/api/upload', {
        method: 'POST',
        body: fileFormData
      })
      const fileData = await fileRes.json()
      if (!fileData.success) throw new Error(fileData.error)
      const fileUrl = fileData.url
      if (!fileUrl) throw new Error("Upload successful but no URL returned")

      // 4. Save to Database
      setStatus('Finalizing registry...')

      const payload = {
        title,
        description,
        software_type: finalSoftware,
        file_url: fileUrl,
        youtube_url: youtubeUrl,
        screenshots: screenshotUrls,
        tags
      }

      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const projectData = await projectRes.json()
      if (!projectData.success) throw new Error(projectData.error || 'Failed to save project')

      setStatus('Complete!')
      router.push('/library?success=true')
      router.refresh()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err)
      alert(`Upload Error: ${err.message}`)
      setStatus('')
    }
  }

  // --- UI HANDLERS ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0])
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-10">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
          <span className={step >= 1 ? 'text-blue-400' : ''}>01 Details</span>
          <span className={step >= 2 ? 'text-blue-400' : ''}>02 Media</span>
          <span className={step >= 3 ? 'text-blue-400' : ''}>03 Assets</span>
        </div>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-700 ease-in-out"
            style={{ width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%' }}
          ></div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white tracking-tight">Project Essentials</h2>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Title</label>
              <input
                type="text"
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                placeholder="e.g. Flight Controller Simulation"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Software</label>
              <select
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all appearance-none"
                value={software}
                onChange={e => setSoftware(e.target.value)}
              >
                {SOFTWARE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {software === "Other / Custom" && (
                <input
                  type="text"
                  className="w-full mt-3 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl text-blue-100 outline-none animate-fade-in"
                  placeholder="Enter software name..."
                  value={customSoftware}
                  onChange={e => setCustomSoftware(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
              <textarea
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white h-40 outline-none focus:border-blue-500 transition-all"
                placeholder="Provide details on methodology and usage..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                disabled={!title || !description}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all"
              >
                Next Step →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white tracking-tight">Visual Proof</h2>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">YouTube URL</label>
              <input
                type="url"
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                placeholder="https://..."
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
              />
            </div>
            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center hover:border-blue-500/50 transition-colors">
              <input type="file" multiple accept="image/*" id="sc" className="hidden" onChange={e => setScreenshots(e.target.files)} />
              <label htmlFor="sc" className="cursor-pointer">
                <div className="text-3xl mb-4">🖼️</div>
                <span className="text-blue-400 font-bold">
                  {screenshots && screenshots.length > 0 ? `${screenshots.length} selected` : "Upload Screenshots"}
                </span>
              </label>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="text-slate-500 font-bold">Back</button>
              <button onClick={() => setStep(3)} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl">Next Step →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white tracking-tight">Project Assets</h2>
            <div
              onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-950'}`}
            >
              <input type="file" id="zip" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              <label htmlFor="zip" className="cursor-pointer">
                {file ? (
                  <div className="text-white">
                    <div className="text-3xl mb-2">📦</div>
                    <p className="font-bold">{file.name}</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl mb-2 opacity-50">📂</div>
                    <p className="text-slate-400 font-bold">Drop main file or Click to select</p>
                  </div>
                )}
              </label>
            </div>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl">
              {tags.map(tag => (
                <span key={tag} className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                  #{tag}
                  <button onClick={() => setTags(tags.filter(t => t !== tag))}>×</button>
                </span>
              ))}
              <input
                className="bg-transparent text-white outline-none text-sm p-1"
                placeholder="Add tags..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(2)} className="text-slate-500 font-bold">Back</button>
              <button
                onClick={handleUpload}
                disabled={!!status || !file}
                className="px-10 py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl disabled:opacity-50 transition-all flex items-center gap-3"
              >
                {status ? status : 'Launch Project 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}