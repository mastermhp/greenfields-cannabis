import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/database-operations"

export async function POST() {
  try {
    const result = await initializeDatabase()

    if (result.success) {
      return NextResponse.json({ message: "Database initialized successfully" })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Database initialization endpoint" })
}
