import { NextResponse } from "next/server"
import { connectToDatabase, collections } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const categories = await db.collection(collections.categories).find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Categories API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
      },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    const category = {
      id: new ObjectId().toString(),
      name: body.name,
      description: body.description || "",
      image: body.image || "/placeholder.svg?height=200&width=300",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection(collections.categories).insertOne(category)

    return NextResponse.json(
      {
        success: true,
        data: { ...category, _id: result.insertedId },
        message: "Category created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create Category Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
      },
      { status: 500 },
    )
  }
}
