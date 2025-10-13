import apiClient from './client';
import type { PresignedUploadUrl, UploadSession, CompleteUploadData, PhotoFile } from '@/types';

export const uploadApi = {
  // Initiate single file upload
  async initiate(data: {
    filename: string;
    folderId: string;
    mimeType: string;
  }): Promise<PresignedUploadUrl> {
    return apiClient.post<PresignedUploadUrl>('/upload/initiate', data);
  },

  // Complete upload
  async complete(data: CompleteUploadData): Promise<PhotoFile> {
    return apiClient.post<PhotoFile>('/upload/complete', data);
  },

  // Initiate batch upload
  async batch(data: {
    files: Array<{ filename: string; mimeType: string }>;
    folderId: string;
  }): Promise<UploadSession> {
    return apiClient.post<UploadSession>('/upload/batch', data);
  },

  // Update upload session
  async updateSession(
    sessionId: string,
    data: { completedFiles: number; failedFiles: number }
  ): Promise<UploadSession> {
    return apiClient.put<UploadSession>(`/upload/session/${sessionId}`, data);
  },

  // Upload file to MinIO
  async uploadToMinio(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return apiClient.uploadFile(url, file, onProgress);
  },
};
