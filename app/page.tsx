
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { RecipeGrid } from '@/components/RecipeGrid'
import { SearchAndFilters } from '@/components/SearchAndFilters'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { NewsletterSection } from '@/components/landing/NewsletterSection'

export default async function HomePage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; difficulty?: string; time?: string; sort?: string }
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

  // Apply sorting
  if (searchParams.sort === 'popular') {
    // Sorting by rating is tricky in Supabase without a view or join, but we can do client-side sort
    // For now, let's just use descending order of creation as fallback or maybe difficulty
    query = query.order('created_at', { ascending: false })
  } else if (searchParams.sort === 'latest') {
    query = query.order('created_at', { ascending: false })
  } else if (searchParams.sort === 'oldest') {
    query = query.order('created_at', { ascending: true })
  } else {
    // Default sort
    query = query.order('created_at', { ascending: false })
  }

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
    // Filter recipes where prep_time + cook_time <= maxTime
    // This is hard to do in one query without a computed column or view
    // We will do it client side for now as the dataset is small
  }

  const { data: recipes, error } = await query

  if (error) {
    console.error('Error fetching recipes:', error)
  }

  // Calculate average ratings and total time
  let recipesWithRatings = recipes?.map(recipe => {
    const ratings = recipe.reviews?.map((r: any) => r.rating) || []
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
      : 0

    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

    return {
      ...recipe,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: ratings.length,
      totalTime
    }
  }) || []

  // Client-side filtering/sorting for complex logic
  if (searchParams.time) {
    const maxTime = parseInt(searchParams.time)
    recipesWithRatings = recipesWithRatings.filter(r => r.totalTime <= maxTime)
  }

  if (searchParams.sort === 'popular') {
    recipesWithRatings.sort((a, b) => b.avgRating - a.avgRating)
  }


  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-noise" />
      <HeroSection recipes={recipesWithRatings.slice(0, 5)} />

      <FeaturesSection />

      <section id="recipes" className="py-16 md:py-24 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
              Explore our recipes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From quick snacks to gourmet meals, find exactly what you're craving.
            </p>
          </div>

          <SearchAndFilters />
          <RecipeGrid recipes={recipesWithRatings} />
        </div>
      </section>

      <NewsletterSection />
    </div>
  )
}
