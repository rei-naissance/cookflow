"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyEmailPage() {
  const router = useRouter()

  // Optionally poll for verification status here
  // useEffect(() => { ... }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-primary-600 mb-4">Verify Your Email</h1>
        <p className="text-gray-700 mb-6">We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.</p>
        <div className="flex items-center justify-center mb-4">
          <svg className="animate-spin h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
        </div>
        <p className="text-sm text-gray-500">Once verified, you can log in and start using CookFlow.</p>
      </div>
    </div>
  )
}
