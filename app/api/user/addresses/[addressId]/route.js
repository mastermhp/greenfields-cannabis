import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function PUT(request, { params }) {
  try {
    const { addressId } = await params

    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, street, city, state, zip, country, default: isDefault } = body

    // Validate required fields
    if (!name || !street || !city || !state || !zip) {
      return NextResponse.json({ success: false, error: "All address fields are required" }, { status: 400 })
    }

    const updateData = {
      name: name.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      country: country || "United States",
      default: isDefault || false,
      updatedAt: new Date(),
    }

    const result = await UserOperations.updateUserAddress(auth.userId, addressId, updateData)

    return NextResponse.json({
      success: true,
      data: result,
      message: "Address updated successfully",
    })
  } catch (error) {
    console.error("Update address error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { addressId } = await params

    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const result = await UserOperations.deleteUserAddress(auth.userId, addressId)

    return NextResponse.json({
      success: true,
      data: result,
      message: "Address deleted successfully",
    })
  } catch (error) {
    console.error("Delete address error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
