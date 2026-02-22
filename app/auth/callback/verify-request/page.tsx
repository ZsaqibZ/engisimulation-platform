import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          ✉️
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
        <p className="text-slate-400 mb-8">
          A sign-in link has been sent to your email address. Click the link to securely log into your account.
        </p>
        <Link href="/" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}