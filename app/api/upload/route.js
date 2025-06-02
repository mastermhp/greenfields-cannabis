import { NextResponse } from "next/server"
import { uploadImage, deleteImage } from "@/lib/cloudinary"

export async function POST(request) {
  try {
    // For now, let's skip authentication to test the upload functionality
    // We can add it back once we confirm the upload works
    console.log("Upload request received")

    // Check if request is multipart form data
    const contentType = request.headers.get("content-type")
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return NextResponse.json({ success: false, error: "Invalid request format" }, { status: 400 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file")
    const folder = formData.get("folder") || "greenfields"

    console.log("File received:", file?.name, "Size:", file?.size)

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Only image files are allowed" }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Convert file to base64 for Cloudinary upload
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`

    console.log("Uploading to Cloudinary...")

    // Upload to Cloudinary
    const result = await uploadImage(base64String, folder)

    console.log("Upload successful:", result.public_id)

    return NextResponse.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ success: false, error: "Failed to upload file: " + error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    // For now, let's skip authentication to test the delete functionality
    console.log("Delete request received")

    const body = await request.json()
    const { public_id } = body

    if (!public_id) {
      return NextResponse.json({ success: false, error: "No public_id provided" }, { status: 400 })
    }

    console.log("Deleting from Cloudinary:", public_id)

    // Delete from Cloudinary
    const result = await deleteImage(public_id)

    console.log("Delete successful:", result)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete file: " + error.message }, { status: 500 })
  }
}
