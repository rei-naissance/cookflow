'use client'

import Link from 'next/link'
import { ArrowRight, Star, Heart, Clock, Loader2, ArrowDown } from 'lucide-react'
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

  // Image fallback if no image_url provided
  const bgImage = currentRecipe.image_url
    ? `url('${currentRecipe.image_url}')`
    : `url('/login-image.jpg')` // Default fallback

  return (
    <section className="relative overflow-hidden bg-background pt-10 pb-20 lg:pt-20 lg:pb-28">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
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
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground text-background px-8 text-sm font-medium shadow transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Explore recipes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div
            className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square">
              {/* Back Card Decoration */}
              <div className="absolute top-4 right-4 md:right-12 w-3/4 h-3/4 bg-muted rounded-[2rem] transform rotate-6 opacity-60 z-0 transition-transform duration-500 hover:rotate-12"></div>
              <div className="absolute top-2 right-8 md:right-16 w-3/4 h-3/4 bg-muted-foreground/20 rounded-[2rem] transform rotate-3 opacity-80 z-10 transition-transform duration-500 hover:rotate-6"></div>

              {/* Main Carousel Card */}
              <Link href={`/recipe/${currentRecipe.id}`}>
                <div
                  className="absolute top-0 left-0 right-12 bottom-12 z-20 overflow-hidden rounded-[2.5rem] bg-card shadow-2xl animate-float cursor-pointer group"
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
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-30 text-white">
                    <div className="flex justify-between items-end mb-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-sm border border-white/10">
                            {currentRecipe.category || 'Uncategorized'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10 ${currentRecipe.difficulty === 'Easy' ? 'bg-green-500/20 text-green-100' :
                            currentRecipe.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-100' :
                              'bg-red-500/20 text-red-100'
                            }`}>
                            {currentRecipe.difficulty || 'Medium'}
                          </span>
                        </div>
                        <h3 className="text-3xl font-bold leading-tight group-hover:text-primary-foreground/90 transition-colors">
                          {currentRecipe.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-200">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-yellow-400" />
                            <span>{currentRecipe.avgRating || 0}/5 ({currentRecipe.reviewCount || 0} reviews)</span>
                          </div>
                        </div>
                      </div>

                      {/* Heart Button */}
                      <button
                        className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-red-500/80 hover:scale-110 transition-all active:scale-95 group/heart"
                        onClick={(e) => {
                          e.preventDefault() // Prevent navigation to recipe
                          e.stopPropagation()
                          // TODO: Implement favoriting logic here or emit event
                          console.log('Favorite clicked', currentRecipe.id)
                        }}
                      >
                        <Heart className="w-6 h-6 group-hover/heart:fill-current" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm pt-6 border-t border-white/10">
                      <div>
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Author</div>
                        <div className="font-medium flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                            {currentRecipe.users?.name?.[0] || 'A'}
                          </div>
                          {currentRecipe.users?.name || 'Anonymous'}
                        </div>
                      </div>
                      <div className="text-right">
                        {/* Progress bar or other indicator could go here, or just standard difficultly */}
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Queue</div>
                        <div className="font-medium tabular-nums">{currentIndex + 1} / {recipes.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Top */}
                  <div className="absolute top-8 left-8 right-8 h-1 bg-white/20 rounded-full overflow-hidden z-20">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-[8000ms] ease-linear"
                      style={{
                        width: `${((currentIndex + 1) / recipes.length) * 100}%`,
                        transition: 'width 0.5s ease-out'
                      }}
                    ></div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bouncing Arrow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer z-20 pb-4">
        <Link href="#recipes">
          <div className="p-3 rounded-full bg-white/80 backdrop-blur-md border border-black/10 shadow-sm hover:bg-white transition-colors">
            <ArrowDown className="w-6 h-6 text-black" />
          </div>
        </Link>
      </div>
    </section>
  )
}
