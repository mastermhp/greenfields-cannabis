import { NextResponse } from "next/server"
import { connectToDatabase, collections } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request, { params }) {
  try {
    console.log("Categories API: Updating category with ID:", params.id)

    const { db } = await connectToDatabase()
    const { id } = params
    const body = await request.json()
    console.log("Categories API: Update data:", body)

    // Create slug from name if name is provided
    const updateData = {
      name: body.name,
      description: body.description || "",
      image: body.image || "/placeholder.svg?height=200&width=200",
      updatedAt: new Date(),
    }

    if (body.name) {
      updateData.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    }

    console.log("Categories API: Final update data:", updateData)

    // Try to update by id field first, then by _id field
    let result = await db.collection(collections.categories).updateOne({ id }, { $set: updateData })

    if (result.matchedCount === 0) {
      // Try with _id if id field doesn't work
      try {
        result = await db.collection(collections.categories).updateOne({ _id: new ObjectId(id) }, { $set: updateData })
      } catch (e) {
        console.log("Categories API: Failed to update by _id:", e.message)
      }
    }

    console.log("Categories API: Update result:", result)

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 },
      )
    }

    // Fetch the updated category
    let updatedCategory = await db.collection(collections.categories).findOne({ id })
    if (!updatedCategory) {
      updatedCategory = await db.collection(collections.categories).findOne({ _id: new ObjectId(id) })
    }

    console.log("Categories API: Updated category:", updatedCategory)

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: "Category updated successfully",
    })
  } catch (error) {
    console.error("Categories API Update Error:", error)
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
    console.log("Categories API: Deleting category with ID:", params.id)

    const { db } = await connectToDatabase()
    const { id } = params

    // Check if category is being used by products
    const productsUsingCategory = await db.collection(collections.products).countDocuments({
      $or: [{ category: id }, { categoryId: id }],
    })

    console.log("Categories API: Products using this category:", productsUsingCategory)

    if (productsUsingCategory > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category. ${productsUsingCategory} products are using this category.`,
        },
        { status: 400 },
      )
    }

    // Try to delete by id field first, then by _id field
    let result = await db.collection(collections.categories).deleteOne({ id })

    if (result.deletedCount === 0) {
      // Try with _id if id field doesn't work
      try {
        result = await db.collection(collections.categories).deleteOne({ _id: new ObjectId(id) })
      } catch (e) {
        console.log("Categories API: Failed to delete by _id:", e.message)
      }
    }

    console.log("Categories API: Delete result:", result)

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
    console.error("Categories API Delete Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete category",
      },
      { status: 500 },
    )
  }
}
