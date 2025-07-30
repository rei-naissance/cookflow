"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import { RecipeGrid } from '@/components/RecipeGrid'
import { User, Heart, ChefHat } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const [profile, setProfile] = useState<any>(null)
  const [submittedRecipes, setSubmittedRecipes] = useState<any[]>([])
  const [favoriteRecipes, setFavoriteRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null)
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    // If user logs out, reset profile state and redirect to login
    if (!user) {
      setProfile(null)
      setSubmittedRecipes([])
      setFavoriteRecipes([])
      setEditName('')
      setEditAvatarFile(null)
      setEditAvatarPreview(null)
      setEditOpen(false)
      setLoading(false)
      router.push('/login')
      return
    }
    // If user is logged in, fetch profile and recipes
    const fetchData = async () => {
      setLoading(true)
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      const { data: submitted } = await supabase
        .from('recipes')
        .select(`*, users!recipes_author_id_fkey(name), reviews(rating)`)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
      setSubmittedRecipes(submitted || [])

      const { data: favorites } = await supabase
        .from('favorites')
        .select(`recipes(*, users!recipes_author_id_fkey(name), reviews(rating))`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setFavoriteRecipes(favorites || [])
      setLoading(false)
    }
    fetchData()
    if (profile) {
      setEditName(profile.name || '')
      setEditAvatarPreview(profile.avatar_url || null)
    }
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

  const processedSubmittedRecipes = processRecipesWithRatings(submittedRecipes || [])
  const processedFavoriteRecipes = processRecipesWithRatings(favoriteRecipes || [])

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-primary-100">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile Avatar"
                className="w-16 h-16 object-cover rounded-full border"
              />
            ) : (
              <User size={32} className="text-primary-600" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile?.name || 'Anonymous Chef'}
            </h1>
            <p className="text-gray-600">{user?.email ?? ''}</p>
          </div>
          <div className="flex-shrink-0 flex items-center">
            <button
              className="px-3 py-1 rounded bg-primary-100 text-primary-700 text-sm font-medium border border-primary-600 hover:bg-primary-200 hover:text-primary-900"
              onClick={() => setEditOpen(true)}
            >Edit Profile</button>
          </div>
        </div>
        <div className="mt-6 flex space-x-8">
          <div className="flex flex-1 justify-center items-center gap-16">
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
        {/* Edit Profile Modal */}
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setEditOpen(false)}
              >✕</button>
              <h2 className="text-xl font-bold mb-4 text-gray-600">Edit Profile</h2>
              <form
                onSubmit={async e => {
                  e.preventDefault()
                  setEditLoading(true)
                  setEditError('')
                  let avatarUrl = profile?.avatar_url || null
                  if (!user) {
                    setEditError('User not found. Please log in again.')
                    setEditLoading(false)
                    return
                  }
                  if (editAvatarFile) {
                    const fileExt = editAvatarFile.name.split('.').pop()
                    const fileName = `${user.id}_${Date.now()}.${fileExt}`
                    const { error: uploadError } = await supabase.storage
                      .from('profile-images')
                      .upload(fileName, editAvatarFile, { upsert: true })
                    if (uploadError) {
                      setEditError(uploadError.message)
                      setEditLoading(false)
                      return
                    }
                    avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-images/${fileName}`
                  }
                  const { error: updateError } = await supabase
                    .from('users')
                    .update({ name: editName, avatar_url: avatarUrl })
                    .eq('id', user.id)
                  if (updateError) {
                    setEditError(updateError.message)
                  } else {
                    setProfile({ ...profile, name: editName, avatar_url: avatarUrl })
                    setEditOpen(false)
                  }
                  setEditLoading(false)
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="edit-avatar"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0] || null
                          setEditAvatarFile(file)
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = () => setEditAvatarPreview(reader.result as string)
                            reader.readAsDataURL(file)
                          } else {
                            setEditAvatarPreview(profile?.avatar_url || null)
                          }
                        }}
                      />
                      <label htmlFor="edit-avatar" className="cursor-pointer inline-block">
                        <div className="w-20 h-20 rounded-full border flex items-center justify-center bg-gray-100 hover:bg-gray-200">
                          {editAvatarPreview ? (
                            <img src={editAvatarPreview} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover" />
                          ) : (
                            <span className="flex items-center justify-center w-full h-full text-center text-gray-400">Choose Image</span>
                          )}
                        </div>
                      </label>
                    </div>
                    {editAvatarPreview && (
                      <button
                        type="button"
                        className="text-xs text-red-500 hover:underline"
                        onClick={() => {
                          setEditAvatarFile(null)
                          setEditAvatarPreview(null)
                        }}
                      >Remove</button>
                    )}
                  </div>
                </div>
                {editError && (
                  <div className="text-red-600 text-sm mb-2">{editError}</div>
                )}
                <button
                  type="submit"
                  disabled={editLoading}
                  className="w-full py-2 px-4 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}
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
