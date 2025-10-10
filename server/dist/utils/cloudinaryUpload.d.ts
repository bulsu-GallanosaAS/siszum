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
declare const uploadToCloudinary: (fileBuffer: Buffer, folder?: string) => Promise<CloudinaryUploadResult>;
declare const deleteFromCloudinary: (publicId: string) => Promise<CloudinaryDeleteResult>;
export { uploadToCloudinary, deleteFromCloudinary };
//# sourceMappingURL=cloudinaryUpload.d.ts.map