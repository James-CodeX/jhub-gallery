import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { folderKeys } from './useFolders';
import type { PhotoFile, PresignedUploadUrl, UploadSession, CompleteUploadData } from '@/types';

// Initiate upload mutation
export function useInitiateUpload(
  options?: UseMutationOptions<
    PresignedUploadUrl,
    Error,
    { filename: string; folderId: string; mimeType: string }
  >
) {
  return useMutation({
    mutationFn: (data) => api.upload.initiate(data),
    ...options,
  });
}

// Complete upload mutation
export function useCompleteUpload(
  options?: UseMutationOptions<PhotoFile, Error, CompleteUploadData>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.upload.complete(data),
    onSuccess: (data) => {
      // Invalidate folder contents
      queryClient.invalidateQueries({ 
        queryKey: folderKeys.detail(data.folder_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: folderKeys.stats(data.folder_id) 
      });
    },
    ...options,
  });
}

// Batch upload mutation
export function useBatchUpload(
  options?: UseMutationOptions<
    UploadSession,
    Error,
    { files: Array<{ filename: string; mimeType: string }>; folderId: string }
  >
) {
  return useMutation({
    mutationFn: (data) => api.upload.batch(data),
    ...options,
  });
}

// Delete file mutation
export function useDeleteFile(
  options?: UseMutationOptions<
    { minioKey: string; thumbnailKey: string | null },
    Error,
    { id: string; folderId: string }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => api.files.delete(id),
    onSuccess: (_, variables) => {
      // Invalidate folder contents
      queryClient.invalidateQueries({ 
        queryKey: folderKeys.detail(variables.folderId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: folderKeys.stats(variables.folderId) 
      });
    },
    ...options,
  });
}

// Custom hook for complete upload flow
export function useFileUpload() {
  const initiateUpload = useInitiateUpload();
  const completeUpload = useCompleteUpload();

  const uploadFile = async (
    file: File,
    folderId: string,
    onProgress?: (progress: number) => void
  ): Promise<PhotoFile> => {
    // Step 1: Initiate upload
    const { uploadUrl, fileId, minioKey } = await initiateUpload.mutateAsync({
      filename: file.name,
      folderId,
      mimeType: file.type,
    });

    // Step 2: Upload to MinIO
    await api.upload.uploadToMinio(uploadUrl, file, onProgress);

    // Step 3: Complete upload
    const uploadedFile = await completeUpload.mutateAsync({
      fileId,
      folderId,
      filename: file.name,
      originalName: file.name,
      minioKey,
      size: file.size,
      mimeType: file.type,
    });

    return uploadedFile;
  };

  return {
    uploadFile,
    isUploading: initiateUpload.isPending || completeUpload.isPending,
    error: initiateUpload.error || completeUpload.error,
  };
}
