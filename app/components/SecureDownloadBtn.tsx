'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SecureDownloadBtn({ filePath, fileName }: { filePath: string, fileName: string }) {
  const { data: session } = useSession()
  const router = useRouter()

  async function handleDownload() {
    if (!session) {
      // If not logged in, alert and redirect
      const confirmLogin = confirm("You must be a member to download files. Join for free!")
      if (confirmLogin) {
        router.push('/login')
      }
      return
    }

    // Since we are using local public storage, the filePath is the public URL
    // We can just trigger a download
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <button
      onClick={handleDownload}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
    >
      Download Securely ⬇
    </button>
  )
}