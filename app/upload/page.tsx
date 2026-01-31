import UploadForm from '../components/UploadForm'

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Share Your Work</h1>
        <p className="text-gray-500 mt-2">Contribute to the open source engineering library.</p>
      </div>
      <UploadForm />
    </main>
  )
}