import apiClient from './client';
import type { PhotoFile, FileWithFolder } from '@/types';

export const filesApi = {
  // Get file by ID
  async getById(id: string): Promise<FileWithFolder> {
    return apiClient.get<FileWithFolder>(`/files/${id}`);
  },

  // Delete file
  async delete(id: string): Promise<{ minioKey: string; thumbnailKey: string | null }> {
    return apiClient.delete(`/files/${id}`);
  },
};
