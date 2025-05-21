import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="text-center">
        <Loader2 size={50} className="animate-spin text-[#D4AF37] mx-auto mb-4" />
        <h2 className="text-2xl font-bold gold-text">Loading Products</h2>
        <p className="text-beige">Please wait while we fetch our premium collection</p>
      </div>
    </div>
  )
}
