'use client'

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors border border-red-200 hover:border-red-400 px-3 py-1 rounded"
    >
      Sign Out
    </button>
  )
}
