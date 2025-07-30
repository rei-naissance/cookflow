'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Star, User } from 'lucide-react'

type Recipe = {
  id: string
  title: string
  image_url: string | null
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
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
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <User size={64} className="mx-auto" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No recipes found</h3>
        <p className="text-gray-600">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime = recipe.prep_time + recipe.cook_time
  const difficultyColors = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800'
  }

  return (
    <Link href={`/recipe/${recipe.id}`} className="group">
      <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Recipe Image */}
        <div className="relative h-48 bg-gray-200">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <User size={48} />
            </div>
          )}
          
          {/* Difficulty Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[recipe.difficulty]}`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>

        {/* Recipe Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {recipe.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <Clock size={16} />
              <span>{totalTime} min</span>
            </div>
            
            {recipe.reviewCount > 0 && (
              <div className="flex items-center space-x-1">
                <Star size={16} className="text-yellow-400 fill-current" />
                <span>{recipe.avgRating}</span>
                <span className="text-gray-400">({recipe.reviewCount})</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {recipe.category}
            </span>
            
            {recipe.users?.name && (
              <span className="text-xs text-gray-500">
                by {recipe.users.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
