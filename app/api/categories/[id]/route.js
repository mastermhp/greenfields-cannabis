import { NextResponse } from "next/server"
import { connectToDatabase, collections } from "@/lib/mongodb"

export async function PUT(request, { params }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params
    const body = await request.json()

    const updateData = {
      name: body.name,
      description: body.description || "",
      image: body.image || "/placeholder.svg?height=200&width=300",
      updatedAt: new Date(),
    }

    const result = await db.collection(collections.categories).updateOne({ id }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 },
      )
    }

    const updatedCategory = await db.collection(collections.categories).findOne({ id })

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: "Category updated successfully",
    })
  } catch (error) {
    console.error("Update Category Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update category",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params

    // Check if category is being used by products
    const productsUsingCategory = await db.collection(collections.products).countDocuments({ category: id })

    if (productsUsingCategory > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category. ${productsUsingCategory} products are using this category.`,
        },
        { status: 400 },
      )
    }

    const result = await db.collection(collections.categories).deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Delete Category Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete category",
      },
      { status: 500 },
    )
  }
}
