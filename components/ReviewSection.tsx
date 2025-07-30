'use client'

import { useState } from 'react'
import { Star, MessageCircle } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { createClientSupabaseClient } from '@/lib/supabaseClient'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  users: { name: string | null } | null
}

interface ReviewSectionProps {
  recipeId: string
  reviews: Review[]
}

export function ReviewSection({ recipeId, reviews: initialReviews }: ReviewSectionProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState(initialReviews)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClientSupabaseClient()

  // Check if user has already reviewed this recipe
  const userReview = reviews.find(review => 
    user && review.users && review.users.name === user.email
  )

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || rating === 0) return

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          recipe_id: recipeId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null
        })
        .select(`
          id,
          rating,
          comment,
          created_at,
          users!reviews_user_id_fkey(name)
        `)
        .single()

      if (error) throw error

      // Add new review to the list
      setReviews([data, ...reviews])
      setShowReviewForm(false)
      setRating(0)
      setComment('')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
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
    </div>
  )
}
