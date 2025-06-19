"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function DebugPage() {
  const [loading, setLoading] = useState(false)
  const [testEmail, setTestEmail] = useState("admin@greenfields.com")
  const [testPassword, setTestPassword] = useState("admin123")
  const [results, setResults] = useState({})
  const { toast } = useToast()

  const initializeDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
      })
      const data = await response.json()

      setResults((prev) => ({ ...prev, initDb: data }))

      if (data.success) {
        toast({
          title: "Database Initialized",
          description: "Admin user and sample data created successfully",
        })
      } else {
        toast({
          title: "Initialization Failed",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Init DB error:", error)
      toast({
        title: "Error",
        description: "Failed to initialize database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      console.log("Testing login with:", testEmail, testPassword)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          rememberMe: false,
        }),
      })

      const data = await response.json()
      console.log("Login response:", data)

      setResults((prev) => ({ ...prev, login: data }))

      if (data.success) {
        toast({
          title: "Login Successful",
          description: `Welcome ${data.user.name}!`,
        })
      } else {
        toast({
          title: "Login Failed",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login test error:", error)
      toast({
        title: "Error",
        description: "Failed to test login",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/users")
      const data = await response.json()

      setResults((prev) => ({ ...prev, users: data }))

      toast({
        title: "Users Retrieved",
        description: `Found ${data.users?.length || 0} users`,
      })
    } catch (error) {
      console.error("Check users error:", error)
      toast({
        title: "Error",
        description: "Failed to retrieve users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Debug & Testing</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Database Operations</CardTitle>
            <CardDescription>Initialize database and check data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={initializeDatabase} disabled={loading} className="w-full">
              Initialize Database
            </Button>
            <Button onClick={checkUsers} disabled={loading} variant="outline" className="w-full">
              Check Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login Testing</CardTitle>
            <CardDescription>Test authentication with different credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            <Button onClick={testLogin} disabled={loading} className="w-full">
              Test Login
            </Button>
          </CardContent>
        </Card>
      </div>

      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Results</CardTitle>
            <CardDescription>API responses and debugging information</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(results, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
