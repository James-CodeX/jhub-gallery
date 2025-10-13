import apiClient from './client';
import type { Folder, FolderTree, FolderWithContents, FolderStats } from '@/types';

export const foldersApi = {
  // Get folder tree
  async getTree(): Promise<FolderTree[]> {
    return apiClient.get<FolderTree[]>('/folders/tree');
  },

  // Search folders
  async search(query: string): Promise<Folder[]> {
    return apiClient.get<Folder[]>(`/folders/search?q=${encodeURIComponent(query)}`);
  },

  // Create folder
  async create(data: { name: string; parentId: string | null }): Promise<Folder> {
    return apiClient.post<Folder>('/folders', data);
  },

  // Get folder by ID with contents
  async getById(id: string): Promise<FolderWithContents> {
    return apiClient.get<FolderWithContents>(`/folders/${id}`);
  },

  // Get folder statistics
  async getStats(id: string): Promise<FolderStats> {
    return apiClient.get<FolderStats>(`/folders/${id}/stats`);
  },

  // Update folder (rename)
  async update(id: string, data: { name: string }): Promise<Folder> {
    return apiClient.put<Folder>(`/folders/${id}`, data);
  },

  // Delete folder
  async delete(id: string): Promise<{ deletedFiles: string[] }> {
    return apiClient.delete<{ deletedFiles: string[] }>(`/folders/${id}`);
  },
};
