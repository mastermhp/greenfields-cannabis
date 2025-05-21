"use client"

import { CartProvider as CartContextProvider } from "@/hooks/use-cart"

export default function CartProvider({ children }) {
  return <CartContextProvider>{children}</CartContextProvider>
}
