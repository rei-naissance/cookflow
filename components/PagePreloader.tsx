'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export function PagePreloader() {
  const [mounted, setMounted] = useState(true)
  const [show, setShow] = useState(true)

  useEffect(() => {
    const onPageLoad = () => {
      // Small delay to ensure smooth transition even if load is instant
      setTimeout(() => {
        setShow(false)
        setTimeout(() => setMounted(false), 700) // Wait for fade out
      }, 500)
    }

    // Check if page is already loaded
    if (document.readyState === 'complete') {
      onPageLoad()
    } else {
      window.addEventListener('load', onPageLoad)
      // Safety timeout in case load event doesn't fire or takes too long (e.g. 3s max)
      const timeout = setTimeout(onPageLoad, 3000)

      return () => {
        window.removeEventListener('load', onPageLoad)
        clearTimeout(timeout)
      }
    }
  }, [])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-700 ease-in-out ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
    >
      <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-4 animate-bounce">
          <span className="text-primary-foreground font-bold text-3xl">C</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">CookFlow</h1>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading assets...</span>
        </div>
      </div>
    </div>
  )
}
