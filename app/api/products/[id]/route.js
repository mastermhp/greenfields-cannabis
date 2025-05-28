import { NextResponse } from "next/server"
import { ProductOperations } from "@/lib/database-operations"

export async function GET(request, { params }) {
  try {
    const { id } = params
    const product = await ProductOperations.getProductById(id)

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Get Product Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    // Process numeric fields
    if (body.price) body.price = Number.parseFloat(body.price)
    if (body.oldPrice) body.oldPrice = Number.parseFloat(body.oldPrice)
    if (body.stock) body.stock = Number.parseInt(body.stock)
    if (body.thcContent) body.thcContent = Number.parseFloat(body.thcContent) / 100
    if (body.cbdContent) body.cbdContent = Number.parseFloat(body.cbdContent) / 100
    if (body.weight) body.weight = Number.parseFloat(body.weight)

    // Update inStock based on stock
    if (body.stock !== undefined) {
      body.inStock = body.stock > 0
    }

    const product = await ProductOperations.updateProduct(id, body)

    return NextResponse.json({
      success: true,
      data: product,
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error("Update Product Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const deleted = await ProductOperations.deleteProduct(id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Delete Product Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
