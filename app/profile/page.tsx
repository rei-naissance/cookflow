import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import { RecipeGrid } from '@/components/RecipeGrid'
import { User, Heart, ChefHat } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's submitted recipes
  const { data: submittedRecipes } = await supabase
    .from('recipes')
    .select(`
      *,
      users!recipes_author_id_fkey(name),
      reviews(rating)
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch user's favorite recipes
  const { data: favoriteRecipes } = await supabase
    .from('favorites')
    .select(`
      recipes(
        *,
        users!recipes_author_id_fkey(name),
        reviews(rating)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Process recipes with ratings
  const processRecipesWithRatings = (recipes: any[]) => {
    return recipes?.map(recipe => {
      const recipeData = recipe.recipes || recipe
      const ratings = recipeData.reviews?.map((r: any) => r.rating) || []
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
        : 0
      
      return {
        ...recipeData,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length
      }
    }) || []
  }

  const processedSubmittedRecipes = processRecipesWithRatings(submittedRecipes || [])
  const processedFavoriteRecipes = processRecipesWithRatings(favoriteRecipes || [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={32} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile?.name || 'Anonymous Chef'}
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {processedSubmittedRecipes.length}
            </div>
            <div className="text-sm text-gray-600">Recipes Shared</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {processedFavoriteRecipes.length}
            </div>
            <div className="text-sm text-gray-600">Favorites</div>
          </div>
        </div>
      </div>

      {/* Submitted Recipes */}
      <div className="mb-12">
        <div className="flex items-center space-x-2 mb-6">
          <ChefHat size={24} className="text-primary-600" />
          <h2 className="text-2xl font-semibold text-gray-900">Your Recipes</h2>
        </div>
        
        {processedSubmittedRecipes.length > 0 ? (
          <RecipeGrid recipes={processedSubmittedRecipes} />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <ChefHat size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes yet</h3>
            <p className="text-gray-600 mb-4">Share your first recipe with the community!</p>
            <a
              href="/submit"
              className="inline-flex items-center space-x-2 btn-primary"
            >
              <ChefHat size={16} />
              <span>Submit Recipe</span>
            </a>
          </div>
        )}
      </div>

      {/* Favorite Recipes */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Heart size={24} className="text-red-500" />
          <h2 className="text-2xl font-semibold text-gray-900">Your Favorites</h2>
        </div>
        
        {processedFavoriteRecipes.length > 0 ? (
          <RecipeGrid recipes={processedFavoriteRecipes} />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Heart size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-4">Start exploring recipes and save your favorites!</p>
            <a
              href="/"
              className="inline-flex items-center space-x-2 btn-primary"
            >
              <span>Browse Recipes</span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
