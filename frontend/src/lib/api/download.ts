import apiClient from './client';
import type { DownloadStats } from '@/types';

export const downloadApi = {
  // Download file (redirects to presigned URL)
  async downloadFile(id: string): Promise<void> {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/download/file/${id}`;
    window.location.href = url;
  },

  // Get file download URL
  async getFileUrl(id: string): Promise<{ downloadUrl: string }> {
    return apiClient.get<{ downloadUrl: string }>(`/download/file/${id}/url`);
  },

  // Download folder as ZIP
  async downloadFolder(id: string, folderName: string): Promise<void> {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/download/folder/${id}`;
    await apiClient.downloadFile(url, `${folderName}.zip`);
  },

  // Get folder download stats
  async getFolderStats(id: string): Promise<DownloadStats> {
    return apiClient.get<DownloadStats>(`/download/folder/${id}/stats`);
  },
};
