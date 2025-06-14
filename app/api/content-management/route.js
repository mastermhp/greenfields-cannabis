import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page")

    if (!page) {
      return NextResponse.json({ success: false, error: "Page parameter is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const content = await db.collection("content").findOne({ page })

    return NextResponse.json({
      success: true,
      data: content?.content || null,
    })
  } catch (error) {
    console.error("Error fetching content:", error)
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
    const { page, content } = body

    if (!page || !content) {
      return NextResponse.json({ success: false, error: "Page and content are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Update or insert content
    const result = await db.collection("content").updateOne(
      { page },
      {
        $set: {
          page,
          content,
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
      message: "Content updated successfully",
      data: { page, content },
    })
  } catch (error) {
    console.error("Error updating content:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
