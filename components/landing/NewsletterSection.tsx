'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2, Mail } from 'lucide-react'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to subscribe. Please try again.')
      }

      const data = await response.json()
      setStatus('success')
      setMessage(data.message || 'Thanks! Check your inbox for fresh inspiration.')
      setEmail('')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Something went wrong. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-3xl p-8 md:p-12 lg:p-16 text-center border shadow-sm relative overflow-hidden"
        >
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/5 rounded-full translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-2">
                <Mail size={32} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Fresh inspiration via email
              </h2>
              <p className="text-muted-foreground text-lg">
                Get our best recipes and cooking tips delivered strictly to your inbox.
              </p>
            </div>

            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-0 rounded-full border border-input bg-background px-6 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                required
                disabled={loading || status === 'success'}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading || status === 'success'}
                className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 'Subscribe'}
              </motion.button>
            </form>

            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-sm font-medium ${status === 'success' ? 'text-green-600' : 'text-destructive'
                    }`}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>

            <p className="text-xs text-muted-foreground mt-4">
              No spam, unsubscribe anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
