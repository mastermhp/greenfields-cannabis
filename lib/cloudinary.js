import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Export the cloudinary instance
export { cloudinary }

export async function uploadImage(base64String, folder = "greenfields") {
  try {
    console.log("Cloudinary config check:", {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
    })

    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: "auto",
      quality: "auto",
      fetch_format: "auto",
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: "limit",
          quality: "auto:good",
        },
      ],
    })

    console.log("Cloudinary upload result:", {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
    })

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw new Error(`Cloudinary upload failed: ${error.message}`)
  }
}

export async function deleteImage(publicId) {
  try {
    console.log("Deleting image from Cloudinary:", publicId)

    const result = await cloudinary.uploader.destroy(publicId)

    console.log("Cloudinary delete result:", result)

    return result
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    throw new Error(`Cloudinary delete failed: ${error.message}`)
  }
}

export async function getImageDetails(publicId) {
  try {
    const result = await cloudinary.api.resource(publicId)
    return result
  } catch (error) {
    console.error("Cloudinary get details error:", error)
    throw new Error(`Failed to get image details: ${error.message}`)
  }
}

export function generateImageUrl(publicId, transformations = {}) {
  try {
    return cloudinary.url(publicId, {
      secure: true,
      ...transformations,
    })
  } catch (error) {
    console.error("Cloudinary URL generation error:", error)
    return null
  }
}
