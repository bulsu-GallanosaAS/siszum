import cloudinary from "../config/cloudinary";

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
}

export interface CloudinaryDeleteResult {
  result: string;
}

const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = "inventory"
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
          { format: "webp" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as CloudinaryUploadResult);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

const deleteFromCloudinary = async (
  publicId: string
): Promise<CloudinaryDeleteResult> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result as CloudinaryDeleteResult;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

export { uploadToCloudinary, deleteFromCloudinary };
