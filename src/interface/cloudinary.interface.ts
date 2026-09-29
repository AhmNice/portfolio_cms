export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format?: string;
  width?: number;
  height?: number;
}

export interface CloudinaryUploadOptions {
  folder: string;
  publicId?: string;
  resourceType?: "image" | "raw" | "video" | "auto";
}

export interface CloudinaryUploadSignature {
  api_key: string;
  cloudName:string;
  signature: string;
  timestamp: number;
  folder: string;
  publicId?: string;
  resourceType: "image" | "video" | "raw" | "auto";
}