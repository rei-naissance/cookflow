"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import { RecipeGrid } from '@/components/RecipeGrid'
import { User, Heart, ChefHat, Camera, X, Loader2, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
    const fetchData = async () => {
      setLoading(true)
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)
      if (profileData) {
        setEditName(profileData.name || '')
        setEditAvatarPreview(profileData.avatar_url || null)
      }

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-background py-12"
    >
      <div className="container max-w-5xl px-4 md:px-6 mx-auto space-y-12">
        {/* Profile Header */}
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
          {/* Decorative background gradient */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"></div>

          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 pt-4">
            {/* Avatar */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-card bg-muted flex items-center justify-center overflow-hidden shadow-xl"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-muted-foreground" />
                )}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setEditName(profile?.name || '')
                  setEditAvatarPreview(profile?.avatar_url || null)
                  setEditOpen(true)
                }}
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg transition-transform"
                title="Edit Profile"
              >
                <Camera size={16} />
              </motion.button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left space-y-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {profile?.name || 'Anonymous Chef'}
              </h1>
              <p className="text-muted-foreground text-lg">{user?.email ?? ''}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-8 bg-background/50 backdrop-blur-sm p-4 rounded-2xl border border-border/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {processedSubmittedRecipes.length}
                </div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recipes</div>
              </div>
              <div className="w-px bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {processedFavoriteRecipes.length}
                </div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Favorites</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs/Sections */}
        <div className="space-y-16">
          {/* Submitted Recipes */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <ChefHat size={24} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Your Recipes</h2>
            </div>

            {processedSubmittedRecipes.length > 0 ? (
              <RecipeGrid recipes={processedSubmittedRecipes} />
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-3xl border border-dashed border-border">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No recipes yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Share your culinary masterpieces with the community.
                </p>
                <a
                  href="/submit"
                  className="inline-flex items-center gap-2 btn-primary px-6 py-2.5 rounded-full hover:scale-105 transition-transform"
                >
                  <Plus size={18} />
                  <span>Submit Recipe</span>
                </a>
              </div>
            )}
          </motion.div>

          {/* Favorite Recipes section removed */}
        </div>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {editOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-6 relative"
              >
                <button
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                  onClick={() => setEditOpen(false)}
                >
                  <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

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
                  className="space-y-6"
                >
                  <div className="flex justify-center">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden">
                        {editAvatarPreview ? (
                          <img src={editAvatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-muted-foreground" />
                        )}
                      </div>
                      <label
                        htmlFor="edit-avatar"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                      >
                        <Camera size={24} />
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        id="edit-avatar"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0] || null
                          setEditAvatarFile(file)
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = () => setEditAvatarPreview(reader.result as string)
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      placeholder={profile?.name || 'Enter your name'}
                      onChange={e => setEditName(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {editError && (
                    <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
                      {editError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={editLoading}
                    className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    {editLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
