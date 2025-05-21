import { Inter } from "next/font/google"
import CartProvider from "@/components/providers/cart-provider"
import AuthProvider from "@/components/providers/auth-provider"
import { Toaster } from "@/components/ui/sonner"
import "@/app/globals.css"
import ClientLayout from "@/components/layout/client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Greenfields Cannabis",
  description: "Premium Quality Cannabis Products for Connoisseurs",
  generator: "v0.dev",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: "#000", color: "#fff" }}>
        <AuthProvider>
          <CartProvider>
            <ClientLayout>{children}</ClientLayout>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
