import { NextResponse } from "next/server"
import { uploadImage } from "@/lib/cloudinary"

export async function POST(request) {
  try {
    // Check if the request is multipart/form-data
    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          success: false,
          error: "Request must be multipart/form-data",
        },
        { status: 400 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const folder = formData.get("folder") || "greenfields"

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 },
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileType = file.type
    const fileSize = file.size

    // Validate file type
    if (!fileType.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          error: "Only image files are allowed",
        },
        { status: 400 },
      )
    }

    // Validate file size (5MB max)
    if (fileSize > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds 5MB limit",
        },
        { status: 400 },
      )
    }

    // Convert buffer to base64 for Cloudinary
    const base64Data = `data:${fileType};base64,${buffer.toString("base64")}`

    // Upload to Cloudinary
    const result = await uploadImage(base64Data, folder)

    return NextResponse.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload file",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
