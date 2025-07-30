'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { createClientSupabaseClient } from '@/lib/supabaseClient'

interface FavoriteButtonProps {
  recipeId: string
}

export function FavoriteButton({ recipeId }: FavoriteButtonProps) {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    if (user) {
      checkFavoriteStatus()
    }
  }, [user, recipeId])

  const checkFavoriteStatus = async () => {
    if (!user) return

    const { data } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .single()

    setIsFavorited(!!data)
  }

  const toggleFavorite = async () => {
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = '/login'
      return
    }

    setLoading(true)

    try {
      if (isFavorited) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId)
        
        setIsFavorited(false)
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            recipe_id: recipeId
          })
        
        setIsFavorited(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full transition-colors duration-200 ${
        isFavorited
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart
        size={20}
        className={isFavorited ? 'fill-current' : ''}
      />
    </button>
  )
}
