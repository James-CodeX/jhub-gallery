import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Folder, FolderTree, FolderWithContents, FolderStats } from '@/types';

// Query keys
export const folderKeys = {
  all: ['folders'] as const,
  tree: () => [...folderKeys.all, 'tree'] as const,
  detail: (id: string) => [...folderKeys.all, 'detail', id] as const,
  stats: (id: string) => [...folderKeys.all, 'stats', id] as const,
  search: (query: string) => [...folderKeys.all, 'search', query] as const,
};

// Get folder tree
export function useFolderTree(
  options?: UseQueryOptions<FolderTree[], Error>
) {
  return useQuery({
    queryKey: folderKeys.tree(),
    queryFn: () => api.folders.getTree(),
    ...options,
  });
}

// Get folder by ID
export function useFolder(
  id: string,
  options?: UseQueryOptions<FolderWithContents, Error>
) {
  return useQuery({
    queryKey: folderKeys.detail(id),
    queryFn: () => api.folders.getById(id),
    enabled: !!id,
    ...options,
  });
}

// Get folder stats
export function useFolderStats(
  id: string,
  options?: UseQueryOptions<FolderStats, Error>
) {
  return useQuery({
    queryKey: folderKeys.stats(id),
    queryFn: () => api.folders.getStats(id),
    enabled: !!id,
    ...options,
  });
}

// Search folders
export function useSearchFolders(
  query: string,
  options?: UseQueryOptions<Folder[], Error>
) {
  return useQuery({
    queryKey: folderKeys.search(query),
    queryFn: () => api.folders.search(query),
    enabled: query.length > 0,
    ...options,
  });
}

// Create folder mutation
export function useCreateFolder(
  options?: UseMutationOptions<Folder, Error, { name: string; parentId: string | null }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.folders.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.tree() });
    },
    ...options,
  });
}

// Update folder mutation
export function useUpdateFolder(
  options?: UseMutationOptions<Folder, Error, { id: string; name: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }) => api.folders.update(id, { name }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: folderKeys.tree() });
      queryClient.invalidateQueries({ queryKey: folderKeys.detail(data.id) });
    },
    ...options,
  });
}

// Delete folder mutation
export function useDeleteFolder(
  options?: UseMutationOptions<{ deletedFiles: string[] }, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.folders.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.tree() });
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
    },
    ...options,
  });
}
