import apiClient from './client';
import type { ShareLink, SharedContent } from '@/types';

export const shareApi = {
  // Get all share links
  async getAll(): Promise<ShareLink[]> {
    return apiClient.get<ShareLink[]>('/share');
  },

  // Create folder share link
  async createFolderLink(
    folderId: string,
    data: { title?: string; description?: string; expiryDays?: number }
  ): Promise<ShareLink> {
    return apiClient.post<ShareLink>(`/share/folder/${folderId}`, data);
  },

  // Create file share link
  async createFileLink(
    fileId: string,
    data: { title?: string; description?: string; expiryDays?: number }
  ): Promise<ShareLink> {
    return apiClient.post<ShareLink>(`/share/file/${fileId}`, data);
  },

  // Access shared content by token
  async getByToken(token: string): Promise<SharedContent> {
    return apiClient.get<SharedContent>(`/share/${token}`);
  },

  // Get share links for a resource
  async getResourceLinks(type: 'folder' | 'file', id: string): Promise<ShareLink[]> {
    return apiClient.get<ShareLink[]>(`/share/resource/${type}/${id}`);
  },

  // Deactivate share link
  async deactivate(id: string): Promise<ShareLink> {
    return apiClient.delete<ShareLink>(`/share/${id}`);
  },
};
