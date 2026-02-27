'use client'

import Link from 'next/link'
import { ArrowRight, Star, Heart, Clock, Loader2, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface Recipe {
  id: string
  title: string
  description: string
  image_url: string
  difficulty: string
  category: string
  avgRating?: number
  reviewCount?: number
  users?: {
    name: string
  }
}

interface HeroSectionProps {
  recipes: Recipe[]
}

export function HeroSection({ recipes = [] }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-scroll effect
  useEffect(() => {
    if (recipes.length <= 1 || isHovered) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recipes.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [recipes.length, isHovered])

  if (!recipes.length) {
    return null // Or a fallback loading state/placeholder
  }

  const currentRecipe = recipes[currentIndex]

  if (!currentRecipe) return null

  // Image fallback if no image_url provided
  const bgImage = currentRecipe.image_url
    ? `url('${currentRecipe.image_url}')`
    : `url('/login-image.jpg')` // Default fallback

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-20 lg:pb-28 bg-transparent">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col justify-center space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-accent/20 border border-accent/20 px-4 py-1 text-sm font-medium text-accent">
                Trending Recipes
              </span>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Find your <br className="hidden lg:block" />
                next favorite
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Discover delicious recipes from our community. From quick snacks to gourmet meals, get inspired today!
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link
                href="#recipes"
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-foreground text-background px-8 text-sm font-medium shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:animate-shimmer z-0" />
                <span className="relative z-10 flex items-center">
                  Explore recipes
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square">
              {/* Back Card Decoration */}
              <div className="absolute top-4 right-4 md:right-12 w-3/4 h-3/4 bg-muted border border-border/50 rounded-[2rem] transform rotate-6 opacity-60 z-0 transition-transform duration-500 hover:rotate-12 shadow-lg"></div>
              <div className="absolute top-2 right-8 md:right-16 w-3/4 h-3/4 bg-muted-foreground/10 border border-border/30 rounded-[2rem] transform rotate-3 opacity-80 z-10 transition-transform duration-500 hover:rotate-6 shadow-md"></div>

              {/* Main Carousel Card */}
              <Link href={`/recipe/${currentRecipe.id}`}>
                <div
                  className="absolute top-0 left-0 right-12 bottom-12 z-20 overflow-hidden rounded-[2.5rem] bg-card shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-float cursor-pointer group hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.05)] dark:hover:shadow-[0_30px_60px_rgba(255,255,255,0.08)] transition-all duration-500"
                >
                  {/* Stacked Background Images for Smooth Crossfade */}
                  {recipes.map((recipe, index) => (
                    <div
                      key={recipe.id}
                      className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                      style={{
                        backgroundImage: recipe.image_url ? `url('${recipe.image_url}')` : `url('/login-image.jpg')`,
                        transform: index === currentIndex ? 'scale(1.05)' : 'scale(1)',
                        transition: 'opacity 0.7s ease-in-out, transform 6s ease-out'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    </div>
                  ))}

                  {/* Card Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-30 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex justify-between items-end mb-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-sm border border-white/20 shadow-sm">
                            {currentRecipe.category || 'Uncategorized'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm border border-white/20 ${currentRecipe.difficulty === 'Easy' ? 'bg-green-500/20 text-green-100' :
                            currentRecipe.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-100' :
                              'bg-red-500/20 text-red-100'
                            }`}>
                            {currentRecipe.difficulty || 'Medium'}
                          </span>
                        </div>
                        <h3 className="text-3xl font-bold leading-tight group-hover:text-primary-foreground transition-colors">
                          {currentRecipe.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-200">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-yellow-500 drop-shadow-sm" />
                            <span className="font-semibold">{currentRecipe.avgRating || 0}/5 <span className="font-normal opacity-80">({currentRecipe.reviewCount || 0} reviews)</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Heart Button */}
                      <button
                        aria-label={`Add ${currentRecipe.title} to favorites`}
                        className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-red-500 hover:scale-110 hover:shadow-lg transition-all active:scale-95 group/heart border border-white/20"
                        onClick={(e) => {
                          e.preventDefault() // Prevent navigation to recipe
                          e.stopPropagation()
                          // TODO: Implement favoriting logic here or emit event
                          console.log('Favorite clicked', currentRecipe.id)
                        }}
                      >
                        <Heart className="w-6 h-6 group-hover/heart:fill-current transition-all" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm pt-6 border-t border-white/20 opacity-90 group-hover:opacity-100 transition-opacity">
                      <div>
                        <div className="text-white/60 text-xs uppercase tracking-wider mb-1 font-semibold">Author</div>
                        <div className="font-medium flex items-center gap-2 text-white/90">
                          <div className="w-6 h-6 rounded-full bg-white/20 shadow-sm flex items-center justify-center text-[10px] uppercase border border-white/20">
                            {currentRecipe.users?.name?.[0] || 'A'}
                          </div>
                          {currentRecipe.users?.name || 'Anonymous'}
                        </div>
                      </div>
                      <div className="text-right">
                        {/* Progress bar or other indicator could go here, or just standard difficultly */}
                        <div className="text-white/60 text-xs uppercase tracking-wider mb-1 font-semibold">Queue</div>
                        <div className="font-medium tabular-nums text-white/90">{currentIndex + 1} / {recipes.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Segmented Progress Bar Top */}
                  <div className="absolute top-8 left-8 right-8 flex gap-2 h-1.5 z-20">
                    {recipes.map((_, index) => (
                      <div
                        key={index}
                        className="flex-1 h-full bg-white/30 rounded-full overflow-hidden backdrop-blur-sm shadow-sm"
                      >
                        <motion.div
                          initial={false}
                          animate={{
                            width: index < currentIndex ? '100%' : index === currentIndex ? '100%' : '0%',
                            opacity: index <= currentIndex ? 1 : 0.3
                          }}
                          transition={{
                            duration: index === currentIndex ? 8 : 0.5,
                            ease: index === currentIndex ? "linear" : "easeOut"
                          }}
                          className={`h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bouncing Arrow */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center pb-4 z-20 pointer-events-none">
        <Link href="#recipes" className="animate-bounce pointer-events-auto">
          <div className="p-3 rounded-full bg-white/80 backdrop-blur-md border border-black/10 shadow-sm hover:bg-white transition-colors">
            <ArrowDown className="w-6 h-6 text-black" />
          </div>
        </Link>
      </div>
    </section>
  )
}
