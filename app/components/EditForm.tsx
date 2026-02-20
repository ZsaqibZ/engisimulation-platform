'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EditFormProps {
  project: {
    _id: string
    title: string
    description: string
    youtube_url?: string
    screenshots?: string[]
  }
}

export default function EditForm({ project }: EditFormProps) {
  const router = useRouter()
  // Supabase client removed


  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)
  const [youtubeUrl, setYoutubeUrl] = useState(project.youtube_url || '')

  // Image State
  const [currentScreenshots, setCurrentScreenshots] = useState<string[]>(project.screenshots || [])
  const [newImages, setNewImages] = useState<FileList | null>(null)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updatedScreenshots = [...currentScreenshots]

      // 1. Upload NEW Images (if any)
      if (newImages && newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          const file = newImages[i]

          const formData = new FormData()
          formData.append('file', file)

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          const data = await res.json()
          if (!data.success) throw new Error(data.error)

          updatedScreenshots.push(data.url)
        }
      }

      // 2. Update Database
      const res = await fetch(`/api/projects/${project._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          youtube_url: youtubeUrl,
          screenshots: updatedScreenshots
        })
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      router.push(`/project/${project._id}`)
      router.refresh()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert('Error updating project: ' + error.message)
      setLoading(false)
    }
  }

  // Remove an image from the list (visual only, saves on submit)
  const removeScreenshot = (indexToRemove: number) => {
    setCurrentScreenshots(currentScreenshots.filter((_, idx) => idx !== indexToRemove))
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-8 animate-fade-in">

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg h-40 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">YouTube Link</label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Image Management Section */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Images</h3>

        {/* Existing Images Grid */}
        {currentScreenshots.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {currentScreenshots.map((url, idx) => (
              <div key={idx} className="relative group">
                <img src={url} className="h-24 w-full object-cover rounded-lg border border-gray-200" />
                <button
                  type="button"
                  onClick={() => removeScreenshot(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                  title="Remove Image"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload New Images */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            id="new-images"
            className="hidden"
            onChange={e => setNewImages(e.target.files)}
          />
          <label htmlFor="new-images" className="cursor-pointer">
            <span className="block text-blue-600 font-bold hover:underline mb-1">
              + Add New Images
            </span>
            <span className="text-sm text-gray-500">
              {newImages && newImages.length > 0
                ? `${newImages.length} file(s) selected`
                : "Click to upload PNG or JPG"}
            </span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Saving Changes...' : 'Save Updates'}
        </button>
      </div>
    </form>
  )
}