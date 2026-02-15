'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import { RecipeGrid } from '@/components/RecipeGrid'
import { Heart, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function FavoritesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const [favoriteRecipes, setFavoriteRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      router.push('/login')
      return
    }

    const fetchData = async () => {
      setLoading(true)
      const { data: favorites } = await supabase
        .from('favorites')
        .select(`recipes(*, users!recipes_author_id_fkey(name), reviews(rating))`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setFavoriteRecipes(favorites || [])
      setLoading(false)
    }

    fetchData()
  }, [user, supabase, router])

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

  const processedFavoriteRecipes = processRecipesWithRatings(favoriteRecipes || [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-16 animate-page-enter">
      <div className="container max-w-6xl px-4 md:px-6 mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-2xl text-red-500 mb-4 animate-in zoom-in-50 duration-500">
            <Heart size={32} className="fill-current" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Your Favorites
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A curated collection of your most loved recipes.
          </p>
        </div>

        {/* Content */}
        {processedFavoriteRecipes.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <RecipeGrid recipes={processedFavoriteRecipes} />
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-[2.5rem] border border-dashed border-border/50 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Heart size={40} className="text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">No favorites yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
              Start exploring and save recipes you love to build your personal cookbook.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-semibold shadow-lg hover:bg-foreground/90 hover:scale-105 transition-all active:scale-95"
            >
              <span>Browse Recipes</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
