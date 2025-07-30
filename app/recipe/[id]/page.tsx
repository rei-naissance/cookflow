import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Users, ChefHat, Star, Play } from 'lucide-react'
import { FavoriteButton } from '@/components/FavoriteButton'
import { ReviewSection } from '@/components/ReviewSection'

export default async function RecipePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  
  // Fetch recipe with all related data
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(`
      *,
      users!recipes_author_id_fkey(name, avatar_url),
      ingredients(id, text, order_index),
      steps(id, step_number, instruction, timer_duration),
      reviews(id, rating, comment, created_at, users!reviews_user_id_fkey(name))
    `)
    .eq('id', params.id)
    .single()

  if (error || !recipe) {
    notFound()
  }

  // Sort ingredients and steps by order
  // const sortedIngredients = recipe.ingredients?.sort((a, b) => a.order_index - b.order_index) || []
  // const sortedSteps = recipe.steps?.sort((a, b) => a.step_number - b.step_number) || []

  const sortedSteps = Array.isArray(recipe.steps)
    ? [...recipe.steps].sort((a, b) => a.step_number - b.step_number)
    : []

  const sortedIngredients = Array.isArray(recipe.ingredients)
    ? [...recipe.ingredients].sort((a, b) => a.order_index - b.order_index)
    : []


  // Calculate average rating
  const ratings = recipe.reviews?.map((r: any) => r.rating) || []
  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
    : 0

  const totalTime = recipe.prep_time + recipe.cook_time
  const difficultyColors = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
          <FavoriteButton recipeId={recipe.id} />
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <Users size={16} />
            <span>by {recipe.users?.name || 'Anonymous'}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span>{totalTime} minutes</span>
          </div>
          
          {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[recipe.difficulty]}`}>
            {recipe.difficulty}
          </span> */}

          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[recipe.difficulty as keyof typeof difficultyColors]}`}>
            {recipe.difficulty}
          </span>
          
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
            {recipe.category}
          </span>
        </div>

        {/* Rating */}
        {ratings.length > 0 && (
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={`${
                    star <= avgRating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {avgRating.toFixed(1)} ({ratings.length} review{ratings.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Recipe Image */}
          {recipe.image_url && (
            <div className="relative h-64 md:h-80 mb-8 rounded-lg overflow-hidden">
              <Image
                src={recipe.image_url}
                alt={recipe.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Start Cooking Button */}
          <div className="mb-8">
            <Link
              href={`/cook/${recipe.id}`}
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <Play size={20} />
              <span>Start Cooking</span>
            </Link>
          </div>

          {/* Steps Preview */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Instructions</h2>
            <div className="space-y-4">
              {sortedSteps.map((step, index) => (
                <div key={step.id} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">{step.instruction}</p>
                    {step.timer_duration && (
                      <div className="flex items-center space-x-1 mt-2 text-sm text-primary-600">
                        <Clock size={16} />
                        <span>{Math.floor(step.timer_duration / 60)}:{(step.timer_duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recipe Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipe Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Prep Time:</span>
                <span className="font-medium text-gray-900">{typeof recipe.prep_time === 'number' ? `${recipe.prep_time} min` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Cook Time:</span>
                <span className="font-medium text-gray-900">{typeof recipe.cook_time === 'number' ? `${recipe.cook_time} min` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Total Time:</span>
                <span className="font-medium text-gray-900">{typeof totalTime === 'number' ? `${totalTime} min` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Difficulty:</span>
                <span
                  className={
                    `font-medium ` +
                    (recipe.difficulty === 'Easy'
                      ? 'text-green-600'
                      : recipe.difficulty === 'Medium'
                        ? 'text-orange-500'
                        : recipe.difficulty === 'Hard'
                          ? 'text-red-600'
                          : 'text-gray-900')
                  }
                >
                  {recipe.difficulty || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
            <ul className="space-y-2">
              {sortedIngredients.map((ingredient) => (
                <li key={ingredient.id} className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{ingredient.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <ReviewSection recipeId={recipe.id} reviews={recipe.reviews || []} />
      </div>
    </div>
  )
}
