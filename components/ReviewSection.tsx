'use client'

import { useState } from 'react'
import { Star, MessageCircle } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { createClientSupabaseClient } from '@/lib/supabaseClient'

interface Review {
  id: string
  rating: number
  comment: string | null
  image_url?: string | null
  created_at: string
  users: { name: string | null } | null
}

interface ReviewSectionProps {
  recipeId: string
  reviews: Review[]
}

export function ReviewSection({ recipeId, reviews: initialReviews }: ReviewSectionProps) {
  // Helper to fetch latest reviews from Supabase
  async function fetchLatestReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        image_url,
        created_at,
        users!reviews_user_id_fkey(name)
      `)
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching reviews:', error)
      return []
    }
    return (data || []).map(normalizeReviewUser)
  }
  // Helper to normalize users field
  function normalizeReviewUser(review: any) {
    return {
      ...review,
      users: Array.isArray(review.users) ? review.users[0] : review.users
    }
  }
  const { user } = useAuth()
  const [reviews, setReviews] = useState(initialReviews)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [modalImage, setModalImage] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const supabase = createClientSupabaseClient()

  // Check if user has already reviewed this recipe
  const userReview = reviews.find(review => 
    user && review.users && review.users.name === user.email
  )

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || rating === 0) return

    // Validate image file before upload
    if (imageFile) {
      if (!imageFile.type.startsWith('image/')) {
        alert('Selected file is not an image.')
        return
      }
      if (imageFile.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Image size must be less than 2MB.')
        return
      }
    }

    setLoading(true)

    try {
      let imageUrl = null
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}_${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(fileName, imageFile)
        if (uploadError) {
          console.error('Image upload error:', uploadError)
          alert(`Image upload failed: ${uploadError.message || uploadError}`)
          setLoading(false)
          return
        }
        // Use Supabase getPublicUrl for robust image URL
        const { data: publicUrlData } = supabase.storage
          .from('review-images')
          .getPublicUrl(fileName)
        imageUrl = publicUrlData?.publicUrl || null
        console.log('Uploaded image public URL:', imageUrl)
      }
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          recipe_id: recipeId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
          image_url: imageUrl
        })
        .select(`
          id,
          rating,
          comment,
          image_url,
          created_at,
          users!reviews_user_id_fkey(name)
        `)
        .single()

      if (error) {
        console.error('Review insert error:', error)
        alert(`Failed to submit review: ${error.message || error}`)
        setLoading(false)
        return
      }

      // Refetch latest reviews from Supabase to ensure images persist after reload
      const latestReviews = await fetchLatestReviews()
      setReviews(latestReviews)
      setShowReviewForm(false)
      setRating(0)
      setComment('')
      setImageFile(null)
      setImagePreview(null)
    } catch (error) {
      console.error('Unexpected error submitting review:', error)
      alert(`Unexpected error: ${error instanceof Error ? error.message : error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Reviews ({reviews.length})
        </h2>
        
        {user && !userReview && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="btn-primary"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="card p-6 mb-6">
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 ${
                      star <= rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    } transition-colors`}
                  >
                    <Star size={24} className={star <= rating ? 'fill-current' : ''} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Share your thoughts about this recipe..."
              />
            </div>
            {/* Improved Image Selection UI */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image (optional)</label>
              <div
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 transition-colors duration-200 cursor-pointer bg-gray-50 hover:border-primary-500 ${imagePreview ? 'border-primary-500' : 'border-gray-300'}`}
                tabIndex={0}
                role="button"
                aria-label="Select or drop an image"
                onClick={() => document.getElementById('review-image-input')?.click()}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    document.getElementById('review-image-input')?.click()
                  }
                }}
                onDragOver={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  const file = e.dataTransfer.files?.[0]
                  if (file && file.type.startsWith('image/')) {
                    setImageFile(file)
                    const reader = new FileReader()
                    reader.onload = () => setImagePreview(reader.result as string)
                    reader.readAsDataURL(file)
                  } else {
                    alert('Please select a valid image file.')
                  }
                }}
              >
                <input
                  id="review-image-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0] || null
                    if (file && file.type.startsWith('image/')) {
                      setImageFile(file)
                      const reader = new FileReader()
                      reader.onload = () => setImagePreview(reader.result as string)
                      reader.readAsDataURL(file)
                    } else if (file) {
                      alert('Please select a valid image file.')
                    } else {
                      setImagePreview(null)
                      setImageFile(null)
                    }
                  }}
                />
                {!imagePreview ? (
                  <>
                    <span className="text-gray-400 mb-2">
                      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 16V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"/><path stroke="currentColor" strokeWidth="2" d="m4 16 4.586-4.586a2 2 0 0 1 2.828 0L16 16"/><circle cx="9" cy="9" r="2" fill="currentColor"/></svg>
                    </span>
                    <span className="text-sm text-gray-500 text-center">Click or drag an image here to upload</span>
                  </>
                ) : (
                  <div className="flex flex-col items-center w-full">
                    <img
                      src={imagePreview}
                      alt="Review Preview"
                      className="w-32 h-32 rounded-lg object-cover border cursor-pointer hover:scale-105 transition-transform shadow-md"
                      onClick={e => {
                        e.stopPropagation()
                        setModalImage(imagePreview)
                      }}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-center">Click image to enlarge</div>
                    <button
                      type="button"
                      className="text-xs text-red-500 hover:underline mt-2"
                      onClick={e => {
                        e.stopPropagation()
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                    >Remove</button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={rating === 0 || loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {review.users?.name || 'Anonymous'}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {review.image_url && (
                <div className="mb-2 flex flex-col items-center">
                  <img
                    src={review.image_url ?? ''}
                    alt="Review Image"
                    className="w-32 h-32 rounded-lg object-cover border cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setModalImage(review.image_url ?? null)}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-center">Click to enlarge</div>
                </div>
              )}
              {review.comment && (
                <p className="text-gray-700 mt-2">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600">Be the first to review this recipe!</p>
        </div>
      )}

      {/* Image Modal */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setModalImage(null)}>
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full flex flex-col items-center relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl" onClick={() => setModalImage(null)}>&times;</button>
            <img src={modalImage} alt="Full Review" className="max-w-full max-h-[70vh] rounded-lg object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
