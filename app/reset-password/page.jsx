// "use client"

// import { useState, useEffect } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import { motion } from "framer-motion"
// import { ArrowLeft, Lock, Loader2, Eye, EyeOff } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { useToast } from "@/hooks/use-toast"
// import Link from "next/link"

// const ResetPasswordPage = () => {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const { toast } = useToast()
//   const [password, setPassword] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   const [token, setToken] = useState("")

//   useEffect(() => {
//     const tokenParam = searchParams.get("token")
//     if (!tokenParam) {
//       toast({
//         title: "Invalid Reset Link",
//         description: "No reset token found. Please request a new password reset.",
//         variant: "destructive",
//       })
//       router.push("/forgot-password")
//     } else {
//       setToken(tokenParam)
//     }
//   }, [searchParams, router, toast])

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!password || !confirmPassword) {
//       toast({
//         title: "Missing Information",
//         description: "Please fill in all fields.",
//         variant: "destructive",
//       })
//       return
//     }

//     if (password.length < 6) {
//       toast({
//         title: "Password Too Short",
//         description: "Password must be at least 6 characters long.",
//         variant: "destructive",
//       })
//       return
//     }

//     if (password !== confirmPassword) {
//       toast({
//         title: "Passwords Don't Match",
//         description: "Please make sure both passwords match.",
//         variant: "destructive",
//       })
//       return
//     }

//     setLoading(true)

//     try {
//       const response = await fetch("/api/auth/reset-password", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ token, password }),
//       })

//       const data = await response.json()

//       if (data.success) {
//         toast({
//           title: "Password Reset Successful",
//           description: "Your password has been reset successfully. You can now log in with your new password.",
//         })
//         router.push("/login")
//       } else {
//         toast({
//           title: "Reset Failed",
//           description: data.error || "Failed to reset password",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       console.error("Reset password error:", error)
//       toast({
//         title: "Reset Failed",
//         description: "Failed to reset password. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!token) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center p-4">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto"></div>
//           <p className="text-beige mt-4">Validating reset token...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="w-full max-w-md"
//       >
//         <Card className="bg-[#111] border-[#333]">
//           <CardHeader className="space-y-1">
//             <div className="flex items-center gap-2 mb-4">
//               <Link href="/login">
//                 <Button variant="ghost" size="sm" className="text-beige hover:text-white">
//                   <ArrowLeft size={16} className="mr-2" />
//                   Back to Login
//                 </Button>
//               </Link>
//             </div>
//             <CardTitle className="text-2xl font-bold text-center gold-text">Reset Password</CardTitle>
//             <p className="text-center text-beige">Enter your new password below.</p>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="relative">
//                 <Input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="New password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="bg-black border-[#333] focus:border-[#D4AF37] text-white pr-10"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
//                 >
//                   {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
//               </div>

//               <div className="relative">
//                 <Input
//                   type={showConfirmPassword ? "text" : "password"}
//                   placeholder="Confirm new password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="bg-black border-[#333] focus:border-[#D4AF37] text-white pr-10"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
//                 >
//                   {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
//               </div>

//               <div className="text-xs text-gray-400 space-y-1">
//                 <p>Password requirements:</p>
//                 <ul className="list-disc list-inside space-y-1">
//                   <li className={password.length >= 6 ? "text-green-400" : ""}>At least 6 characters</li>
//                   <li className={password === confirmPassword && password ? "text-green-400" : ""}>Passwords match</li>
//                 </ul>
//               </div>

//               <Button type="submit" disabled={loading} className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black">
//                 {loading ? (
//                   <>
//                     <Loader2 size={16} className="mr-2 animate-spin" />
//                     Resetting Password...
//                   </>
//                 ) : (
//                   <>
//                     <Lock size={16} className="mr-2" />
//                     Reset Password
//                   </>
//                 )}
//               </Button>

//               <div className="text-center">
//                 <Link href="/login" className="text-sm text-beige hover:text-[#D4AF37] transition-colors">
//                   Remember your password? Sign in
//                 </Link>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   )
// }

// export default ResetPasswordPage
