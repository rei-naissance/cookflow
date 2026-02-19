'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, User, Eye, EyeOff, Check, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CAROUSEL_IMAGES = [
  '/login-image.jpg',
  '/pexels-roman-odintsov-5840297.jpg',
  '/pexels-roman-odintsov-5840315.jpg',
  '/pexels-roman-odintsov-5840411.jpg'
]

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      let avatarUrl = null
      if (isSignUp && avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
        const { data, error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, avatarFile)
        if (uploadError) throw uploadError
        avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-images/${fileName}`
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              avatar_url: avatarUrl
            }
          }
        })
        if (error) throw error
        setSuccess('Account created successfully! Redirecting you...')
        await new Promise(resolve => setTimeout(resolve, 1500))
        router.push('/verify-email')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        setSuccess('Welcome back! Logging you in...')
        await new Promise(resolve => setTimeout(resolve, 1500))
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5, ease: 'easeOut' }
    })
  }

  return (
    <div className="min-h-screen h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left: Login Form */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12 lg:py-0 relative overflow-y-auto h-full">
        {/* Back to Home Link */}
        <Link
          href="/#recipes"
          className="absolute top-6 left-6 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group z-50"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Explore Recipes</span>
        </Link>

        <div className="w-full max-w-sm mx-auto lg:max-w-none lg:w-[400px]">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-300"
            >
              <span className="text-primary-foreground font-bold text-xl">C</span>
            </motion.div>
            <span className="text-2xl font-bold tracking-tight text-foreground">CookFlow</span>
          </Link>

          <div>
            <motion.h2
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeInVariants}
              className="text-3xl font-bold tracking-tight text-foreground"
            >
              {isSignUp ? 'Create account' : 'Welcome back!'}
            </motion.h2>
            <motion.p
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeInVariants}
              className="mt-4 text-muted-foreground text-lg"
            >
              {isSignUp
                ? 'Start your culinary journey today.'
                : 'Enter your credentials to access your account.'}
            </motion.p>
          </div>

          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
            className="mt-10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                            <User size={18} />
                          </div>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required={isSignUp}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex h-12 w-full rounded-xl border border-input bg-muted/30 px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted/50 focus:bg-background"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                          Profile Picture <span className="text-muted-foreground font-normal">(Optional)</span>
                        </label>
                        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-input bg-muted/20">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <User size={20} className="text-muted-foreground" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0] || null
                              setAvatarFile(file)
                              if (file) {
                                const reader = new FileReader()
                                reader.onload = () => setAvatarPreview(reader.result as string)
                                reader.readAsDataURL(file)
                              } else {
                                setAvatarPreview(null)
                              }
                            }}
                            className="text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-12 w-full rounded-xl border border-input bg-muted/30 px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted/50 focus:bg-background"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium leading-none">
                    Password
                  </label>
                  {!isSignUp && (
                    <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/90 hover:underline">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-12 w-full rounded-xl border border-input bg-muted/30 px-3 pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted/50 focus:bg-background"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 flex items-start gap-3 text-destructive"
                  >
                    <AlertCircle size={20} className="mt-0.5 shrink-0" />
                    <div className="text-sm font-medium">{error}</div>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 flex items-start gap-3 text-green-600"
                  >
                    <Check size={20} className="mt-0.5 shrink-0" />
                    <div className="text-sm font-medium">{success}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-xl bg-foreground text-background px-8 py-3.5 text-sm font-semibold shadow-lg hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setSuccess('')
                }}
                className="font-semibold text-primary hover:text-primary/90 hover:underline transition-all"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>

            <div className="mt-12 pt-8 border-t border-border flex flex-col gap-2">
              <p className="text-xs text-muted-foreground text-center">
                Need help? <a href="mailto:support@cookflow.com" className="hover:text-foreground underline decoration-muted-foreground/30">Contact Support</a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right: Image Carousel Section */}
      <div className="hidden lg:block relative bg-muted overflow-hidden">
        {/* Carousel Images */}
        {CAROUSEL_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
              }`}
          >
            <Image
              src={src}
              alt="Cooking preparation"
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Overlay gradient for text readability and aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        ))}

        {/* Floating Glassmorphism Card */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="w-full max-w-md p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl text-white"
          >
            <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center mb-6">
              <Loader2 className="animate-spin-slow w-6 h-6" /> {/* Using spin icon as a modern looking loader/symbol */}
            </div>

            <h3 className="text-3xl font-bold mb-4 leading-tight">
              Master the art of cooking with ease
            </h3>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              Join thousands of food enthusiasts who are discovering, creating, and sharing extraordinary recipes every day.
            </p>

            <div className="flex -space-x-3 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`inline-block h-10 w-10 rounded-full bg-white/20 backdrop-blur ring-2 ring-white/10 flex items-center justify-center text-xs font-medium`}>
                  {/* Placeholder avatars */}
                  <div className="w-full h-full bg-gradient-to-br from-white/40 to-white/10 rounded-full" />
                </div>
              ))}
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur ring-2 ring-white/10 flex items-center justify-center text-xs font-bold">
                +2k
              </div>
            </div>
          </motion.div>
        </div>

        {/* Photo Credit */}
        <div className="absolute bottom-6 right-8 z-20 text-white/50 text-xs font-medium tracking-wide">
          Photo by ROMAN ODINTSOV
        </div>
      </div>
    </div>
  )
}
