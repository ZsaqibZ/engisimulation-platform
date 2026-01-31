'use client'

import { createBrowserClient } from '@supabase/ssr'

export default function SecureDownloadBtn({ filePath, fileName }: { filePath: string, fileName: string }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleDownload() {

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // If not logged in, alert and redirect
      const confirmLogin = confirm("You must be a member to download files. Join for free!")
      if (confirmLogin) {
        window.location.href = '/login'
      }
      return
    }

    try {
      console.log("Original File URL:", filePath);

      // --- FIX LOGIC: EXTRACT PATH CORRECTLY ---
      // Expected URL format: .../storage/v1/object/public/project-files/173999_Test.zip
      // We need just: "173999_Test.zip"
      
      let path = "";

      if (filePath.includes('/project-files/')) {
        // Split by the bucket name and take the last part
        const parts = filePath.split('/project-files/');
        path = parts[1]; 
      } else {
        // Fallback: If URL doesn't look standard, assume it IS the path
        path = filePath;
      }

      // Remove any URL encoding (e.g., %20 -> space) to match filename in storage
      path = decodeURIComponent(path);

      console.log("Extracted Storage Path:", path);

      if (!path) throw new Error("Could not extract file path from URL");

      // 1. Request Signed URL
      const { data, error } = await supabase
        .storage
        .from('project-files') // Make sure this matches your bucket name EXACTLY
        .createSignedUrl(path, 60) // Valid for 60 seconds

      if (error) {
        console.error("Supabase Storage Error:", error);
        throw error;
      }

      console.log("Generated Signed URL:", data?.signedUrl);

      // 2. Trigger Download
      if (data?.signedUrl) {
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = fileName; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (error: any) {
      console.error("Download Failed:", error);
      alert('Download Error: ' + (error.message || "File not found"));
    }
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