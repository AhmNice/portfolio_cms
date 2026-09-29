import { create } from "zustand";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";
import type {
  CloudinaryUploadOptions,
  CloudinaryUploadSignature,
} from "../interface/cloudinary.interface";
import axios from "../lib/axios";
import { toast } from "react-hot-toast/headless";
interface UploadActions {
  getSignature: (
    data: CloudinaryUploadOptions,
  ) => Promise<CloudinaryUploadSignature>;
  upload: (
    file: File,
    signature: CloudinaryUploadSignature,
  ) => Promise<uploadResult>;
}
interface uploadResult {
  success: boolean;
  url: string;
}
export const useUploadStore = create<UploadActions>(() => ({
  getSignature: async (data: CloudinaryUploadOptions) => {
    return new Promise<CloudinaryUploadSignature>((resolve, reject) => {
      handleRequest({
        request: () => api.post("/upload/signature", data),
        onSuccess: (data) => {
          resolve(data.data as CloudinaryUploadSignature);
        },
        onError: (error) => {
          reject(error);
        },
        showToast: false,
      });
    });
  },
  upload: async (file: File, signature: CloudinaryUploadSignature) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.api_key);
    formData.append("timestamp", signature.timestamp.toString());
    formData.append("signature", signature.signature);
    formData.append("folder", signature.folder);
    if (signature.publicId) {
      formData.append("public_id", signature.publicId);
    }
    formData.append("resource_type", signature.resourceType);
    try{
      const response = await axios.post(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, formData, {
        withCredentials: false,
        headers:{
          "Content-Type": "multipart/form-data",
        }
      })
      return {
        success: true,
        url: response.data.secure_url,
      }
    }catch{
      toast.error("Failed to upload image. Please try again.");
      return {
        success: false,
        url: "",
      }
    }
  }
}));
