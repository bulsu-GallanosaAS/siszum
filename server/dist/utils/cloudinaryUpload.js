"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadToCloudinary = (fileBuffer, folder = "inventory") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
            folder: folder,
            resource_type: "image",
            transformation: [
                { width: 800, height: 600, crop: "limit" },
                { quality: "auto" },
                { format: "webp" },
            ],
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
        uploadStream.end(fileBuffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary_1.default.uploader.destroy(publicId);
        return result;
    }
    catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        throw error;
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
//# sourceMappingURL=cloudinaryUpload.js.map