import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { RecipeGrid } from '@/components/RecipeGrid'
import { SearchAndFilters } from '@/components/SearchAndFilters'

export default async function HomePage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; difficulty?: string; time?: string }
}) {
  const supabase = createServerSupabaseClient()
  
  // Build query based on search params
  let query = supabase
    .from('recipes')
    .select(`
      *,
      users!recipes_author_id_fkey(name),
      reviews(rating)
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (searchParams.search) {
    query = query.ilike('title', `%${searchParams.search}%`)
  }
  
  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }
  
  if (searchParams.difficulty) {
    query = query.eq('difficulty', searchParams.difficulty)
  }
  
  if (searchParams.time) {
    const maxTime = parseInt(searchParams.time)
    query = query.lte('prep_time', maxTime).lte('cook_time', maxTime)
  }

  const { data: recipes, error } = await query

  if (error) {
    console.error('Error fetching recipes:', error)
  }

  // Calculate average ratings
  const recipesWithRatings = recipes?.map(recipe => {
    const ratings = recipe.reviews?.map((r: any) => r.rating) || []
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
      : 0
    
    return {
      ...recipe,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: ratings.length
    }
  }) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Amazing Recipes
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Follow step-by-step cooking instructions with built-in timers and never miss a beat
        </p>
      </div>

      {/* Search and Filters */}
      <SearchAndFilters />

      {/* Recipe Grid */}
      <RecipeGrid recipes={recipesWithRatings} />
    </div>
  )
}
