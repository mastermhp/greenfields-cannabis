"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ThumbsUp, Flag, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const ProductReviews = ({ productId }) => {
  const { toast } = useToast()
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [expandedReview, setExpandedReview] = useState(null)

  // Mock reviews data
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: {
        name: "John D.",
        avatar: "/placeholder.svg?height=50&width=50",
        verified: true,
      },
      rating: 5,
      date: "2023-12-15",
      title: "Exceptional Quality",
      text: "I've tried many premium cannabis products, but this one stands out. The effects are exactly as described - relaxing without being overwhelming. The flavor profile is complex and enjoyable. Definitely worth the price for the quality you're getting.",
      helpful: 24,
      reply: {
        from: "Greenfields Team",
        text: "Thank you for your kind words, John! We're thrilled to hear you enjoyed our product. We put a lot of care into ensuring consistent quality and effects. We appreciate your support!",
        date: "2023-12-16",
      },
    },
    {
      id: 2,
      user: {
        name: "Sarah M.",
        avatar: "/placeholder.svg?height=50&width=50",
        verified: true,
      },
      rating: 4,
      date: "2023-11-28",
      title: "Great Product, Fast Shipping",
      text: "The product arrived quickly and was well-packaged. The effects are great for evening relaxation. I'm taking off one star only because I found it a bit pricey compared to similar products, but the quality is definitely there.",
      helpful: 18,
    },
    {
      id: 3,
      user: {
        name: "Michael T.",
        avatar: "/placeholder.svg?height=50&width=50",
        verified: true,
      },
      rating: 5,
      date: "2023-11-10",
      title: "Perfect for Anxiety Relief",
      text: "I use this product primarily for anxiety, and it works wonders. The effects come on smoothly and provide relief without cloudiness. I can still function and focus while enjoying the calming benefits. Will definitely purchase again.",
      helpful: 32,
    },
    {
      id: 4,
      user: {
        name: "Emily R.",
        avatar: "/placeholder.svg?height=50&width=50",
        verified: false,
      },
      rating: 3,
      date: "2023-10-25",
      title: "Good but Inconsistent",
      text: "When this product is good, it's really good. However, I've noticed some inconsistency between batches. Sometimes the effects are perfect, other times they're milder than expected. Hope they can improve quality control.",
      helpful: 15,
      reply: {
        from: "Greenfields Team",
        text: "Hi Emily, thank you for your honest feedback. We take quality control very seriously and would like to learn more about your experience. Please contact our customer service team so we can address this issue and make it right.",
        date: "2023-10-26",
      },
    },
  ])

  const handleSubmitReview = (e) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting your review.",
        variant: "destructive",
      })
      return
    }

    if (reviewText.trim().length < 10) {
      toast({
        title: "Review Too Short",
        description: "Please write a more detailed review (minimum 10 characters).",
        variant: "destructive",
      })
      return
    }

    // Add new review to the list
    const newReview = {
      id: reviews.length + 1,
      user: {
        name: "You",
        avatar: "/placeholder.svg?height=50&width=50",
        verified: true,
      },
      rating,
      date: new Date().toISOString().split("T")[0],
      title: "My Review",
      text: reviewText,
      helpful: 0,
    }

    setReviews([newReview, ...reviews])

    // Reset form
    setRating(0)
    setReviewText("")
    setShowReviewForm(false)

    toast({
      title: "Review Submitted",
      description: "Thank you for sharing your feedback!",
    })
  }

  const handleHelpful = (reviewId) => {
    setReviews(reviews.map((review) => (review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review)))

    toast({
      title: "Marked as Helpful",
      description: "Thank you for your feedback!",
    })
  }

  const handleReport = (reviewId) => {
    toast({
      title: "Review Reported",
      description: "Thank you for flagging this review. Our team will review it shortly.",
    })
  }

  const toggleExpandReview = (reviewId) => {
    if (expandedReview === reviewId) {
      setExpandedReview(null)
    } else {
      setExpandedReview(reviewId)
    }
  }

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.date) - new Date(a.date)
    } else if (sortBy === "oldest") {
      return new Date(a.date) - new Date(b.date)
    } else if (sortBy === "highest") {
      return b.rating - a.rating
    } else if (sortBy === "lowest") {
      return a.rating - b.rating
    } else if (sortBy === "helpful") {
      return b.helpful - a.helpful
    }
    return 0
  })

  return (
    <div>
      {/* Review Summary */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="text-center">
            <div className="text-5xl font-bold gold-text mb-2">
              {reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length}
            </div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={
                    star <= Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
                      ? "text-[#D4AF37] fill-[#D4AF37]"
                      : "text-gray-400"
                  }
                />
              ))}
            </div>
            <div className="text-beige">Based on {reviews.length} reviews</div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((review) => review.rating === star).length
              const percentage = (count / reviews.length) * 100

              return (
                <div key={star} className="flex items-center">
                  <div className="flex items-center w-20">
                    <span className="text-beige mr-2">{star}</span>
                    <Star size={16} className="text-[#D4AF37] fill-[#D4AF37]" />
                  </div>
                  <div className="flex-grow h-2 bg-[#222] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4AF37]" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="w-16 text-right text-beige text-sm">
                    {count} ({percentage.toFixed(0)}%)
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      <div className="mb-8">
        <Button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
        >
          Write a Review
        </Button>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-[#111] border border-[#333] p-6">
              <h3 className="text-xl font-bold mb-4">Write Your Review</h3>

              <form onSubmit={handleSubmitReview}>
                <div className="mb-6">
                  <label className="block text-beige mb-2">Rating</label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-2xl mr-1 focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={
                            star <= (hoverRating || rating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-400"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="review" className="block text-beige mb-2">
                    Your Review
                  </label>
                  <Textarea
                    id="review"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={6}
                    className="bg-black border-[#333] focus:border-[#D4AF37] rounded-none resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="border-[#333] text-white hover:bg-[#222] hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B8860B] text-black">
                    Submit Review
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort Controls */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Customer Reviews</h3>
        <div className="flex items-center">
          <span className="text-beige mr-2">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#111] border border-[#333] text-white px-3 py-1 rounded-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <div key={review.id} className="bg-[#111] border border-[#333] p-6">
            <div className="flex justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <Image
                    src={review.user.avatar || "/placeholder.svg"}
                    alt={review.user.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">{review.user.name}</span>
                    {review.user.verified && (
                      <span className="ml-2 text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5">Verified Purchase</span>
                    )}
                  </div>
                  <div className="text-sm text-beige">{review.date}</div>
                </div>
              </div>

              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={star <= review.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-400"}
                  />
                ))}
              </div>
            </div>

            <h4 className="text-lg font-medium mb-2">{review.title}</h4>

            <div
              className={`text-beige ${review.text.length > 200 && expandedReview !== review.id ? "line-clamp-3" : ""}`}
            >
              {review.text}
            </div>

            {review.text.length > 200 && (
              <button
                onClick={() => toggleExpandReview(review.id)}
                className="text-[#D4AF37] text-sm mt-2 flex items-center"
              >
                {expandedReview === review.id ? "Show less" : "Read more"}
                <ChevronDown
                  size={16}
                  className={`ml-1 transition-transform ${expandedReview === review.id ? "rotate-180" : ""}`}
                />
              </button>
            )}

            {/* Company Reply */}
            {review.reply && (
              <div className="mt-4 bg-[#D4AF37]/5 border-l-2 border-[#D4AF37] p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{review.reply.from}</span>
                  <span className="text-sm text-beige">{review.reply.date}</span>
                </div>
                <p className="text-beige">{review.reply.text}</p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="flex items-center text-beige hover:text-[#D4AF37] transition-colors"
                >
                  <ThumbsUp size={16} className="mr-1" />
                  <span>Helpful ({review.helpful})</span>
                </button>

                <button
                  onClick={() => handleReport(review.id)}
                  className="flex items-center text-beige hover:text-[#D4AF37] transition-colors"
                >
                  <Flag size={16} className="mr-1" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductReviews
