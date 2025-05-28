import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const role = searchParams.get("role")
    const search = searchParams.get("search")

    const filters = {}

    if (status && status !== "all") {
      filters.status = status
    }

    if (role && role !== "all") {
      filters.role = role
    }

    if (search) {
      filters.search = search
    }

    const users = await UserOperations.getAllUsers(filters)

    // Remove sensitive data
    const sanitizedUsers = users.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return NextResponse.json({
      success: true,
      data: sanitizedUsers,
      count: sanitizedUsers.length,
    })
  } catch (error) {
    console.error("Users API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
