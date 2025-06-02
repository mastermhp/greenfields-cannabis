import { NextResponse } from "next/server"
import { UserOperations } from "@/lib/database-operations"
import { verifyAuth } from "@/lib/auth"
import { cloudinary } from "@/lib/cloudinary"

export async function POST(request) {
  try {
    console.log("Starting avatar upload process...")

    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      console.log("Authentication failed:", authError)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("User authenticated:", auth.userId)

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      console.log("No file provided")
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    console.log("File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.log("Invalid file type:", file.type)
      return NextResponse.json({ success: false, error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log("File too large:", file.size)
      return NextResponse.json({ success: false, error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Get current user to check for existing profile picture
    console.log("Fetching user data...")
    const user = await UserOperations.getUserById(auth.userId)
    if (!user) {
      console.log("User not found:", auth.userId)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    console.log("User found, existing profile picture:", user.profilePictureId)

    // Delete existing profile picture if it exists
    if (user.profilePictureId) {
      try {
        console.log("Deleting existing profile picture:", user.profilePictureId)
        await cloudinary.uploader.destroy(user.profilePictureId)
        console.log("Existing profile picture deleted successfully")
      } catch (cloudinaryError) {
        console.error("Error deleting existing profile picture:", cloudinaryError)
        // Continue with upload even if deletion fails
      }
    }

    // Convert file to buffer
    console.log("Converting file to buffer...")
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log("Uploading to Cloudinary...")

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "user-avatars",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto", fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error)
              reject(error)
            } else {
              console.log("Cloudinary upload success:", {
                public_id: result.public_id,
                secure_url: result.secure_url,
              })
              resolve(result)
            }
          },
        )
        .end(buffer)
    })

    console.log("Updating user profile with new image...")

    // Update user profile with new image
    const updateData = {
      profilePicture: uploadResult.secure_url,
      profilePictureId: uploadResult.public_id,
      updatedAt: new Date(),
    }

    await UserOperations.updateUser(auth.userId, updateData)

    console.log("User profile updated successfully")

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      message: "Profile picture uploaded successfully",
    })
  } catch (error) {
    console.error("Upload avatar error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request) {
  try {
    console.log("Starting avatar deletion process...")

    // Verify authentication
    const { auth, error: authError } = await verifyAuth(request)
    if (authError || !auth) {
      console.log("Authentication failed:", authError)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("User authenticated:", auth.userId)

    // Get current user
    const user = await UserOperations.getUserById(auth.userId)
    if (!user) {
      console.log("User not found:", auth.userId)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    console.log("User found, profile picture ID:", user.profilePictureId)

    // Delete from Cloudinary if exists
    if (user.profilePictureId) {
      try {
        console.log("Deleting from Cloudinary:", user.profilePictureId)
        await cloudinary.uploader.destroy(user.profilePictureId)
        console.log("Cloudinary deletion successful")
      } catch (cloudinaryError) {
        console.error("Error deleting profile picture from Cloudinary:", cloudinaryError)
        // Continue with database update even if Cloudinary deletion fails
      }
    }

    console.log("Updating user profile to remove image...")

    // Update user profile to remove image
    const updateData = {
      profilePicture: "",
      profilePictureId: "",
      updatedAt: new Date(),
    }

    await UserOperations.updateUser(auth.userId, updateData)

    console.log("User profile updated successfully")

    return NextResponse.json({
      success: true,
      message: "Profile picture removed successfully",
    })
  } catch (error) {
    console.error("Remove avatar error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
