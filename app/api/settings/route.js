import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request) {
  try {
    const { db } = await connectToDatabase()
    const settings = await db.collection("settings").findOne({ type: "general" })

    return NextResponse.json({
      success: true,
      data: settings?.data || {},
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.auth || authResult.auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 })
    }

    const body = await request.json()
    const { data } = body

    if (!data) {
      return NextResponse.json({ success: false, error: "Settings data is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Update or insert settings
    const result = await db.collection("settings").updateOne(
      { type: "general" },
      {
        $set: {
          type: "general",
          data,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data,
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
