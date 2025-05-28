import { NextResponse } from "next/server"
import { uploadImage } from "@/lib/cloudinary"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files")
    const folder = formData.get("folder") || "greenfields"

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "No files provided" }, { status: 400 })
    }

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Convert buffer to base64 data URL
      const base64 = buffer.toString("base64")
      const dataUrl = `data:${file.type};base64,${base64}`

      return uploadImage(dataUrl, folder)
    })

    const results = await Promise.all(uploadPromises)

    return NextResponse.json({
      success: true,
      data: results,
      message: "Images uploaded successfully",
    })
  } catch (error) {
    console.error("Upload Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload images",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
