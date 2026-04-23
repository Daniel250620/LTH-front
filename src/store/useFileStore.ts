import { create } from "zustand";

interface FileUploadResponse {
  id: string;
  url: string;
  [key: string]: any;
}

interface FileStore {
  isUploading: boolean;
  error: string | null;
  uploadFile: (file: File) => Promise<FileUploadResponse | null>;
}

const API_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const API_URL = `${API_BACKEND}/files/upload`;

export const useFileStore = create<FileStore>((set) => ({
  isUploading: false,
  error: null,

  uploadFile: async (file: File) => {
    set({ isUploading: true, error: null });
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir el archivo");
      }

      const data: FileUploadResponse = await response.json();
      set({ isUploading: false });
      return data;
    } catch (error) {
      set({
        error: (error as Error).message || "Error al subir el archivo",
        isUploading: false,
      });
      return null;
    }
  },
}));
