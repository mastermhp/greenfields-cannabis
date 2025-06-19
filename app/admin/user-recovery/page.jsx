"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function UserRecoveryPage() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const { toast } = useToast()

  const fetchAllUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/users")
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
        toast({
          title: "Users Retrieved",
          description: `Found ${data.users.length} users`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Fetch users error:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetUserPassword = async (userId, newPassword) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPassword, // Plain text password
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Password Reset",
          description: "User password has been reset successfully",
        })
        fetchAllUsers() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reset password",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Reset password error:", error)
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testUserLogin = async (email, password) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe: false,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Login Test Successful",
          description: `User ${data.user.name} can login successfully`,
        })
      } else {
        toast({
          title: "Login Test Failed",
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Recovery & Testing</h1>
        <Button onClick={fetchAllUsers} disabled={loading}>
          Refresh Users
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>View and manage existing users</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground">No users found. Click "Refresh Users" to load.</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user._id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Role: {user.role || "customer"} | Admin: {user.isAdmin ? "Yes" : "No"} | Password Length:{" "}
                          {user.password?.length || 0}
                        </p>
                      </div>
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testUserLogin(user.email, "admin123")}
                          disabled={loading}
                        >
                          Test Login (admin123)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetUserPassword(user._id, "admin123")}
                          disabled={loading}
                        >
                          Reset Password
                        </Button>
                      </div>
                    </div>

                    {selectedUser === user._id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded">
                        <h4 className="font-medium mb-2">User Details:</h4>
                        <pre className="text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedUser(selectedUser === user._id ? null : user._id)}
                    >
                      {selectedUser === user._id ? "Hide Details" : "Show Details"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common recovery actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                // Reset all user passwords to "admin123"
                users.forEach((user) => {
                  if (user._id) {
                    resetUserPassword(user._id, "admin123")
                  }
                })
              }}
              disabled={loading || users.length === 0}
              variant="destructive"
            >
              Reset All Passwords to "admin123"
            </Button>

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Common Issues:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Password hashing incompatibility</li>
                <li>Email case sensitivity</li>
                <li>Missing user fields</li>
                <li>Token generation issues</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
