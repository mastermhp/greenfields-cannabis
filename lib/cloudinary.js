import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

// Helper functions for image upload
export const uploadImage = async (file, folder = "greenfields") => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: "auto",
      transformation: [{ width: 800, height: 800, crop: "fill", quality: "auto" }, { fetch_format: "auto" }],
    })

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw new Error("Failed to upload image")
  }
}

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    throw new Error("Failed to delete image")
  }
}

export const uploadMultipleImages = async (files, folder = "greenfields") => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder))
    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    console.error("Multiple upload error:", error)
    throw new Error("Failed to upload multiple images")
  }
}
