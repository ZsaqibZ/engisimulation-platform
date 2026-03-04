export default function VerifyEmailPage({
    searchParams,
}: {
    searchParams: { status?: string }
}) {
    const status = searchParams?.status

    const content = {
        expired: {
            icon: '⏰',
            title: 'Link Expired',
            message: 'Your verification link has expired. Please sign up again to receive a new one.',
            color: '#f59e0b',
        },
        invalid: {
            icon: '❌',
            title: 'Invalid Link',
            message: 'This verification link is invalid or has already been used.',
            color: '#ef4444',
        },
        error: {
            icon: '⚠️',
            title: 'Something Went Wrong',
            message: 'An error occurred while verifying your email. Please try again.',
            color: '#ef4444',
        },
    }[status as string] ?? {
        icon: '📬',
        title: 'Check Your Email',
        message: "We've sent a verification link to your email address. Click the link to activate your account and sign in.",
        color: '#3b82f6',
    }

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-10 text-center">
                <div className="text-5xl mb-5">{content.icon}</div>
                <h1 className="text-2xl font-bold text-white mb-3">{content.title}</h1>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">{content.message}</p>

                {!status && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-left mb-6">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Next Steps</p>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li>1. Open your email inbox</li>
                            <li>2. Find the email from EngiSimulation</li>
                            <li>3. Click &ldquo;Verify My Email&rdquo;</li>
                        </ul>
                    </div>
                )}

                <a
                    href="/login"
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors text-sm"
                >
                    Back to Sign In
                </a>
            </div>
        </main>
    )
}
