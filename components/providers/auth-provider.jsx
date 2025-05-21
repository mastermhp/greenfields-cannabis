"use client"

import { AuthProvider as AuthContextProvider } from "@/hooks/use-auth"

export default function AuthProvider({ children }) {
  return <AuthContextProvider>{children}</AuthContextProvider>
}
