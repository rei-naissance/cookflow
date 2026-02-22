'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Star, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

type Recipe = {
  id: string
  title: string
  image_url: string | null
  category: string
  difficulty: string
  prep_time: number
  cook_time: number
  users: { name: string | null } | null
  avgRating: number
  reviewCount: number
}

interface RecipeGridProps {
  recipes: Recipe[]
}

export function RecipeGrid({ recipes }: RecipeGridProps) {
  // Use local state to force animation on mount/update
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // No results state
  if (recipes.length === 0) {
    return (
      <motion.div
        key="empty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-12"
      >
        <div className="text-muted-foreground mb-4">
          <User size={64} className="mx-auto opacity-20" />
        </div>
        <h3 className="text-xl font-medium text-foreground mb-2">No recipes found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="grid"
      layout="position"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "100px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {recipes.map((recipe) => (
          <motion.div
            key={recipe.id}
            layout
            variants={{
              hidden: { opacity: 0, scale: 0.9, y: 20 },
              show: { opacity: 1, scale: 1, y: 0 }
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              mass: 1,
              opacity: { duration: 0.5, ease: "easeInOut" },
              layout: { duration: 0.6, ease: "easeInOut" }
            }}
            className="h-full"
          >
            <RecipeCard recipe={recipe} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  const difficultyColors: Record<string, string> = {
    Easy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Hard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }

  return (
    <Link href={`/recipe/${recipe.id}`} className="group block h-full">
      <div className="card h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border">
        {/* Recipe Image */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground/30 bg-muted">
              <User size={48} />
            </div>
          )}

          {/* Difficulty Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm border border-white/20 ${difficultyColors[recipe.difficulty] || difficultyColors.Medium}`}>
              {recipe.difficulty || 'Medium'}
            </span>
          </div>

          {/* Subtle gradient overlay for better text contrast if we had overlaid text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Recipe Info */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-lg text-card-foreground mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center space-x-1.5 bg-secondary/50 px-2 py-1 rounded-md">
              <Clock size={14} />
              <span>{totalTime > 0 ? `${totalTime} min` : 'N/A'}</span>
            </div>

            {recipe.reviewCount > 0 && (
              <div className="flex items-center space-x-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="font-medium text-foreground">{recipe.avgRating}</span>
                <span className="text-muted-foreground/60 text-xs">({recipe.reviewCount})</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border/50">
              {recipe.category || 'General'}
            </span>

            {recipe.users?.name && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <span>by</span>
                <span className="font-medium text-foreground">{recipe.users.name}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
