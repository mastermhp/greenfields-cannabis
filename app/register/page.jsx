import { Suspense } from "react"
import RegisterForm from "@/components/auth/register-form"

// Loading skeleton component
function RegisterSkeleton() {
  return (
    <div className="min-h-screen py-40 bg-black flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Image Section Skeleton */}
        <div className="hidden md:block md:w-1/2 relative bg-gray-800 animate-pulse">
          <div className="absolute inset-0 bg-black/70"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center p-12 z-10">
            <div className="text-center space-y-6">
              <div className="h-8 bg-gray-700 rounded w-64 mx-auto"></div>
              <div className="h-4 bg-gray-700 rounded w-80 mx-auto"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-8 h-8 bg-gray-700 rounded-full mr-4"></div>
                    <div className="h-4 bg-gray-700 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Section Skeleton */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto animate-pulse"></div>
              <div className="h-8 bg-gray-700 rounded w-48 mx-auto"></div>
              <div className="h-4 bg-gray-700 rounded w-32 mx-auto"></div>
            </div>

            <div className="space-y-4">
              <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterForm />
    </Suspense>
  )
}
