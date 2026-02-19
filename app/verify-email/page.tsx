"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()

  // Optionally poll for verification status here
  // useEffect(() => { ... }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Mail size={32} className="text-primary" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Verify Your Email</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
        </p>

        <div className="flex flex-col items-center justify-center space-y-4 mb-6">
          <div className="flex items-center space-x-2 text-primary font-medium bg-primary/5 px-4 py-2 rounded-full">
            <Loader2 className="animate-spin h-4 w-4" />
            <span className="text-sm">Waiting for verification...</span>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Once verified, you can log in and start using CookFlow.
        </p>
      </motion.div>
    </div>
  )
}
