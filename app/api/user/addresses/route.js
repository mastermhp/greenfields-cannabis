import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"

export async function GET(request) {
  try {
    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const addresses = await UserOperations.getUserAddresses(auth.userId)

    return NextResponse.json({
      success: true,
      data: addresses || [],
    })
  } catch (error) {
    console.error("Get addresses error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
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

    const addressData = {
      userId: auth.userId,
      name: name.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      country: country || "United States",
      default: isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await UserOperations.addUserAddress(addressData)

    return NextResponse.json({
      success: true,
      data: result,
      message: "Address added successfully",
    })
  } catch (error) {
    console.error("Add address error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
